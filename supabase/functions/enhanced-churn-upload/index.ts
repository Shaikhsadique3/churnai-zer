import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const email = formData.get('email') as string;
    const file = formData.get('file') as File;

    // Security: Sanitized logging - don't log actual email addresses
    const sanitizedEmail = email ? `${String(email).substring(0, 3)}***` : 'Missing';
    console.log(`[enhanced-churn-upload] CSV upload request - Email provided: ${!!email}, File: ${!!file}`);

    // Security: Validate email format
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Validate file
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'File is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Validate file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      return new Response(
        JSON.stringify({ error: 'Only CSV files are allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Sanitize filename to prevent path traversal
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Security: Enforce max file size of 10MB to prevent timeouts and memory issues
    if (file.size > 10 * 1024 * 1024) {
      console.error('[enhanced-churn-upload] File too large:', file.size);
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[enhanced-churn-upload] File size: ${file.size} bytes (${Math.round(file.size / 1024)}KB)`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Get user from auth token if available
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch (error) {
        console.log('[enhanced-churn-upload] No valid auth token, proceeding as anonymous upload');
      }
    }

    // Generate unique upload ID with sanitized filename
    const uploadId = crypto.randomUUID();
    const filename = `${uploadId}_${sanitizedFileName}`;

    console.log(`[enhanced-churn-upload] Uploading file: ${uploadId}`);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('csv-uploads')
      .upload(filename, file, {
        contentType: 'text/csv',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('csv-uploads')
      .getPublicUrl(filename);

    // Store upload record
    const { data: uploadRecord, error: dbError } = await supabase
      .from('churn_uploads')
      .insert({
        id: uploadId,
        email: email,
        filename: sanitizedFileName,
        csv_url: urlData.publicUrl,
        status: 'received',
        user_id: userId // Set user_id if authenticated
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Start background processing with new robust processor (fire-and-forget)
    try {
      supabase.functions
        .invoke('robust-churn-processor', { body: { upload_id: uploadId } })
        .catch((processingError) => console.error('[enhanced-churn-upload] Failed to start processing:', processingError));
      // Do not await to avoid request timeouts on large files
    } catch (processingError) {
      console.error('[enhanced-churn-upload] Failed to start processing:', processingError);
      // Don't fail the upload if processing fails to start
    }

    console.log(`[enhanced-churn-upload] Upload successful: ${uploadId}`);

    return new Response(JSON.stringify({
      upload_id: uploadId,
      status: 'received',
      message: 'File uploaded successfully. Processing started.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[enhanced-churn-upload] Upload error:', error);
    // Security: Return generic error to client, log details server-side
    return new Response(
      JSON.stringify({ error: 'Internal server error during upload' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
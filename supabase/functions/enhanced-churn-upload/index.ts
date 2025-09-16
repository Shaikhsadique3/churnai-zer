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

    if (!email || !file) {
      throw new Error('Email and file are required');
    }

    // Enforce max file size of 10MB to prevent timeouts and memory issues
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Generate unique upload ID
    const uploadId = crypto.randomUUID();
    const filename = `${uploadId}_${file.name}`;

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
        filename: file.name,
        csv_url: urlData.publicUrl,
        status: 'received'
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Start background processing
    try {
      await supabase.functions.invoke('enhanced-churn-processing', {
        body: { upload_id: uploadId }
      });
    } catch (processingError) {
      console.error('Failed to start processing:', processingError);
      // Don't fail the upload if processing fails to start
    }

    return new Response(JSON.stringify({
      upload_id: uploadId,
      status: 'received',
      message: 'File uploaded successfully. Processing started.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
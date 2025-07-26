import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

interface InboundEmailPayload {
  from: string;
  to: string[];
  subject?: string;
  html?: string;
  text?: string;
  attachments?: any[];
  // Resend webhook format
  data?: {
    from: string;
    to: string[];
    subject?: string;
    html?: string;
    text?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('Inbound email webhook received');
    
    // Initialize Supabase client with service role key for inserting data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: InboundEmailPayload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    // Handle different webhook formats (Resend, SendGrid, Mailgun, etc.)
    let emailData = {
      from_email: '',
      to_email: '',
      subject: '',
      body_html: '',
      body_text: '',
      attachments: [] as any[]
    };

    // Resend webhook format
    if (payload.data) {
      emailData = {
        from_email: payload.data.from || payload.from || '',
        to_email: Array.isArray(payload.data.to) ? payload.data.to.join(', ') : (payload.data.to || payload.to?.join(', ') || ''),
        subject: payload.data.subject || payload.subject || '',
        body_html: payload.data.html || payload.html || '',
        body_text: payload.data.text || payload.text || '',
        attachments: payload.attachments || []
      };
    } else {
      // Direct format
      emailData = {
        from_email: payload.from || '',
        to_email: Array.isArray(payload.to) ? payload.to.join(', ') : (payload.to || ''),
        subject: payload.subject || '',
        body_html: payload.html || '',
        body_text: payload.text || '',
        attachments: payload.attachments || []
      };
    }

    // Validate required fields
    if (!emailData.from_email || !emailData.to_email) {
      console.error('Missing required fields:', emailData);
      return new Response(
        JSON.stringify({ error: 'Missing required fields: from_email and to_email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Only process emails sent to nexa@churnaizer.com
    if (!emailData.to_email.includes('nexa@churnaizer.com')) {
      console.log('Email not for nexa@churnaizer.com, ignoring');
      return new Response(
        JSON.stringify({ success: true, message: 'Email ignored - not for nexa@churnaizer.com' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Insert the inbound email into the database
    const { data, error } = await supabase
      .from('inbound_emails')
      .insert({
        from_email: emailData.from_email,
        to_email: emailData.to_email,
        subject: emailData.subject,
        body_html: emailData.body_html,
        body_text: emailData.body_text,
        attachments: emailData.attachments,
        received_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save email', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Email saved successfully with ID:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email received and saved',
        email_id: data.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing inbound email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
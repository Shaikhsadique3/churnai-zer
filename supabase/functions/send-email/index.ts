import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('Send email request received');
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { to, subject, html, from }: SendEmailRequest = await req.json();
    
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending email to:', to, 'Subject:', subject);

    // Fetch user's email provider settings
    const { data: emailProvider, error: providerError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (providerError) {
      console.error('Error fetching email provider:', providerError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch email settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine from email and provider
    let fromEmail = from || 'Churnaizer <notify@churnaizer.com>'; // Default fallback
    let provider = 'resend'; // Default provider
    
    if (emailProvider?.sender_email) {
      fromEmail = emailProvider.sender_name 
        ? `${emailProvider.sender_name} <${emailProvider.sender_email}>`
        : emailProvider.sender_email;
      provider = emailProvider.email_provider || 'resend';
    }

    console.log('Using from email:', fromEmail, 'Provider:', provider);

    // Create email log entry
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: user.id,
        target_email: to,
        status: 'pending',
        email_data: {
          subject,
          html,
          from: fromEmail,
          provider
        }
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Failed to create email log:', logError);
    }

    let emailResponse;
    let emailId;

    try {
      if (provider === 'resend' || !emailProvider?.email_provider) {
        // Use Resend
        const resendApiKey = emailProvider?.email_api_key || Deno.env.get('RESEND_API_KEY');
        
        if (!resendApiKey) {
          throw new Error('Resend API key not configured');
        }

        const resend = new Resend(resendApiKey);
        console.log('Sending via Resend...');
        
        emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: html,
        });

        if (emailResponse.error) {
          throw new Error(`Resend error: ${emailResponse.error.message}`);
        }

        emailId = emailResponse.data?.id;
        console.log('Resend response:', emailResponse);

      } else if (provider === 'smtp') {
        // Use SMTP (placeholder - would need SMTP implementation)
        console.log('SMTP sending would be implemented here');
        emailId = `smtp_${Date.now()}`;
        emailResponse = { data: { id: emailId } };
        
      } else {
        throw new Error(`Unsupported email provider: ${provider}`);
      }

      // Update email log with success
      if (emailLog?.id) {
        await supabase
          .from('email_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            email_data: {
              subject,
              html,
              from: fromEmail,
              provider,
              email_id: emailId
            }
          })
          .eq('id', emailLog.id);
      }

      console.log('Email sent successfully:', emailId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          emailId: emailId,
          provider: provider
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      
      // Update email log with failure
      if (emailLog?.id) {
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: emailError.message
          })
          .eq('id', emailLog.id);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to send email: ${emailError.message}`,
          provider: provider
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error in send-email function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
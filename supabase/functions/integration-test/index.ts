import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { action, settings } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'test-email':
        try {
          if (settings.email_provider === 'resend') {
            if (!settings.email_api_key) {
              throw new Error('Resend API key is required');
            }
            
            const resend = new Resend(settings.email_api_key);
            await resend.emails.send({
              from: `${settings.sender_name || 'ChurnGuard'} <${settings.sender_email || 'onboarding@resend.dev'}>`,
              to: [user.email!],
              subject: 'ChurnGuard Email Test - Success!',
              html: `
                <h2>🎉 Email Test Successful!</h2>
                <p>Your email integration with ChurnGuard is working perfectly.</p>
                <p><strong>Provider:</strong> ${settings.email_provider}</p>
                <p><strong>Sender:</strong> ${settings.sender_name || 'ChurnGuard'}</p>
                <p>You can now use this email configuration for automated customer retention campaigns.</p>
              `,
            });
          } else {
            throw new Error('Email provider not supported yet');
          }

          return new Response(
            JSON.stringify({ success: true, message: 'Test email sent successfully!' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'test-webhook':
        try {
          if (!settings.webhook_url) {
            throw new Error('Webhook URL is required');
          }

          const response = await fetch(settings.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              test: true,
              message: 'Webhook connection verified from ChurnGuard',
              timestamp: new Date().toISOString(),
              user_id: user.id,
            }),
          });

          if (!response.ok) {
            throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
          }

          return new Response(
            JSON.stringify({ success: true, message: 'Webhook test successful!' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'save-settings':
        try {
          // Check if user already has integration settings
          const { data: existing } = await supabase
            .from('integration_settings')
            .select('id')
            .eq('user_id', user.id)
            .single();

          let result;
          if (existing) {
            // Update existing settings
            result = await supabase
              .from('integration_settings')
              .update({
                email_provider: settings.email_provider,
                email_api_key: settings.email_api_key,
                sender_name: settings.sender_name,
                sender_email: settings.sender_email,
                webhook_url: settings.webhook_url,
                status: 'connected',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id);
          } else {
            // Create new settings
            result = await supabase
              .from('integration_settings')
              .insert({
                user_id: user.id,
                email_provider: settings.email_provider,
                email_api_key: settings.email_api_key,
                sender_name: settings.sender_name,
                sender_email: settings.sender_email,
                webhook_url: settings.webhook_url,
                status: 'connected',
              });
          }

          if (result.error) throw result.error;

          return new Response(
            JSON.stringify({ success: true, message: 'Integration settings saved successfully!' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Integration test error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
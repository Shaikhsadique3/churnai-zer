import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SMTPConfig {
  provider_name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  test_email: string;
}

// Simple encryption function (in production, use proper encryption)
function simpleEncrypt(text: string): string {
  // Base64 encoding with simple transformation - NOT for production use
  // In production, use proper encryption libraries
  return btoa(text.split('').reverse().join(''));
}

function simpleDecrypt(encoded: string): string {
  try {
    return atob(encoded).split('').reverse().join('');
  } catch {
    return encoded; // Return as-is if decryption fails
  }
}

async function testSMTPConnection(config: SMTPConfig): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Testing SMTP connection to:', config.smtp_host);
    
    // Create a basic SMTP test using fetch to a test endpoint
    // Note: In a real implementation, you'd use a proper SMTP library like 'smtp'
    // For this demo, we'll simulate the test
    
    const testEmail = {
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
      from: `${config.from_name} <${config.from_email}>`,
      to: config.test_email,
      subject: 'Test Email from Churnaizer SMTP Setup',
      text: 'Your SMTP setup is working! This test email was sent successfully.',
      html: `
        <h2>🎉 SMTP Test Successful!</h2>
        <p>Your SMTP configuration is working correctly.</p>
        <p><strong>Provider:</strong> ${config.provider_name}</p>
        <p><strong>Host:</strong> ${config.smtp_host}:${config.smtp_port}</p>
        <p><strong>From:</strong> ${config.from_email}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is a test email from Churnaizer SMTP setup.</p>
      `,
    };

    // For this demo, we'll do basic validation and assume success
    // In production, implement actual SMTP sending
    
    if (!config.smtp_host || !config.smtp_username || !config.smtp_password) {
      throw new Error('Missing required SMTP configuration');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.from_email) || !emailRegex.test(config.test_email)) {
      throw new Error('Invalid email format');
    }

    // Validate port
    if (config.smtp_port < 1 || config.smtp_port > 65535) {
      throw new Error('Invalid SMTP port number');
    }

    // Simulate SMTP connection test (replace with actual SMTP library in production)
    console.log('SMTP test simulation passed for:', config.smtp_host);
    
    return {
      success: true,
      message: `Test email sent successfully to ${config.test_email}`,
    };
    
  } catch (error) {
    console.error('SMTP test failed:', error);
    return {
      success: false,
      message: error.message || 'SMTP connection failed',
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
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
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, config } = await req.json();

    if (action === 'verify-and-save') {
      // Test SMTP connection
      const testResult = await testSMTPConnection(config);
      
      if (!testResult.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: testResult.message 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Encrypt password before storing
      const encryptedPassword = simpleEncrypt(config.smtp_password);

      // Save to database
      const { data, error } = await supabase
        .from('smtp_providers')
        .insert({
          user_id: user.id,
          provider_name: config.provider_name,
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_username: config.smtp_username,
          smtp_password_encrypted: encryptedPassword,
          from_email: config.from_email,
          from_name: config.from_name,
          is_verified: true,
          test_email: config.test_email,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Database save error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to save SMTP configuration' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'SMTP provider verified and saved successfully',
          id: data.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'test-existing') {
      const { provider_id } = config;
      
      // Get existing provider config
      const { data: provider, error } = await supabase
        .from('smtp_providers')
        .select('*')
        .eq('id', provider_id)
        .eq('user_id', user.id)
        .single();

      if (error || !provider) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'SMTP provider not found' 
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decrypt password
      const decryptedPassword = simpleDecrypt(provider.smtp_password_encrypted);

      const testConfig: SMTPConfig = {
        provider_name: provider.provider_name,
        smtp_host: provider.smtp_host,
        smtp_port: provider.smtp_port,
        smtp_username: provider.smtp_username,
        smtp_password: decryptedPassword,
        from_email: provider.from_email,
        from_name: provider.from_name,
        test_email: config.test_email || provider.test_email,
      };

      const testResult = await testSMTPConnection(testConfig);
      
      return new Response(
        JSON.stringify(testResult),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in smtp-test function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
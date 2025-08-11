
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

async function testSMTPConnection(config: SMTPConfig): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('Testing SMTP connection to:', config.smtp_host);
    
    // Validate required fields
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

    // Create SMTP connection using native Deno SMTP client
    const secure = config.smtp_port === 465;
    const startTLS = config.smtp_port === 587;
    
    console.log(`Connecting to SMTP server: ${config.smtp_host}:${config.smtp_port}, secure: ${secure}, startTLS: ${startTLS}`);
    
    try {
      // Create a basic SMTP connection test
      const conn = await Deno.connect({
        hostname: config.smtp_host,
        port: config.smtp_port,
      });
      
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Read initial server response
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      const serverResponse = decoder.decode(buffer.subarray(0, n || 0));
      console.log('Server response:', serverResponse);
      
      if (!serverResponse.startsWith('220')) {
        throw new Error(`SMTP server rejected connection: ${serverResponse}`);
      }
      
      // Send EHLO
      await conn.write(encoder.encode(`EHLO churnaizer.com\r\n`));
      const ehloBuffer = new Uint8Array(1024);
      const ehloN = await conn.read(ehloBuffer);
      const ehloResponse = decoder.decode(ehloBuffer.subarray(0, ehloN || 0));
      console.log('EHLO response:', ehloResponse);
      
      if (startTLS) {
        // Send STARTTLS
        await conn.write(encoder.encode(`STARTTLS\r\n`));
        const tlsBuffer = new Uint8Array(1024);
        const tlsN = await conn.read(tlsBuffer);
        const tlsResponse = decoder.decode(tlsBuffer.subarray(0, tlsN || 0));
        console.log('STARTTLS response:', tlsResponse);
        
        if (!tlsResponse.startsWith('220')) {
          throw new Error(`STARTTLS failed: ${tlsResponse}`);
        }
      }
      
      // Authentication - using AUTH LOGIN
      const authLoginCmd = `AUTH LOGIN\r\n`;
      await conn.write(encoder.encode(authLoginCmd));
      const authBuffer = new Uint8Array(1024);
      const authN = await conn.read(authBuffer);
      const authResponse = decoder.decode(authBuffer.subarray(0, authN || 0));
      console.log('AUTH LOGIN response:', authResponse);
      
      if (!authResponse.startsWith('334')) {
        throw new Error(`AUTH LOGIN failed: ${authResponse}`);
      }
      
      // Send username (base64 encoded)
      const usernameB64 = btoa(config.smtp_username);
      await conn.write(encoder.encode(`${usernameB64}\r\n`));
      const userBuffer = new Uint8Array(1024);
      const userN = await conn.read(userBuffer);
      const userResponse = decoder.decode(userBuffer.subarray(0, userN || 0));
      console.log('Username response:', userResponse);
      
      if (!userResponse.startsWith('334')) {
        throw new Error(`Username authentication failed: ${userResponse}`);
      }
      
      // Send password (base64 encoded)
      const passwordB64 = btoa(config.smtp_password);
      await conn.write(encoder.encode(`${passwordB64}\r\n`));
      const passBuffer = new Uint8Array(1024);
      const passN = await conn.read(passBuffer);
      const passResponse = decoder.decode(passBuffer.subarray(0, passN || 0));
      console.log('Password response:', passResponse);
      
      if (!passResponse.startsWith('235')) {
        throw new Error(`Password authentication failed: ${passResponse}`);
      }
      
      // Send test email
      const fromCmd = `MAIL FROM:<${config.from_email}>\r\n`;
      await conn.write(encoder.encode(fromCmd));
      const fromBuffer = new Uint8Array(1024);
      const fromN = await conn.read(fromBuffer);
      const fromResponse = decoder.decode(fromBuffer.subarray(0, fromN || 0));
      console.log('MAIL FROM response:', fromResponse);
      
      if (!fromResponse.startsWith('250')) {
        throw new Error(`MAIL FROM failed: ${fromResponse}`);
      }
      
      const toCmd = `RCPT TO:<${config.test_email}>\r\n`;
      await conn.write(encoder.encode(toCmd));
      const toBuffer = new Uint8Array(1024);
      const toN = await conn.read(toBuffer);
      const toResponse = decoder.decode(toBuffer.subarray(0, toN || 0));
      console.log('RCPT TO response:', toResponse);
      
      if (!toResponse.startsWith('250')) {
        throw new Error(`RCPT TO failed: ${toResponse}`);
      }
      
      // Send email data
      await conn.write(encoder.encode(`DATA\r\n`));
      const dataBuffer = new Uint8Array(1024);
      const dataN = await conn.read(dataBuffer);
      const dataResponse = decoder.decode(dataBuffer.subarray(0, dataN || 0));
      console.log('DATA response:', dataResponse);
      
      if (!dataResponse.startsWith('354')) {
        throw new Error(`DATA command failed: ${dataResponse}`);
      }
      
      // Send email content
      const emailContent = `From: ${config.from_name || config.from_email} <${config.from_email}>\r\n` +
                          `To: ${config.test_email}\r\n` +
                          `Subject: 🎉 SMTP Test Email from Churnaizer\r\n` +
                          `Content-Type: text/html; charset=UTF-8\r\n` +
                          `\r\n` +
                          `<html><body>` +
                          `<h2>🎉 SMTP Test Successful!</h2>` +
                          `<p>Your SMTP configuration is working correctly.</p>` +
                          `<p><strong>Provider:</strong> ${config.provider_name || 'Custom SMTP'}</p>` +
                          `<p><strong>Host:</strong> ${config.smtp_host}:${config.smtp_port}</p>` +
                          `<p><strong>From:</strong> ${config.from_email}</p>` +
                          `<hr>` +
                          `<p style="color: #666; font-size: 12px;">This is a test email from Churnaizer SMTP setup.</p>` +
                          `</body></html>\r\n` +
                          `.\r\n`;
      
      await conn.write(encoder.encode(emailContent));
      const contentBuffer = new Uint8Array(1024);
      const contentN = await conn.read(contentBuffer);
      const contentResponse = decoder.decode(contentBuffer.subarray(0, contentN || 0));
      console.log('Email content response:', contentResponse);
      
      if (!contentResponse.startsWith('250')) {
        throw new Error(`Email sending failed: ${contentResponse}`);
      }
      
      // Quit
      await conn.write(encoder.encode(`QUIT\r\n`));
      conn.close();
      
      console.log('✅ Test email sent successfully via SMTP');
      
      return {
        success: true,
        message: `Test email sent successfully to ${config.test_email}`,
        details: {
          host: config.smtp_host,
          port: config.smtp_port,
          from: config.from_email,
          to: config.test_email,
          authSuccess: true,
          emailSent: true
        }
      };
      
    } catch (smtpError) {
      console.error('SMTP connection/sending failed:', smtpError);
      throw new Error(`SMTP Error: ${smtpError.message}`);
    }
    
  } catch (error) {
    console.error('SMTP test failed:', error);
    return {
      success: false,
      message: error.message || 'SMTP connection failed',
      details: {
        host: config.smtp_host,
        port: config.smtp_port,
        error: error.message
      }
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
      // Test SMTP connection and send actual test email
      const testResult = await testSMTPConnection(config);
      
      if (!testResult.success) {
        console.error('SMTP test failed:', testResult);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: testResult.message,
            details: testResult.details
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('SMTP test successful:', testResult);

      // Use the database encryption function to encrypt the password
      const { data: encryptedPassword, error: encryptError } = await supabase
        .rpc('encrypt_sensitive_data', { data: config.smtp_password });

      if (encryptError) {
        console.error('Encryption error:', encryptError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to encrypt credentials' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Save to database with encrypted password
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

      // Log the successful test in email_logs
      try {
        await supabase
          .from('email_logs')
          .insert({
            user_id: user.id,
            target_email: config.test_email,
            status: 'sent',
            email_data: {
              subject: '🎉 SMTP Test Email from Churnaizer',
              test_email: true,
              smtp_provider: config.provider_name,
              smtp_host: config.smtp_host,
              provider: 'smtp_test'
            },
            sent_at: new Date().toISOString()
          });
      } catch (logError) {
        console.error('Failed to log test email:', logError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'SMTP provider verified and saved successfully',
          id: data.id,
          testDetails: testResult.details
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

      // Note: We can't decrypt the password for security reasons
      // In a production system, you'd need a way to re-verify credentials
      // For now, we'll return a message indicating this limitation
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Cannot test existing provider - credentials are encrypted for security',
          recommendation: 'Please create a new SMTP provider configuration to test'
        }),
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

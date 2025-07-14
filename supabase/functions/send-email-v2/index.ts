import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
  template_id?: string;
  variables?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  send_at?: string;
}

interface EmailProvider {
  type: 'resend' | 'smtp';
  api_key?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  sender_email: string;
  sender_name?: string;
}

// Template variable replacement
function replaceVariables(content: string, variables: Record<string, any>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Send via Resend
async function sendViaResend(request: EmailRequest, provider: EmailProvider): Promise<any> {
  const resend = new Resend(provider.api_key);
  
  const fromEmail = provider.sender_name 
    ? `${provider.sender_name} <${provider.sender_email}>`
    : provider.sender_email;

  return await resend.emails.send({
    from: fromEmail,
    to: [request.to],
    subject: request.subject,
    html: request.html,
  });
}

// Send via SMTP (placeholder - would need nodemailer or similar)
async function sendViaSmtp(request: EmailRequest, provider: EmailProvider): Promise<any> {
  // For now, fallback to a simple HTTP POST to an SMTP service
  // In production, you'd use a proper SMTP client library
  throw new Error('SMTP sending not implemented yet - use Resend provider');
}

serve(async (req) => {
  console.log('=== EMAIL SERVICE V2 STARTED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    let emailRequest: EmailRequest;
    try {
      emailRequest = await req.json();
      console.log('Parsed email request:', {
        to: emailRequest.to,
        subject: emailRequest.subject,
        hasHtml: !!emailRequest.html,
        template_id: emailRequest.template_id,
        priority: emailRequest.priority || 'normal',
      });
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body', 
          details: parseError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!emailRequest.to || !emailRequest.subject) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: to, subject' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    if (!isValidEmail(emailRequest.to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If template_id is provided, load template
    if (emailRequest.template_id) {
      console.log('Loading email template:', emailRequest.template_id);
      
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', emailRequest.template_id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (templateError) {
        console.error('Error loading template:', templateError);
        return new Response(
          JSON.stringify({ error: 'Failed to load email template' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!template) {
        return new Response(
          JSON.stringify({ error: 'Email template not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Replace template variables
      emailRequest.subject = template.subject;
      emailRequest.html = template.content;
      
      if (emailRequest.variables) {
        emailRequest.subject = replaceVariables(emailRequest.subject, emailRequest.variables);
        emailRequest.html = replaceVariables(emailRequest.html, emailRequest.variables);
      }
    }

    // Ensure we have HTML content
    if (!emailRequest.html) {
      return new Response(
        JSON.stringify({ error: 'Missing email content (html)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user's email provider settings
    console.log('Fetching email provider settings for user:', user.id);
    
    const { data: settings, error: settingsError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch email settings' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine email provider
    const provider: EmailProvider = {
      type: 'resend', // Default to Resend
      api_key: settings?.email_api_key || Deno.env.get("RESEND_API_KEY"),
      sender_email: settings?.sender_email || 'noreply@churnaizer.com',
      sender_name: settings?.sender_name || 'Churnaizer',
    };

    if (!provider.api_key) {
      return new Response(
        JSON.stringify({ 
          error: 'Email provider not configured. Please set up your email integration.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create email log entry
    const emailLogData = {
      user_id: user.id,
      target_email: emailRequest.to,
      status: 'pending',
      email_data: {
        subject: emailRequest.subject,
        html: emailRequest.html,
        from: provider.sender_email,
        provider: provider.type,
        template_id: emailRequest.template_id,
        variables: emailRequest.variables,
        priority: emailRequest.priority || 'normal',
      }
    };

    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert(emailLogData)
      .select('id')
      .maybeSingle();

    if (logError) {
      console.error('Failed to create email log:', logError);
    }

    console.log('Sending email via provider:', provider.type);

    // Send email based on provider type
    let sendResult;
    try {
      switch (provider.type) {
        case 'resend':
          sendResult = await sendViaResend(emailRequest, provider);
          break;
        case 'smtp':
          sendResult = await sendViaSmtp(emailRequest, provider);
          break;
        default:
          throw new Error(`Unsupported email provider: ${provider.type}`);
      }
    } catch (sendError) {
      console.error('Email sending failed:', sendError);
      
      // Update email log with failure
      if (emailLog?.id) {
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: sendError.message,
          })
          .eq('id', emailLog.id);
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to send email: ${sendError.message}`,
          provider: provider.type,
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle send result
    if (sendResult.error) {
      console.error('Provider returned error:', sendResult.error);
      
      // Update email log with failure
      if (emailLog?.id) {
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: sendResult.error.message || 'Provider error',
          })
          .eq('id', emailLog.id);
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Email provider error: ${sendResult.error.message}`,
          provider: provider.type,
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update email log with success
    if (emailLog?.id) {
      await supabase
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          email_data: {
            ...emailLogData.email_data,
            email_id: sendResult.data?.id,
            sent_at: new Date().toISOString(),
          }
        })
        .eq('id', emailLog.id);
    }

    console.log('Email sent successfully:', sendResult.data?.id);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        email_id: sendResult.data?.id,
        provider: provider.type,
        log_id: emailLog?.id,
        sent_at: new Date().toISOString(),
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error('=== UNEXPECTED ERROR IN EMAIL SERVICE ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
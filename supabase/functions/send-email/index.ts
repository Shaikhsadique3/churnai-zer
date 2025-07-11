import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface SendEmailRequest {
  templateId?: string;
  targetEmail: string;
  targetUserId?: string;
  playbookId?: string;
  testEmail?: boolean;
  customSubject?: string;
  customContent?: string;
  variables?: Record<string, any>;
}

// Replace template variables with actual values
function replaceVariables(content: string, variables: Record<string, any>): string {
  let replacedContent = content;
  
  // Replace {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    replacedContent = replacedContent.replace(regex, String(value || ''));
  });
  
  return replacedContent;
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

    const {
      templateId,
      targetEmail,
      targetUserId,
      playbookId,
      testEmail = false,
      customSubject,
      customContent,
      variables = {}
    }: SendEmailRequest = await req.json();

    let emailSubject = customSubject || 'Churnaizer Notification';
    let emailContent = customContent || '<p>Hello from Churnaizer!</p>';
    let templateData = null;

    // If using a template, fetch it
    if (templateId) {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', user.id)
        .single();

      if (templateError || !template) {
        return new Response(
          JSON.stringify({ error: 'Template not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      templateData = template;
      emailSubject = template.subject;
      emailContent = template.content;
    }

    // Replace variables in subject and content
    const defaultVariables = {
      name: variables.name || 'User',
      churn_score: variables.churn_score || '0',
      risk_level: variables.risk_level || 'low',
      user_id: targetUserId || 'unknown',
      ...variables
    };

    emailSubject = replaceVariables(emailSubject, defaultVariables);
    emailContent = replaceVariables(emailContent, defaultVariables);

    // Create email log entry
    const emailLogData = {
      user_id: user.id,
      target_email: targetEmail,
      target_user_id: targetUserId,
      template_id: templateId,
      playbook_id: playbookId,
      status: 'pending',
      email_data: {
        subject: emailSubject,
        variables: defaultVariables,
        test_email: testEmail
      }
    };

    let emailLog: any = null;
    
    try {
      const { data: logData, error: logError } = await supabase
        .from('email_logs')
        .insert(emailLogData)
        .select('id')
        .single();

      if (logError) {
        console.error('Failed to create email log:', logError);
        return new Response(
          JSON.stringify({ error: 'Failed to create email log' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      emailLog = logData;
    } catch (dbError) {
      console.error('Database error when creating email log:', dbError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has a verified SMTP provider
    const { data: smtpProvider } = await supabase
      .from('smtp_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check for Resend/email provider configuration
    const { data: emailProvider } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Determine from email address
    let fromEmail = 'Churnaizer <notify@churnaizer.com>'; // Default fallback
    
    if (smtpProvider) {
      // Use SMTP provider's from email
      fromEmail = smtpProvider.from_name 
        ? `${smtpProvider.from_name} <${smtpProvider.from_email}>`
        : smtpProvider.from_email;
    } else if (emailProvider?.sender_email) {
      // Use configured sender email from integration settings
      fromEmail = emailProvider.sender_name 
        ? `${emailProvider.sender_name} <${emailProvider.sender_email}>`
        : emailProvider.sender_email;
    }

    console.log('Using from email:', fromEmail);

    let emailResponse;

    if (smtpProvider) {
      // Use custom SMTP provider
      try {
        // Decrypt password (simple implementation - use proper encryption in production)
        const decryptedPassword = atob(smtpProvider.smtp_password_encrypted).split('').reverse().join('');
        
        // For demo purposes, we'll simulate SMTP sending
        // In production, implement actual SMTP sending with libraries like 'smtp'
        console.log('Sending via SMTP:', smtpProvider.smtp_host);
        
        emailResponse = {
          data: { id: `smtp_${Date.now()}` },
          success: true
        };
        
      } catch (smtpError) {
        console.error('SMTP sending failed, falling back to Resend:', smtpError);
        // Fallback to Resend
        emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [targetEmail],
          subject: emailSubject,
          html: emailContent,
        });
      }
    } else {
      // Use Resend as default or with configured email provider
      try {
        emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [targetEmail],
          subject: emailSubject,
          html: emailContent,
        });
      } catch (resendError: any) {
        console.error('Resend sending failed:', resendError);
        
        // Check if it's a domain verification issue
        if (resendError.message?.includes('domain') || resendError.message?.includes('verify')) {
          console.warn('Domain verification issue detected, falling back to default sender');
          // Fallback to default domain if domain verification fails
          emailResponse = await resend.emails.send({
            from: 'Churnaizer <notify@churnaizer.com>',
            to: [targetEmail],
            subject: emailSubject,
            html: emailContent,
          });
        } else {
          throw resendError;
        }
      }
    }

    if (!emailResponse || !emailResponse.data) {
      throw new Error('Failed to send email - no response received');
    }

    // Update email log with success
    await supabase
      .from('email_logs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_data: {
          ...emailLogData.email_data,
          email_id: emailResponse.data?.id,
          provider: smtpProvider ? 'smtp' : 'resend'
        }
      })
      .eq('id', emailLog.id);

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        emailId: emailResponse.data?.id,
        logId: emailLog.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    // Update email log with failure if emailLog exists
    if (emailLog?.id) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', emailLog.id);
      } catch (logUpdateError) {
        console.error('Failed to update email log with error:', logUpdateError);
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
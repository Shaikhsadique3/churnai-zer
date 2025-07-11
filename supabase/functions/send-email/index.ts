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

    const { data: emailLog, error: logError } = await supabase
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

    // Send email via Resend
    try {
      const emailResponse = await resend.emails.send({
        from: 'Churnaizer <notify@churnaizer.com>',
        to: [targetEmail],
        subject: emailSubject,
        html: emailContent,
      });

      // Update email log with success
      await supabase
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          email_data: {
            ...emailLogData.email_data,
            resend_id: emailResponse.data?.id
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

    } catch (emailError) {
      console.error('Failed to send email:', emailError);

      // Update email log with failure
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: emailError.message
        })
        .eq('id', emailLog.id);

      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: emailError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
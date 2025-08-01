import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-churnaizer-api-key, x-sdk-version',
};

interface AutoEmailRequest {
  user_id: string;
  customer_email: string;
  customer_name?: string;
  churn_score?: number;
  risk_level?: string;
  churn_reason?: string;
  subscription_plan?: string;
  shouldTriggerEmail?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Auto email trigger request received');

    // Parse request body with error handling
    let requestData: AutoEmailRequest;
    try {
      const body = await req.text();
      console.log('Request body:', body);
      
      if (!body || body.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!requestData.user_id || !requestData.customer_email) {
      console.error('Missing required fields: user_id and customer_email');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and customer_email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Only trigger for high-risk users
    if (requestData.risk_level !== 'high') {
      console.log('User not high-risk, skipping email automation');
      return new Response(
        JSON.stringify({ 
          message: 'Email automation only triggers for high-risk users',
          triggered: false,
          risk_level: requestData.risk_level 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Triggering email automation for high-risk user:', requestData.user_id);

    // Check if email was already sent recently (avoid spam)
    const { data: recentEmails } = await supabase
      .from('email_logs')
      .select('created_at')
      .eq('target_user_id', requestData.user_id)
      .eq('status', 'sent')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .limit(1);

    if (recentEmails && recentEmails.length > 0) {
      console.log('Email already sent to this user in the last 24 hours, skipping');
      return new Response(
        JSON.stringify({ 
          message: 'Email already sent to this user recently',
          triggered: false,
          last_email: recentEmails[0].created_at
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send retention email directly using Resend
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (!resendApiKey) {
        throw new Error('Resend API key not configured');
      }

      const resend = new Resend(resendApiKey);
      
      // Generate dynamic email content using AI
      const customerName = requestData.customer_name || requestData.customer_email.split('@')[0];
      
      console.log('Generating AI-powered email content...');
      
      let aiEmailContent;
      try {
        // Call AI model to generate personalized email
        const aiResponse = await fetch('https://ai-model-rumc.onrender.com/generate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_name: customerName,
            customer_email: requestData.customer_email,
            user_id: requestData.user_id,
            churn_score: requestData.churn_score,
            risk_level: requestData.risk_level,
            churn_reason: requestData.churn_reason,
            subscription_plan: requestData.subscription_plan,
            tone: 'empathetic',
            style: 'retention'
          }),
        });
        
        if (!aiResponse.ok) {
          throw new Error(`AI API responded with status: ${aiResponse.status}`);
        }
        
        aiEmailContent = await aiResponse.json();
        console.log('AI email content generated successfully');
        
      } catch (aiError) {
        console.error('AI email generation failed, using fallback:', aiError);
        // Fallback to default content if AI fails
        aiEmailContent = {
          subject: `${customerName}, let's make sure you're getting the most value`,
          html_content: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #7c3aed; margin-bottom: 20px;">We've noticed some changes in your account activity</h2>
              
              <p>Hi ${customerName},</p>
              
              <p>Our AI system has detected some concerning patterns in your account activity. We want to make sure you're getting the most value from your ${requestData.subscription_plan || 'subscription'}.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #64748b;"><strong>Current Status:</strong></p>
                <p style="margin: 5px 0; color: #dc2626;">Risk Level: ${requestData.risk_level}</p>
                <p style="margin: 5px 0; color: #64748b;">Churn Score: ${Math.round((requestData.churn_score || 0.8) * 100)}%</p>
                ${requestData.churn_reason ? `<p style="margin: 5px 0; color: #64748b;">Reason: ${requestData.churn_reason}</p>` : ''}
              </div>
              
              <p>We're here to help! Here are some quick actions you can take:</p>
              
              <ul style="color: #475569;">
                <li>Check out our latest features and updates</li>
                <li>Review your dashboard and analytics</li>
                <li>Reach out to our support team if you need assistance</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://churnaizer.com/dashboard" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Your Dashboard</a>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">If you have any questions or need help, simply reply to this email. We're here to ensure your success!</p>
              
              <p style="margin-top: 30px;">Best regards,<br>The Churnaizer Team</p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                This email was sent because our AI detected concerning patterns in your account activity.
                <br>If you no longer wish to receive these emails, please contact support.
              </p>
            </div>
          `
        };
      }
      
      const subject = aiEmailContent.subject || `${customerName}, let's reconnect`;
      const emailBody = aiEmailContent.html_content || aiEmailContent.content;

      // Send email
      console.log(`Sending retention email to: ${requestData.customer_email}`);
      const emailResponse = await resend.emails.send({
        from: 'Churnaizer Team <support@churnaizer.com>',
        to: [requestData.customer_email],
        subject: subject,
        html: emailBody,
      });

      if (emailResponse.error) {
        console.error('Email sending failed:', emailResponse.error);
        throw new Error(emailResponse.error.message);
      }

      console.log('Retention email sent successfully:', emailResponse.data);

      // Log to database - For SDK calls, we need to find the owner user_id
      const { data: userData } = await supabase
        .from('user_data')
        .select('owner_id')
        .eq('user_id', requestData.user_id)
        .limit(1)
        .maybeSingle();

      const ownerUserId = userData?.owner_id || null;

      if (ownerUserId) {
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            user_id: ownerUserId, // The dashboard owner
            target_email: requestData.customer_email,
            target_user_id: requestData.user_id, // The tracked customer
            email_data: {
              subject,
              body: emailBody,
              psychology_style: 'urgency',
              churn_score: requestData.churn_score,
              risk_level: requestData.risk_level,
              automation_triggered: true
            },
            status: 'sent',
            sent_at: new Date().toISOString()
          });

        if (logError) {
          console.error('Error logging email to database:', logError);
        }
      } else {
        console.log('No owner found for user_id, skipping email log');
      }

      return new Response(
        JSON.stringify({ 
          message: 'Email automation triggered successfully',
          triggered: true,
          user_id: requestData.user_id,
          email_id: emailResponse.data?.id,
          email_subject: subject
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (emailError) {
      console.error('Failed to trigger email automation:', emailError);
      
      // Log failed attempt - For SDK calls, we need to find the owner user_id
      const { data: userData } = await supabase
        .from('user_data')
        .select('owner_id')
        .eq('user_id', requestData.user_id)
        .limit(1)
        .maybeSingle();

      const ownerUserId = userData?.owner_id || null;

      if (ownerUserId) {
        await supabase
          .from('email_logs')
          .insert({
            user_id: ownerUserId, // The dashboard owner
            target_email: requestData.customer_email,
            target_user_id: requestData.user_id, // The tracked customer
            email_data: {
              subject: 'Failed to send retention email',
              error: emailError.message,
              automation_triggered: true
            },
            status: 'failed',
            error_message: emailError.message
          }).catch(err => console.error('Error logging failed email:', err));
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to trigger email automation',
          details: emailError.message,
          triggered: false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in auto email trigger:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
  targetUsers?: Array<{
    id: string;
    email: string;
    plan: string;
    usage: number;
    churn_score: number;
    risk_level: string;
    last_login: string;
    churn_reason: string;
  }>;
  // Support single user data from SDK
  user_id?: string;
  customer_email?: string;
  customer_name?: string;
  subscription_plan?: string;
  churn_score?: number;
  risk_level?: string;
  churn_reason?: string;
  psychologyStyle: string;
  customMessage?: string;
  scheduleFor?: string;
}

const psychologyPrompts = {
  'loss_aversion': 'Focus on what the user will lose if they stop using the service. Emphasize benefits they currently have that will disappear.',
  'urgency': 'Create a sense of time pressure. Use phrases like "limited time", "act now", "expires soon".',
  'curiosity': 'Pique their interest with intriguing questions or incomplete information that makes them want to learn more.',
  'scarcity': 'Highlight limited availability, exclusive access, or few remaining spots/opportunities.',
  'social_proof': 'Include testimonials, success stories, or statistics about how others are benefiting from the service.',
  'authority': 'Use expert opinions, certifications, or industry recognition to build trust and credibility.',
  'reciprocity': 'Offer something valuable first (free guide, trial extension, bonus features) to encourage engagement.'
};

async function generateEmailWithOpenRouter(user: any, psychologyStyle: string, customMessage?: string): Promise<{subject: string, body: string}> {
  const psychologyPrompt = psychologyPrompts[psychologyStyle as keyof typeof psychologyPrompts] || psychologyPrompts.loss_aversion;
  
  const prompt = `Generate a professional SaaS retention email for a user with these characteristics:
- Email: ${user.email}
- Name: ${user.name || user.email?.split('@')[0] || 'there'}
- Plan: ${user.plan}
- Usage/Logins: ${user.usage}
- Risk Level: ${user.risk_level}
- Last Login: ${user.last_login}
- Churn Reason: ${user.churn_reason}
- Churn Score: ${user.churn_score}

Psychology Style: ${psychologyStyle}
Instructions: ${psychologyPrompt}

${customMessage ? `Additional context: ${customMessage}` : ''}

Generate a compelling email with:
1. An engaging subject line (max 60 characters)
2. A personalized email body (200-300 words)
3. Professional but warm tone
4. Clear call-to-action
5. Company signature as "The Churnaizer Team"

Format as JSON:
{
  "subject": "Your subject line here",
  "body": "Your email body here with proper HTML formatting"
}`;

  // Try OpenRouter first, fallback to OpenAI
  let response;
  let apiUsed = 'openrouter';
  
  if (openRouterApiKey) {
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://churnaizer.com',
          'X-Title': 'Churnaizer Email AI',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { role: 'system', content: 'You are an expert email marketer specializing in SaaS retention campaigns. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
    } catch (error) {
      console.log('OpenRouter failed, falling back to OpenAI:', error);
      apiUsed = 'openai';
    }
  } else {
    apiUsed = 'openai';
  }

  // Fallback to OpenAI if OpenRouter fails or isn't configured
  if (!response || !response.ok) {
    if (!openAIApiKey) {
      throw new Error('Neither OpenRouter nor OpenAI API key configured');
    }
    
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert email marketer specializing in SaaS retention campaigns. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });
    apiUsed = 'openai';
  }

  const data = await response.json();
  console.log(`Email generated using: ${apiUsed}`);
  
  if (!data.choices || !data.choices[0]) {
    throw new Error('Failed to generate email content');
  }

  try {
    const emailContent = JSON.parse(data.choices[0].message.content);
    return {
      subject: emailContent.subject,
      body: emailContent.body
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to parse AI response');
  }
}

async function sendEmailWithResend(to: string, subject: string, body: string): Promise<boolean> {
  const resend = new Resend(resendApiKey);
  
  try {
    const response = await resend.emails.send({
      from: 'Churnaizer <nexa@churnaizer.com>',
      to: [to],
      subject: subject,
      html: body,
    });

    return !!response && !response.error;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: EmailRequest = await req.json();
    
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    if (!openRouterApiKey && !openAIApiKey) {
      throw new Error('No AI API key configured (OpenRouter or OpenAI required)');
    }

    const results = [];
    let targetUsers = requestData.targetUsers || [];

    // Handle single user from SDK (automatic trigger)
    if (requestData.user_id && requestData.customer_email) {
      targetUsers = [{
        id: requestData.user_id,
        email: requestData.customer_email,
        name: requestData.customer_name || requestData.customer_email.split('@')[0],
        plan: requestData.subscription_plan || 'Free',
        usage: 1,
        churn_score: requestData.churn_score || 0.8,
        risk_level: requestData.risk_level || 'high',
        last_login: 'Recently',
        churn_reason: requestData.churn_reason || 'High churn risk detected by AI',
      }];
    }

    for (const targetUser of targetUsers) {
      try {
        console.log(`Generating email for user: ${targetUser.email}`);
        
        // Generate email content with AI (OpenRouter + Mistral fallback to OpenAI)
        const { subject, body } = await generateEmailWithOpenRouter(targetUser, requestData.psychologyStyle || 'urgency', requestData.customMessage);
        
        let emailStatus = 'pending';
        let sentAt = null;
        let errorMessage = null;

        // Send email immediately if not scheduled
        if (!requestData.scheduleFor) {
          console.log(`Sending email to: ${targetUser.email}`);
          const emailSent = await sendEmailWithResend(targetUser.email, subject, body);
          
          if (emailSent) {
            emailStatus = 'sent';
            sentAt = new Date().toISOString();
          } else {
            emailStatus = 'failed';
            errorMessage = 'Failed to send email via Resend';
          }
        } else {
          emailStatus = 'scheduled';
        }

        // Log to database
        const { error: logError } = await supabaseClient
          .from('email_logs')
          .insert({
            user_id: user.id,
            target_email: targetUser.email,
            target_user_id: targetUser.id,
            email_data: {
              subject,
              body,
              psychology_style: requestData.psychologyStyle,
              user_characteristics: targetUser,
              custom_message: requestData.customMessage,
            },
            status: emailStatus,
            sent_at: sentAt,
            error_message: errorMessage
          });

        if (logError) {
          console.error('Error logging email:', logError);
        }

        results.push({
          email: targetUser.email,
          status: emailStatus,
          subject,
          sent_at: sentAt,
          error: errorMessage
        });

      } catch (error) {
        console.error(`Error processing user ${targetUser.email}:`, error);
        
        // Log failed attempt
        await supabaseClient
          .from('email_logs')
          .insert({
            user_id: user.id,
            target_email: targetUser.email,
            target_user_id: targetUser.id,
            email_data: {
              subject: 'Failed to generate',
              body: 'Email generation failed',
              psychology_style: requestData.psychologyStyle,
              error: error.message,
            },
            status: 'failed',
            error_message: error.message,
          });

        results.push({
          email: targetUser.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      total: targetUsers.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      scheduled: results.filter(r => r.status === 'scheduled').length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-and-send-email function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
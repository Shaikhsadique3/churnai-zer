import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface EmailRequest {
  user_id: string;
  user_email: string;
  insight: string;
  recommended_tone: string;
  trigger_email?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate API key
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      console.error('Missing API key');
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify API key exists and is active
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error('Invalid API key:', apiKeyError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { user_id, user_email, insight, recommended_tone, trigger_email = true }: EmailRequest = await req.json();

    // Validate required fields
    if (!user_id || !user_email || !insight || !recommended_tone) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: user_id, user_email, insight, recommended_tone' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if trigger_email is enabled
    if (!trigger_email) {
      console.log('Email triggering disabled for user:', user_id);
      return new Response(
        JSON.stringify({ success: false, message: 'Email triggering disabled' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating retention email for user:', user_id);

    // Generate email content using OpenRouter API
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const emailPrompt = `Generate a personalized retention email for a customer at risk of churning.

User Insight: ${insight}
Recommended Tone: ${recommended_tone}

Guidelines:
- Keep it under 200 words
- Be empathetic and helpful
- Focus on value and solutions
- Include a clear call-to-action
- Use the recommended tone: ${recommended_tone}
- Make it feel personal, not automated
- Don't mention churn or risk directly
- Sign as "The Churnaizer Team"

Generate only the email body content (no subject line).`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'Churnaizer Retention Email Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketer specializing in customer retention. Generate compelling, personalized retention emails that feel authentic and helpful.'
          },
          {
            role: 'user',
            content: emailPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const emailContent = aiData.choices[0]?.message?.content;

    if (!emailContent) {
      throw new Error('Failed to generate email content');
    }

    console.log('Generated email content:', emailContent.substring(0, 100) + '...');

    // Generate subject line
    const subjectPrompt = `Generate a compelling email subject line for this retention email content:

${emailContent}

Guidelines:
- Keep it under 50 characters
- Create urgency but not desperation
- Be personal and engaging
- Don't mention churn directly
- Make it curiosity-driven

Generate only the subject line, no quotes or extra text.`;

    const subjectResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'Churnaizer Subject Line Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketer. Generate compelling subject lines for retention emails.'
          },
          {
            role: 'user',
            content: subjectPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 100
      })
    });

    const subjectData = await subjectResponse.json();
    const emailSubject = subjectData.choices[0]?.message?.content?.trim() || 'We miss you!';

    console.log('Generated subject:', emailSubject);

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: 'Nexa from Churnaizer <nexa@churnaizer.com>',
      to: [user_email],
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Churnaizer</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e5e9;">
            <div style="white-space: pre-line; line-height: 1.6; color: #374151; font-size: 16px;">
${emailContent}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #6b7280; font-size: 14px;">
              <p>Best regards,<br>The Churnaizer Team</p>
            </div>
          </div>
        </div>
      `,
      text: emailContent + '\n\nBest regards,\nThe Churnaizer Team'
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data?.id);

    // Log to email_logs table
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: apiKeyData.user_id,
        target_email: user_email,
        target_user_id: user_id,
        status: 'sent',
        email_data: {
          subject: emailSubject,
          content: emailContent,
          insight: insight,
          tone: recommended_tone,
          resend_id: emailResponse.data?.id
        },
        sent_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Failed to log email:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.data?.id,
        message: 'Retention email sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in email/send function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
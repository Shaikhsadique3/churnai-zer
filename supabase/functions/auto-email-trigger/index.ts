import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-churnaizer-api-key, x-sdk-version',
};

interface AutoEmailRequest {
  user_id?: string;
  customer_email?: string;
  email?: string; // fallback field
  customer_name?: string;
  churn_score?: number;
  risk_level?: string;
  churn_reason?: string;
  subscription_plan?: string;
  shouldTriggerEmail?: boolean;
  recommended_tone?: string;
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
      console.log('Request body received:', body.substring(0, 200) + '...'); // Truncate for security
      
      if (!body || body.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      requestData = JSON.parse(body);
      
      // *** TRACE LOG 5: EMAIL TRIGGER PAYLOAD ***
      console.log('[TRACE 5 - Email Trigger Payload]', {
        email_trigger_payload: requestData,
        payload_fields: Object.keys(requestData),
        critical_email_fields: {
          user_id: !!requestData.user_id,
          customer_email: !!requestData.customer_email,
          email: !!requestData.email,
          risk_level: requestData.risk_level,
          churn_score: requestData.churn_score,
          shouldTriggerEmail: requestData.shouldTriggerEmail,
          recommended_tone: requestData.recommended_tone,
          churn_reason: requestData.churn_reason
        },
        ai_outputs_present: {
          risk_level_from_ai: requestData.risk_level !== undefined,
          churn_score_from_ai: requestData.churn_score !== undefined,
          trigger_flag_from_ai: requestData.shouldTriggerEmail !== undefined,
          tone_from_ai: requestData.recommended_tone !== undefined
        }
      });
      
      console.log('Parsed request data fields:', Object.keys(requestData));
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

    // Apply fallbacks for email field
    const customerEmail = requestData.customer_email || requestData.email || null;
    const userId = requestData.user_id || null;

    // Debug logging for field validation
    console.log('Field validation:', {
      user_id: userId ? 'present' : 'missing',
      customer_email: customerEmail ? 'present' : 'missing',
      risk_level: requestData.risk_level || 'not provided'
    });

    // Validate required fields after fallbacks
    if (!userId || !customerEmail) {
      const missingFields = [];
      if (!userId) missingFields.push('user_id');
      if (!customerEmail) missingFields.push('customer_email');
      
      console.error('Missing required fields after fallback:', missingFields);
      return new Response(
        JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          received_fields: Object.keys(requestData),
          fallback_attempted: true
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update requestData with fallback values
    requestData.customer_email = customerEmail;
    requestData.user_id = userId;

    // Only trigger for high-risk users
    if (requestData.risk_level !== 'high') {
      console.log(`User not high-risk (${requestData.risk_level}), skipping email automation`);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No email needed for non-high risk',
          triggered: false,
          risk_level: requestData.risk_level,
          user_id: requestData.user_id
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
      
      // Generate AI-powered personalized email content using OpenRouter
      const customerName = requestData.customer_name || requestData.customer_email.split('@')[0];
      
      console.log('Generating AI-powered personalized email content...');
      
      let aiEmailContent;
      try {
        console.log('Calling OpenRouter AI for email generation...');
        
        const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
        if (!openRouterApiKey) {
          throw new Error('OpenRouter API key not configured');
        }
        
        // Create psychology-based prompt based on user data
        const psychologyStyle = requestData.recommended_tone || 'empathetic_urgency';
        const churnReason = requestData.churn_reason || 'decreased engagement';
        const plan = requestData.subscription_plan || 'subscription';
        const riskScore = Math.round((requestData.churn_score || 0.8) * 100);
        
        const psychologyPrompt = `You are an AI retention expert with deep knowledge in SaaS churn psychology, growth, and user behavior. 

USER PROFILE:
- Name: ${customerName}
- Plan: ${plan}
- Risk Level: ${requestData.risk_level}
- Churn Score: ${riskScore}%
- Main Issue: ${churnReason}
- Psychology Style: ${psychologyStyle}

TASK: Write a personalized retention email that feels crafted by a human retention expert. Use persuasive psychology but keep it natural and empathetic.

PSYCHOLOGY TECHNIQUES TO USE:
- Loss aversion: Remind them what they'll lose
- Social proof: Mention other successful users
- Urgency: Create gentle time pressure
- Value reinforcement: Highlight unique benefits
- Emotional connection: Personal, warm tone

RULES:
- DO NOT mention raw churn data, scores, or technical terms
- Make it feel personal and human, not AI-generated
- Include specific value propositions based on their plan
- Use empathetic language that addresses their likely pain points
- End with a strong but friendly call-to-action

FORMAT: Return JSON with "subject" and "html_content" fields. HTML should be clean, professional, and mobile-friendly.

TONE: ${psychologyStyle === 'urgency' ? 'Gentle urgency with empathy' : psychologyStyle === 'value_reminder' ? 'Helpful and supportive' : 'Warm and understanding'}`;

        // Call OpenRouter API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://churnaizer.com',
            'X-Title': 'Churnaizer Email Automation'
          },
          body: JSON.stringify({
            model: 'mistralai/mixtral-8x7b-instruct',
            messages: [
              {
                role: 'system',
                content: 'You are an expert SaaS retention specialist who writes highly converting, personalized emails that feel human and empathetic.'
              },
              {
                role: 'user',
                content: psychologyPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            top_p: 0.9
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!aiResponse.ok) {
          throw new Error(`OpenRouter API responded with status: ${aiResponse.status}`);
        }
        
        const aiResult = await aiResponse.json();
        const aiGeneratedContent = aiResult.choices[0]?.message?.content;
        
        if (!aiGeneratedContent) {
          throw new Error('No content generated by AI model');
        }
        
        // Try to parse JSON response from AI
        try {
          aiEmailContent = JSON.parse(aiGeneratedContent);
          console.log('AI email content generated successfully via OpenRouter');
        } catch (parseError) {
          // If AI didn't return JSON, create structure manually
          aiEmailContent = {
            subject: `${customerName}, we miss you at Churnaizer`,
            html_content: aiGeneratedContent
          };
        }
        
      } catch (aiError) {
        console.warn('[FALLBACK EMAIL TEMPLATE USED] AI email generation failed:', aiError.message);
        console.log('[TRACE 6 - Email Generation]', {
          ai_email_generation_used: false,
          fallback_template_used: true,
          fallback_reason: aiError.message,
          customer_name: customerName,
          churn_reason: churnReason,
          recommended_tone: requestData.recommended_tone
        });
        
        // Fallback to human-like template if AI fails
        const fallbackContent = createHumanizedFallbackEmail(customerName, churnReason, plan);
        aiEmailContent = {
          subject: fallbackContent.subject,
          html_content: fallbackContent.html_content
        };
      }
      
      // Helper function to create human-like fallback emails
      function createHumanizedFallbackEmail(name: string, reason: string, plan: string) {
        // Choose personalized message based on churn reason
        let personalizedMessage = '';
        let urgencyMessage = '';
        let valueProposition = '';
        
        if (reason.includes('low') || reason.includes('usage') || reason.includes('engagement')) {
          personalizedMessage = `I noticed you haven't been as active in your account lately, and I wanted to personally reach out.`;
          urgencyMessage = `Don't let all the insights you've built go to waste.`;
          valueProposition = `Your data is already set up and ready to provide powerful predictions.`;
        } else if (reason.includes('billing') || reason.includes('payment')) {
          personalizedMessage = `I see there might be some concerns about your subscription, and I'd love to help sort this out.`;
          urgencyMessage = `We have several options that might work better for your current situation.`;
          valueProposition = `Other ${plan} users are seeing 25% reduction in churn with our latest features.`;
        } else {
          personalizedMessage = `I've been reviewing accounts that might benefit from our newest features, and yours came up.`;
          urgencyMessage = `Many users in similar situations see immediate improvements when they re-engage.`;
          valueProposition = `Our latest AI models are 40% more accurate at predicting and preventing churn.`;
        }
        
        return {
          subject: `${name}, don't let your progress slip away`,
          html_content: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">Churnaizer</h1>
              </div>
              
              <p style="font-size: 18px; color: #1f2937; margin-bottom: 25px;">Hi ${name},</p>
              
              <p style="color: #374151; margin-bottom: 20px;">${personalizedMessage}</p>
              
              <p style="color: #374151; margin-bottom: 20px;">${urgencyMessage} ${valueProposition}</p>
              
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #7c3aed;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600;">WHAT YOU'RE MISSING:</p>
                <ul style="color: #374151; margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Real-time churn insights that could save you customers today</li>
                  <li>Automated retention campaigns (saving 10+ hours/week)</li>
                  <li>Advanced predictions that are getting smarter with our latest AI</li>
                </ul>
              </div>
              
              <p style="color: #374151; margin-bottom: 25px;">
                <strong>Here's what I suggest:</strong> Take just 5 minutes to check your dashboard. 
                You might be surprised by what insights are waiting for you.
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="https://churnaizer.com/dashboard" style="background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">Access Your Dashboard →</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">
                <em>P.S. If there's something specific holding you back, just reply to this email. 
                I read every response personally and often jump on quick calls to help users maximize their results.</em>
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #374151;">
                  Best regards,<br>
                  <strong>The Churnaizer Team</strong><br>
                  <span style="color: #6b7280; font-size: 14px;">Helping SaaS businesses reduce churn with AI</span>
                </p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  You're receiving this because we noticed changes in your account activity.<br>
                  <a href="#" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                  <a href="#" style="color: #9ca3af; text-decoration: underline;">Update preferences</a>
                </p>
              </div>
            </div>
          `
        };
      }
      
      const subject = aiEmailContent.subject || `${customerName}, let's reconnect`;
      const emailBody = aiEmailContent.html_content || aiEmailContent.content;

      // Send email
      console.log(`Sending retention email to: ${requestData.customer_email}`);
      const emailResponse = await resend.emails.send({
        from: 'Churnaizer Team <nexa@churnaizer.com>',
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
          success: true,
          message: 'Email sent',
          triggered: true,
          tracking_id: emailResponse.data?.id || `auto-${Date.now()}`,
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
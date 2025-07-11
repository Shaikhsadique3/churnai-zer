import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending welcome email to:', email);

    const displayName = name || email.split('@')[0];

    // Create beautiful HTML welcome email template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ChurnGuard Lite!</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 40px 32px; 
            text-align: center; 
          }
          .logo { 
            color: #ffffff; 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 8px; 
          }
          .tagline { 
            color: #e2e8f0; 
            font-size: 16px; 
          }
          .content { 
            padding: 40px 32px; 
          }
          .title { 
            font-size: 28px; 
            font-weight: 600; 
            color: #1a202c; 
            margin-bottom: 16px; 
            text-align: center;
          }
          .message { 
            color: #4a5568; 
            line-height: 1.6; 
            margin-bottom: 32px; 
            font-size: 16px;
          }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: #ffffff; 
            text-decoration: none; 
            padding: 16px 32px; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px;
            transition: transform 0.2s;
          }
          .cta-button:hover { 
            transform: translateY(-2px); 
          }
          .features { 
            margin: 32px 0; 
          }
          .feature { 
            display: flex; 
            align-items: flex-start; 
            margin-bottom: 16px; 
          }
          .feature-icon { 
            font-size: 20px; 
            margin-right: 12px; 
            margin-top: 2px; 
          }
          .feature-text { 
            color: #4a5568; 
            line-height: 1.5; 
          }
          .feature-title { 
            font-weight: 600; 
            color: #2d3748; 
            margin-bottom: 4px; 
          }
          .footer { 
            padding: 32px; 
            background-color: #f7fafc; 
            text-align: center; 
            color: #718096; 
            font-size: 14px; 
          }
          .highlight-box { 
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); 
            padding: 24px; 
            border-radius: 8px; 
            margin: 24px 0; 
            text-align: center; 
          }
          .highlight-title { 
            font-weight: 600; 
            color: #2d3748; 
            margin-bottom: 8px; 
            font-size: 18px; 
          }
          .highlight-text { 
            color: #4a5568; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ ChurnGuard Lite</div>
            <div class="tagline">Predict and prevent customer churn with AI</div>
          </div>
          
          <div class="content">
            <h1 class="title">Welcome, ${displayName}! 🎉</h1>
            <p class="message">
              Thank you for joining ChurnGuard Lite! We're excited to help you predict and prevent customer churn 
              using the power of AI and smart analytics.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app/dashboard" class="cta-button">
                Get Started Now →
              </a>
            </div>
            
            <div class="highlight-box">
              <div class="highlight-title">🚀 Ready to Get Started?</div>
              <div class="highlight-text">
                Upload your customer data and start identifying at-risk customers in minutes!
              </div>
            </div>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">📊</div>
                <div>
                  <div class="feature-title">AI-Powered Churn Prediction</div>
                  <div class="feature-text">Get accurate predictions about which customers are likely to churn</div>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">📧</div>
                <div>
                  <div class="feature-title">Automated Email Campaigns</div>
                  <div class="feature-text">Create targeted retention campaigns based on churn risk levels</div>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">📈</div>
                <div>
                  <div class="feature-title">Real-time Analytics</div>
                  <div class="feature-text">Monitor your customer health and retention metrics in real-time</div>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">🤖</div>
                <div>
                  <div class="feature-title">Smart Playbooks</div>
                  <div class="feature-text">Automate retention actions based on customer behavior patterns</div>
                </div>
              </div>
            </div>
            
            <p class="message">
              <strong>Need help getting started?</strong><br>
              Check out our dashboard to upload your first customer data file, or explore our playbooks 
              to set up automated retention campaigns.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Welcome to the future of customer retention!</strong></p>
            <p>If you have any questions, our support team is here to help.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send welcome email via Resend
    try {
      const emailResponse = await resend.emails.send({
        from: 'ChurnGuard Lite <welcome@resend.dev>', // Update with your verified domain
        to: [email],
        subject: '🎉 Welcome to ChurnGuard Lite - Let\'s Prevent Churn Together!',
        html: emailHtml,
      });

      console.log('Welcome email sent successfully:', emailResponse.data?.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Welcome email sent successfully',
          emailId: emailResponse.data?.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);

      return new Response(
        JSON.stringify({
          error: 'Failed to send welcome email',
          details: emailError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-welcome-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
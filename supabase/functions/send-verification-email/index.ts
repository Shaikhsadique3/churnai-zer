import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface VerificationEmailRequest {
  email: string;
  name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, name }: VerificationEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing email verification request for:', email);

    const displayName = name || email.split('@')[0];

    // Generate email verification link using Supabase's built-in method
    const { data, error: verificationError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL').replace('https://ntbkydpgjaswmwruegyl.supabase.co', 'https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app')}/dashboard`
      }
    });

    if (verificationError) {
      console.error('Failed to generate verification link:', verificationError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verificationLink = data.properties?.action_link;
    
    if (!verificationLink) {
      console.error('No verification link generated');
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create email verification template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Churnaizer</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
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
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 8px; 
          }
          .tagline { 
            color: #e2e8f0; 
            font-size: 14px; 
          }
          .content { 
            padding: 40px 32px; 
          }
          .title { 
            font-size: 24px; 
            font-weight: 600; 
            color: #1a202c; 
            margin-bottom: 16px; 
          }
          .message { 
            color: #4a5568; 
            line-height: 1.6; 
            margin-bottom: 32px; 
          }
          .verify-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: #ffffff; 
            text-decoration: none; 
            padding: 16px 32px; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px;
          }
          .alternative { 
            margin-top: 32px; 
            padding: 20px; 
            background-color: #f7fafc; 
            border-radius: 8px; 
            border-left: 4px solid #667eea; 
          }
          .link-text { 
            color: #667eea; 
            word-break: break-all; 
            font-size: 14px; 
          }
          .footer { 
            padding: 32px; 
            background-color: #f7fafc; 
            text-align: center; 
            color: #718096; 
            font-size: 14px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ Churnaizer</div>
            <div class="tagline">Predict and prevent customer churn with AI</div>
          </div>
          
          <div class="content">
            <h1 class="title">Verify Your Email Address</h1>
            <p class="message">
              Hi ${displayName}! Please verify your email address to complete your Churnaizer account setup:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
            </div>
            
            <div class="alternative">
              <p style="margin: 8px 0; color: #4a5568; font-size: 14px;">Button not working? Copy and paste this link:</p>
              <div class="link-text">${verificationLink}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This verification link will expire in 24 hours</p>
            <p>If you didn't create this account, please ignore this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send verification email
    try {
      const emailResponse = await resend.emails.send({
        from: 'Churnaizer <notify@churnaizer.com>',
        to: [email],
        subject: '📧 Verify Your Churnaizer Email Address',
        html: emailHtml,
      });

      console.log('Verification email sent successfully:', emailResponse.data?.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Verification email sent successfully',
          emailId: emailResponse.data?.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);

      return new Response(
        JSON.stringify({
          error: 'Failed to send verification email',
          details: emailError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-verification-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
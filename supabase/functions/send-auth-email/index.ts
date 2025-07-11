import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FRONTEND_URL = 'https://churnaizer.com';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type = "welcome", name = "" } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const displayName = name || email.split("@")[0];
    let subject = "", html = "";

    if (type === "welcome") {
      subject = "🎉 Welcome to Churnaizer!";
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Churnaizer!</title>
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
              <h1 class="title">Welcome, ${displayName}! 🎉</h1>
              <p class="message">
                Welcome aboard! You're now part of Churnaizer's mission to prevent churn using AI.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${FRONTEND_URL}/dashboard" class="cta-button">
                  Go to Dashboard →
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "reset") {
      // Generate password reset link using Supabase's built-in method
      const { data, error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${FRONTEND_URL}/reset-password`
        }
      });

      if (resetError || !data?.properties?.action_link) {
        throw new Error("Password reset link generation failed.");
      }

      subject = "🔐 Reset your Churnaizer password";
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password - Churnaizer</title>
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
            .reset-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: #ffffff; 
              text-decoration: none; 
              padding: 16px 32px; 
              border-radius: 8px; 
              font-weight: 600; 
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️ Churnaizer</div>
            </div>
            
            <div class="content">
              <h1 class="title">Reset Your Password</h1>
              <p class="message">
                Hello ${displayName}, click below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.properties.action_link}" class="reset-button">Reset Password</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "verify") {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "signup",
        email,
        options: {
          redirectTo: `${FRONTEND_URL}/dashboard`
        }
      });
      
      if (error || !data?.properties?.action_link) {
        throw new Error("Verification link generation failed.");
      }
      
      subject = "📧 Verify your Churnaizer email";
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Email - Churnaizer</title>
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️ Churnaizer</div>
            </div>
            
            <div class="content">
              <h1 class="title">Verify Your Email Address</h1>
              <p class="message">
                Hi ${displayName}! Please verify your email:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.properties.action_link}" class="verify-button">Verify Email</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const response = await resend.emails.send({
      from: "Churnaizer <notify@churnaizer.com>",
      to: [email],
      subject,
      html,
    });

    console.log(`${type} email sent successfully:`, response.data?.id);

    // Log to email_logs table
    try {
      await supabase.from('email_logs').insert({
        target_email: email,
        status: 'sent',
        email_data: {
          type,
          resend_id: response.data?.id,
          subject
        },
        sent_at: new Date().toISOString(),
        user_id: 'system' // Since this is system-generated
      });
    } catch (logError) {
      console.error('Failed to log email:', logError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent", 
      emailId: response.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error(`Error in send-auth-email function:`, e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface PasswordResetRequest {
  email: string;
}

// Generate a secure reset token
function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing password reset request for:', email);

    // Check if user exists
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);

    if (!user) {
      // For security, we still return success even if user doesn't exist
      console.log('User not found, but returning success for security');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If an account with this email exists, a password reset link has been sent.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate password reset token using Supabase's built-in method
    const { data, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL').replace('https://ntbkydpgjaswmwruegyl.supabase.co', 'https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app')}/reset-password`
      }
    });

    if (resetError) {
      console.error('Failed to generate reset link:', resetError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resetLink = data.properties?.action_link;
    
    if (!resetLink) {
      console.error('No reset link generated');
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create beautiful HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - ChurnGuard Lite</title>
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
          .reset-button { 
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
          .reset-button:hover { 
            transform: translateY(-2px); 
          }
          .alternative { 
            margin-top: 32px; 
            padding: 20px; 
            background-color: #f7fafc; 
            border-radius: 8px; 
            border-left: 4px solid #667eea; 
          }
          .alternative-title { 
            font-weight: 600; 
            color: #2d3748; 
            margin-bottom: 8px; 
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
          .security-note { 
            margin-top: 24px; 
            padding: 16px; 
            background-color: #fef5e7; 
            border-radius: 6px; 
            border-left: 4px solid #f6ad55; 
          }
          .security-title { 
            font-weight: 600; 
            color: #c05621; 
            margin-bottom: 8px; 
          }
          .security-text { 
            color: #c05621; 
            font-size: 14px; 
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
            <h1 class="title">Reset Your Password</h1>
            <p class="message">
              We received a request to reset your password for your ChurnGuard Lite account. 
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" class="reset-button">Reset My Password</a>
            </div>
            
            <div class="alternative">
              <div class="alternative-title">Button not working?</div>
              <p style="margin: 8px 0; color: #4a5568; font-size: 14px;">Copy and paste this link into your browser:</p>
              <div class="link-text">${resetLink}</div>
            </div>
            
            <div class="security-note">
              <div class="security-title">🔒 Security Notice</div>
              <div class="security-text">
                • This link will expire in 1 hour for security<br>
                • If you didn't request this reset, please ignore this email<br>
                • Never share this link with anyone
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent from ChurnGuard Lite</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    try {
      const emailResponse = await resend.emails.send({
        from: 'ChurnGuard Lite <no-reply@resend.dev>', // Update with your verified domain
        to: [email],
        subject: '🔑 Reset Your ChurnGuard Lite Password',
        html: emailHtml,
      });

      console.log('Password reset email sent successfully:', emailResponse.data?.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Password reset email sent successfully',
          emailId: emailResponse.data?.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);

      return new Response(
        JSON.stringify({
          error: 'Failed to send password reset email',
          details: emailError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-password-reset function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
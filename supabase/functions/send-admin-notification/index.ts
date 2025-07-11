import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface AdminNotificationRequest {
  userEmail: string;
  userName?: string;
  signupTime: string;
  referrer?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, signupTime, referrer }: AdminNotificationRequest = await req.json();

    console.log('Sending admin notification for new user:', userEmail);

    const displayName = userName || userEmail.split('@')[0];

    // Create admin notification email template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Signup - Churnaizer</title>
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
            padding: 32px; 
            text-align: center; 
          }
          .logo { 
            color: #ffffff; 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 8px; 
          }
          .content { 
            padding: 32px; 
          }
          .title { 
            font-size: 22px; 
            font-weight: 600; 
            color: #1a202c; 
            margin-bottom: 16px; 
          }
          .user-details { 
            background-color: #f7fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            padding-bottom: 8px; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .detail-row:last-child { 
            border-bottom: none; 
            margin-bottom: 0; 
          }
          .label { 
            font-weight: 600; 
            color: #4a5568; 
          }
          .value { 
            color: #2d3748; 
          }
          .footer { 
            padding: 24px; 
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
            <div class="logo">🛡️ Churnaizer Admin</div>
          </div>
          
          <div class="content">
            <h1 class="title">New User Signup Alert</h1>
            <p>A new user has signed up for Churnaizer:</p>
            
            <div class="user-details">
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${displayName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${userEmail}</span>
              </div>
              <div class="detail-row">
                <span class="label">Signup Time:</span>
                <span class="value">${new Date(signupTime).toLocaleString()}</span>
              </div>
              ${referrer ? `
              <div class="detail-row">
                <span class="label">Referrer:</span>
                <span class="value">${referrer}</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from Churnaizer</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send admin notification email
    try {
      const emailResponse = await resend.emails.send({
        from: 'Churnaizer <notify@churnaizer.com>',
        to: ['admin@churnaizer.com'],
        subject: `🚀 New User Signup: ${displayName}`,
        html: emailHtml,
      });

      console.log('Admin notification sent successfully:', emailResponse.data?.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin notification sent successfully',
          emailId: emailResponse.data?.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);

      return new Response(
        JSON.stringify({
          error: 'Failed to send admin notification',
          details: emailError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-admin-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
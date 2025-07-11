import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting weekly summary email process');

    // Get all active users (those who have logged in recently)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Failed to fetch users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each user
    for (const user of users.users) {
      try {
        // Get user's churn data
        const { data: userData, error: userDataError } = await supabase
          .from('user_data')
          .select('*')
          .eq('owner_id', user.id);

        // Calculate stats for this user
        const totalUsers = userData?.length || 0;
        const highRisk = userData?.filter(u => u.risk_level === 'high').length || 0;
        const mediumRisk = userData?.filter(u => u.risk_level === 'medium').length || 0;
        const lowRisk = userData?.filter(u => u.risk_level === 'low').length || 0;
        const avgChurnScore = userData?.length ? 
          userData.reduce((sum, u) => sum + (u.churn_score || 0), 0) / userData.length : 0;

        const userName = user.email?.split('@')[0] || 'User';

        // Create weekly summary email template
        const emailHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weekly Summary - Churnaizer</title>
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
              .stats-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 16px; 
                margin: 24px 0; 
              }
              .stat-card { 
                background-color: #f7fafc; 
                padding: 20px; 
                border-radius: 8px; 
                text-align: center; 
              }
              .stat-number { 
                font-size: 32px; 
                font-weight: bold; 
                color: #2d3748; 
              }
              .stat-label { 
                color: #718096; 
                font-size: 14px; 
                margin-top: 4px; 
              }
              .high-risk { color: #e53e3e; }
              .medium-risk { color: #f56500; }
              .low-risk { color: #38a169; }
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
                <div class="logo">📊 Churnaizer Weekly Summary</div>
              </div>
              
              <div class="content">
                <h1 class="title">Hi ${userName}! Here's your week in review</h1>
                <p>Your customer churn insights for the past week:</p>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-number">${totalUsers}</div>
                    <div class="stat-label">Total Customers</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number">${avgChurnScore.toFixed(1)}%</div>
                    <div class="stat-label">Avg Churn Score</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number high-risk">${highRisk}</div>
                    <div class="stat-label">High Risk</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-number medium-risk">${mediumRisk}</div>
                    <div class="stat-label">Medium Risk</div>
                  </div>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app/dashboard" class="cta-button">
                    View Dashboard →
                  </a>
                </div>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  ${highRisk > 0 ? `⚠️ You have ${highRisk} customers at high risk of churning. Consider reaching out to them this week.` : '✅ Great news! No high-risk customers this week.'}
                </p>
              </div>
              
              <div class="footer">
                <p>This is your weekly Churnaizer summary</p>
                <p>You're receiving this because you're a Churnaizer user</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send weekly summary email
        const emailResponse = await resend.emails.send({
          from: 'Churnaizer <notify@churnaizer.com>',
          to: [user.email!],
          subject: `📊 Your Weekly Churn Summary - ${highRisk} High Risk Customers`,
          html: emailHtml,
        });

        console.log(`Weekly summary sent to ${user.email}:`, emailResponse.data?.id);
        emailsSent++;

      } catch (emailError) {
        console.error(`Failed to send weekly summary to ${user.email}:`, emailError);
        emailsFailed++;
      }
    }

    console.log(`Weekly summary process completed: ${emailsSent} sent, ${emailsFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly summary process completed',
        emailsSent,
        emailsFailed
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-weekly-summary function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
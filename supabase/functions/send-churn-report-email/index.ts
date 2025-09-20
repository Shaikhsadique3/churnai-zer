import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send Churn Report Email function started."); // Log function start
    const { email, upload_id, report_url, summary } = await req.json();

    if (!email || !upload_id || !report_url) {
      console.error("Error: Missing required fields for sending email.", { email, upload_id, report_url }); // Log missing fields
      throw new Error('Missing required fields');
    }

    console.log(`Preparing email for ${email} with report URL: ${report_url}`); // Log email preparation

    const emailContent = `
      <h1>Your Churn Audit Report is Ready!</h1>
      
      <p>Thank you for using our AI-powered churn analysis service. Your report has been generated and is ready for download.</p>
      
      <h2>Quick Summary:</h2>
      <ul>
        <li><strong>Total Customers Analyzed:</strong> ${summary?.total_customers || 'Processing'}</li>
        <li><strong>High Risk Customers:</strong> ${summary?.high_risk_count || 'Processing'} (${summary?.high_risk_percentage || 0}%)</li>
        <li><strong>Overall Churn Risk:</strong> ${summary?.overall_churn_rate || 'Processing'}%</li>
      </ul>
      
      <div style="margin: 20px 0;">
        <a href="${report_url}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Download Your Free Report
        </a>
      </div>
      
      <h3>Top Churn Drivers Identified:</h3>
      <ul>
        ${summary?.top_churn_reasons?.map((reason: string) => `<li>${reason}</li>`).join('') || '<li>Login activity patterns</li><li>Feature usage</li>'}
      </ul>
      
      <h3>Want the Full Analysis?</h3>
      <p>Your free report includes risk distribution and key insights. For detailed customer segmentation, industry benchmarks, retention playbooks, and a 90-day action plan, upgrade to our full report for just $99.</p>
      
      <div style="margin: 20px 0;">
        <a href="https://churnaizer.com/report/${upload_id}" 
           style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Unlock Full Report - $99
        </a>
      </div>
      
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        Questions? Reply to this email or contact us at support@churnaizer.com<br>
        Your data has been processed securely and will be automatically deleted within 24 hours.
      </p>
    `;

    console.log("Attempting to send email via Resend."); // Log before sending email
    const { data, error } = await resend.emails.send({
      from: 'Churnaizer <reports@churnaizer.com>',
      to: [email],
      subject: '🎯 Your Churn Audit Report is Ready - Download Now',
      html: emailContent,
    });

    if (error) {
      console.error("Email sending failed:", error); // Log email sending failure with stack trace
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log(`Email sent successfully to ${email}. Email ID: ${data.id}`); // Log email sending success

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Report email sent successfully',
      email_id: data.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Send Churn Report Email function failed with error:', error); // Log internal server error with stack trace
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
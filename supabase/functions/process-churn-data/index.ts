import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { upload_id } = await req.json();

    if (!upload_id) {
      return new Response(
        JSON.stringify({ error: "Upload ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update status to processing
    await supabase
      .from("churn_uploads")
      .update({ status: "processing" })
      .eq("id", upload_id);

    // Get upload details
    const { data: upload } = await supabase
      .from("churn_uploads")
      .select("*")
      .eq("id", upload_id)
      .single();

    if (!upload) {
      throw new Error("Upload not found");
    }

    // Simulate churn analysis (replace with actual external API call)
    const analysisResults = {
      high_risk_percentage: Math.floor(Math.random() * 30) + 10,
      medium_risk_percentage: Math.floor(Math.random() * 40) + 20,
      low_risk_percentage: Math.floor(Math.random() * 40) + 30,
      top_churn_reasons: [
        "Low engagement",
        "High support tickets",
        "Payment issues",
        "Feature adoption lag"
      ],
      high_risk_customers: Array.from({ length: 10 }, (_, i) => ({
        id: `CUST_${String(i + 1).padStart(3, '0')}`,
        risk_score: (Math.random() * 0.3 + 0.7).toFixed(2)
      }))
    };

    // Generate lite PDF report (simplified version)
    const reportContent = generateLiteReport(analysisResults);
    
    // Create a simple PDF-like text content (in real app, use proper PDF library)
    const pdfFileName = `lite-report-${upload_id}.txt`;
    
    // Upload report to storage
    const { data: reportUpload, error: reportUploadError } = await supabase.storage
      .from("reports")
      .upload(pdfFileName, new Blob([reportContent], { type: "text/plain" }));

    if (reportUploadError) {
      throw new Error("Failed to upload report");
    }

    // Get public URL for report
    const { data: { publicUrl } } = supabase.storage
      .from("reports")
      .getPublicUrl(pdfFileName);

    // Save report record
    await supabase
      .from("churn_reports")
      .insert({
        upload_id: upload_id,
        type: "free",
        pdf_url: publicUrl
      });

    // Update upload status to done
    await supabase
      .from("churn_uploads")
      .update({ status: "done" })
      .eq("id", upload_id);

    // Send email with free report
    await resend.emails.send({
      from: "Churn Audit <reports@resend.dev>",
      to: [upload.email],
      subject: "Your Free Churn Audit Report is Ready!",
      html: `
        <h1>Your Churn Audit is Complete!</h1>
        <p>Hi there,</p>
        <p>Your free churn audit report is now ready for download.</p>
        <p><strong>Key Findings:</strong></p>
        <ul>
          <li>High Risk Customers: ${analysisResults.high_risk_percentage}%</li>
          <li>Medium Risk Customers: ${analysisResults.medium_risk_percentage}%</li>
          <li>Low Risk Customers: ${analysisResults.low_risk_percentage}%</li>
        </ul>
        <p><a href="${publicUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Free Report</a></p>
        <p>Want more detailed insights? <a href="${Deno.env.get('SUPABASE_URL')}/report/${upload_id}">Unlock your full report</a> for comprehensive analysis and actionable recommendations.</p>
        <p>Best regards,<br>The Churn Audit Team</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, report_url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    
    // Update status to failed
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { upload_id } = await req.json();
    if (upload_id) {
      await supabase
        .from("churn_uploads")
        .update({ status: "failed" })
        .eq("id", upload_id);
    }

    return new Response(
      JSON.stringify({ error: "Processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateLiteReport(results: any): string {
  return `
CHURN AUDIT REPORT (LITE VERSION)
================================

RISK DISTRIBUTION:
- High Risk: ${results.high_risk_percentage}%
- Medium Risk: ${results.medium_risk_percentage}%
- Low Risk: ${results.low_risk_percentage}%

TOP CHURN REASONS:
${results.top_churn_reasons.map((reason: string, i: number) => `${i + 1}. ${reason}`).join('\n')}

TOP 10 HIGH-RISK CUSTOMERS:
${results.high_risk_customers.map((customer: any, i: number) => `${i + 1}. ${customer.id} (Risk Score: ${customer.risk_score})`).join('\n')}

RECOMMENDATIONS:
1. Focus on high-risk customers first
2. Implement proactive outreach for medium-risk segments
3. Analyze top churn reasons for prevention strategies

For detailed analysis, segmentation, and actionable playbooks, 
upgrade to the full report.

Generated by Churn Audit Service
${new Date().toISOString()}
  `;
}
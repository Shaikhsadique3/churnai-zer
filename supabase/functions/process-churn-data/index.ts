import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase/supabase-js@2.45.0";
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
    console.log("Process Churn Data function started."); // Log function start
    const { upload_id } = await req.json();

    if (!upload_id) {
      console.error("Error: Upload ID is required."); // Log missing upload ID
      return new Response(
        JSON.stringify({ error: "Upload ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`Updating upload status to 'processing' for upload ID: ${upload_id}`); // Log status update
    // Update status to processing
    await supabase
      .from("churn_uploads")
      .update({ status: "processing" })
      .eq("id", upload_id);

    console.log(`Fetching upload details for upload ID: ${upload_id}`); // Log fetching details
    // Get upload details
    const { data: upload, error: fetchError } = await supabase
      .from("churn_uploads")
      .select("*")
      .eq("id", upload_id)
      .single();

    if (fetchError) {
      console.error(`Error fetching upload details for ${upload_id}:`, fetchError); // Log fetch error
      throw new Error("Upload not found");
    }
    if (!upload) {
      console.error(`Error: Upload with ID ${upload_id} not found.`); // Log upload not found
      throw new Error("Upload not found");
    }

    console.log("Simulating churn analysis."); // Log simulation start
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
    console.log("Churn analysis simulation complete."); // Log simulation end

    console.log("Generating lite PDF report."); // Log report generation start
    // Generate lite PDF report (simplified version)
    const reportContent = generateLiteReport(analysisResults);
    console.log("Lite PDF report generated."); // Log report generation end
    
    // Create a simple PDF-like text content (in real app, use proper PDF library)
    const pdfFileName = `lite-report-${upload_id}.txt`;
    
    console.log(`Uploading report to storage: ${pdfFileName}`); // Log report upload start
    // Upload report to storage
    const { data: reportUpload, error: reportUploadError } = await supabase.storage
      .from("reports")
      .upload(pdfFileName, new Blob([reportContent], { type: "text/plain" }));

    if (reportUploadError) {
      console.error("Error uploading report:", reportUploadError); // Log report upload error
      throw new Error("Failed to upload report");
    }
    console.log(`Report ${pdfFileName} uploaded successfully.`); // Log report upload success

    console.log("Generating public URL for report."); // Log public URL generation start
    // Get public URL for report
    const { data: { publicUrl } } = supabase.storage
      .from("reports")
      .getPublicUrl(pdfFileName);
    console.log(`Public URL generated: ${publicUrl}`); // Log public URL generation end

    console.log("Saving report record to database."); // Log saving report record start
    // Save report record
    const { error: insertReportError } = await supabase
      .from("churn_reports")
      .insert({
        upload_id: upload_id,
        type: "free",
        pdf_url: publicUrl
      });

    if (insertReportError) {
      console.error("Error inserting report record:", insertReportError); // Log insert report error
      throw new Error("Failed to save report record");
    }
    console.log("Report record saved to database."); // Log saving report record end

    console.log(`Updating upload status to 'done' for upload ID: ${upload_id}`); // Log status update
    // Update upload status to done
    await supabase
      .from("churn_uploads")
      .update({ status: "done" })
      .eq("id", upload_id);
    console.log(`Upload status for ${upload_id} updated to 'done'.`); // Log status update end

    console.log(`Sending email to ${upload.email} with report.`); // Log email send start
    // Send email with free report
    const { data: emailData, error: emailError } = await resend.emails.send({
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
        <p><a href=\"${publicUrl}\" style=\"background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Download Free Report</a></p>
        <p>Want more detailed insights? <a href=\"${Deno.env.get('SUPABASE_URL')}/report/${upload_id}\">Unlock your full report</a> for comprehensive analysis and actionable recommendations.</p>
        <p>Best regards,<br>The Churn Audit Team</p>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError); // Log email send error
    } else {
      console.log("Email sent successfully:", emailData); // Log email send success
    }

    console.log("Process Churn Data function finished successfully."); // Log function end

    return new Response(
      JSON.stringify({ success: true, report_url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Process Churn Data function failed with error:", error); // Log internal server error with stack trace
    
    // Update status to failed
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Attempt to get upload_id from request body if available, otherwise from error context
    let uploadIdToUpdate = null;
    try {
      const { upload_id } = await req.json();
      uploadIdToUpdate = upload_id;
    } catch (jsonError) {
      console.warn("Could not parse upload_id from request body in error handler.", jsonError);
      // If req.json() fails, try to extract from error message or context if possible
      // For now, we'll just log and proceed without upload_id if it's not easily available
    }

    if (uploadIdToUpdate) {
      console.log(`Updating upload status to 'failed' for upload ID: ${uploadIdToUpdate}`); // Log status update
      await supabase
        .from("churn_uploads")
        .update({ status: "failed" })
        .eq("id", uploadIdToUpdate);
      console.log(`Upload status for ${uploadIdToUpdate} updated to 'failed'.`); // Log status update end
    } else {
      console.warn("Upload ID not available to update status to 'failed'.");
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
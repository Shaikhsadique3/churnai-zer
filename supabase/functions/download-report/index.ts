import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let uploadId = url.pathname.split("/").pop() || url.searchParams.get("upload_id") || null;

    if (!uploadId && req.method !== "GET") {
      try {
        const body = await req.json();
        uploadId = body?.upload_id ?? null;
      } catch {
        // ignore
      }
    }

    if (!uploadId) {
      return new Response(
        JSON.stringify({ error: "Upload ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for secure access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find analysis by upload_id
    const { data: analysis, error: analysisErr } = await supabase
      .from("churn_analysis_results")
      .select("id")
      .eq("upload_id", uploadId)
      .maybeSingle();

    if (analysisErr) {
      console.error("Analysis lookup error:", analysisErr);
    }

    if (analysis?.id) {
      const { data: report, error: reportErr } = await supabase
        .from("reports")
        .select("pdf_file_path, report_name")
        .eq("analysis_id", analysis.id)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (reportErr) {
        console.error("Report lookup error:", reportErr);
      }

      if (report?.pdf_file_path) {
        const { data: file, error: downloadErr } = await supabase
          .storage
          .from("reports")
          .download(report.pdf_file_path);

        if (downloadErr || !file) {
          console.error("Report download error:", downloadErr);
        } else {
          return new Response(file, {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${report.report_name || uploadId}.pdf"`,
              "Cache-Control": "no-cache",
            },
          });
        }
      }
    }

    // Fallback: try churn_reports (if exists) for a direct URL
    const { data: churnReport } = await supabase
      .from("churn_reports")
      .select("pdf_url")
      .eq("upload_id", uploadId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (churnReport?.pdf_url) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: churnReport.pdf_url },
      });
    }

    return new Response(
      JSON.stringify({ error: "Report not found yet. Please try again later." }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("download-report error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

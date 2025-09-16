import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Try to get upload_id from path, query, or JSON body
    let uploadId = url.pathname.split('/').pop() || url.searchParams.get('upload_id') || null;
    if (!uploadId && req.method !== 'GET') {
      try {
        const body = await req.json();
        uploadId = body?.upload_id ?? null;
      } catch {
        // ignore JSON parse errors
      }
    }
    if (!uploadId) {
      return new Response(
        JSON.stringify({ status: 'not_found', error: 'Upload ID is required' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get upload status
    const { data: upload, error: uploadError } = await supabase
      .from("churn_uploads")
      .select("*")
      .eq("id", uploadId)
      .maybeSingle();

    if (uploadError || !upload) {
      return new Response(
        JSON.stringify({ status: 'not_found', error: "Upload not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get free report if available
    let freeReportUrl = null;
    if (upload.status === "done") {
      const { data: report } = await supabase
        .from("churn_reports")
        .select("pdf_url")
        .eq("upload_id", uploadId)
        .eq("type", "free")
        .maybeSingle();
      
      if (report) {
        freeReportUrl = report.pdf_url;
      }
    }

    // Check if payment exists
    const { data: payment } = await supabase
      .from("churn_payments")
      .select("status")
      .eq("upload_id", uploadId)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        status: upload.status,
        free_report_url: freeReportUrl,
        payment_status: payment?.status || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
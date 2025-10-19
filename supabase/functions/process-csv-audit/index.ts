import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { auditId, csvContent, mergeMode = false } = await req.json();

    // Parse CSV content
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file must contain headers and at least one data row");
    }

    const headers = lines[0].toLowerCase().split(",").map((h: string) => h.trim());
    const rows = lines.slice(1).map((line: string) => {
      const values = line.split(",").map((v: string) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || "";
      });
      return row;
    });

    // Define expected metrics and their categories
    const metricMapping: Record<string, string> = {
      "ttfv": "Onboarding & Activation",
      "time_to_first_value": "Onboarding & Activation",
      "onboarding_completion": "Onboarding & Activation",
      "activation_rate": "Onboarding & Activation",
      "login_frequency": "Customer Engagement",
      "feature_usage": "Customer Engagement",
      "session_duration": "Customer Engagement",
      "engagement_score": "Customer Engagement",
      "nps_score": "Product Feedback & Experience",
      "csat_score": "Product Feedback & Experience",
      "feedback_count": "Product Feedback & Experience",
      "support_tickets": "Product Feedback & Experience",
      "renewal_rate": "Retention Marketing",
      "churn_rate": "Retention Marketing",
      "winback_rate": "Retention Marketing",
      "upsell_rate": "Retention Marketing",
      "health_score": "Customer Success Process",
      "csm_touchpoints": "Customer Success Process",
      "escalation_count": "Customer Success Process",
      "retention_rate": "Customer Success Process"
    };

    // Count valid metrics found
    let validMetricsFound = 0;
    const foundMetrics: string[] = [];

    headers.forEach(header => {
      if (metricMapping[header]) {
        validMetricsFound++;
        foundMetrics.push(header);
      }
    });

    // Calculate accuracy: 60% base + 5% per valid metric (max 90%)
    const accuracy = Math.min(60 + (validMetricsFound * 5), 90);

    // Calculate category scores based on found metrics
    const categoryScores: Record<string, number[]> = {};
    
    rows.forEach(row => {
      foundMetrics.forEach(metric => {
        const category = metricMapping[metric];
        const value = parseFloat(row[metric]);
        
        if (!isNaN(value)) {
          if (!categoryScores[category]) {
            categoryScores[category] = [];
          }
          // Normalize values to 0-100 scale
          const normalized = Math.min(Math.max(value, 0), 100);
          categoryScores[category].push(normalized);
        }
      });
    });

    // Get all categories
    const { data: categories } = await supabaseClient
      .from("categories")
      .select("*");

    // Calculate final scores for each category
    let overallScore = 0;
    let totalWeight = 0;

    for (const category of categories || []) {
      const scores = categoryScores[category.title];
      let categoryScore = 50; // Default middle score if no data

      if (scores && scores.length > 0) {
        categoryScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      const weight = category.weight || 1.0;
      overallScore += categoryScore * weight;
      totalWeight += weight;

      // Determine status
      let status = "Poor";
      if (categoryScore >= 75) status = "Good";
      else if (categoryScore >= 50) status = "Average";

      // Insert/update category result
      await supabaseClient
        .from("category_results")
        .upsert({
          audit_id: auditId,
          category_id: category.id,
          score: categoryScore,
          status
        });
    }

    let finalOverallScore = totalWeight > 0 ? overallScore / totalWeight : 50;
    let finalAccuracy = accuracy;
    let finalAuditMode = "data";
    
    // If merging with existing question audit
    if (mergeMode) {
      const { data: existingAudit } = await supabaseClient
        .from("audits")
        .select("overall_score, accuracy, audit_mode")
        .eq("id", auditId)
        .single();

      if (existingAudit && existingAudit.audit_mode === "question") {
        const questionScore = existingAudit.overall_score || 50;
        const questionAccuracy = existingAudit.accuracy || 60;
        
        // Merge: 40% question + 60% data
        finalOverallScore = (questionScore * 0.4) + (finalOverallScore * 0.6);
        finalAccuracy = Math.max(questionAccuracy, accuracy);
        finalAuditMode = "merged";
      }
    }
    
    // Determine overall status
    let overallStatus = "Critical Risk";
    if (finalOverallScore > 80) overallStatus = "Strong Retention System";
    else if (finalOverallScore > 60) overallStatus = "Stable but Untapped";
    else if (finalOverallScore > 30) overallStatus = "Needs Attention";

    // Update audit with data mode results
    await supabaseClient
      .from("audits")
      .update({
        audit_mode: finalAuditMode,
        overall_score: finalOverallScore,
        status: overallStatus,
        accuracy: finalAccuracy,
        data_metrics_count: validMetricsFound,
        csv_data: { metrics: foundMetrics, row_count: rows.length },
        completed_at: new Date().toISOString()
      })
      .eq("id", auditId);

    return new Response(
      JSON.stringify({
        success: true,
        overallScore: finalOverallScore,
        accuracy,
        metricsFound: validMetricsFound,
        metrics: foundMetrics
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CSV processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
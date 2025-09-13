import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

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
    const { upload_id } = await req.json();

    if (!upload_id) {
      throw new Error('Upload ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Get analysis results
    const { data: analysis, error: analysisError } = await supabase
      .from('churn_analysis_results')
      .select('*')
      .eq('upload_id', upload_id)
      .single();

    if (analysisError || !analysis) {
      // If analysis not ready, return a placeholder
      return new Response(JSON.stringify({
        status: 'processing',
        message: 'Analysis still in progress...'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format summary for frontend
    const summary = {
      total_customers: analysis.total_customers,
      high_risk_percentage: Math.round((analysis.high_risk_customers / analysis.total_customers) * 100),
      medium_risk_percentage: Math.round((analysis.medium_risk_customers / analysis.total_customers) * 100),
      low_risk_percentage: Math.round((analysis.low_risk_customers / analysis.total_customers) * 100),
      overall_churn_rate: analysis.churn_rate,
      top_churn_reasons: analysis.top_churn_drivers?.slice(0, 3).map((r: any) => r.reason) || [
        'Long time since last login',
        'Very low login frequency', 
        'High support burden'
      ],
      risk_distribution: {
        high: analysis.high_risk_customers,
        medium: analysis.medium_risk_customers,
        low: analysis.low_risk_customers
      },
      quick_insights: [
        `${analysis.high_risk_customers} customers need immediate attention`,
        `Top concern: ${analysis.top_churn_drivers?.[0]?.reason || 'Login activity'}`,
        `${Math.round((analysis.low_risk_customers / analysis.total_customers) * 100)}% of customers are healthy`
      ]
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Summary error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
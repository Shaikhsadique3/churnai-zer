import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import * as Papa from "https://esm.sh/papaparse@5.4.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomerData {
  customer_id: string;
  monthly_revenue: number;
  payment_status: string;
  days_since_signup: number;
  last_login_days_ago: number;
  logins_last30days: number;
  active_features_used: number;
  tickets_opened: number;
  NPS_score: number;
  churned?: number;
}

interface PredictionResult {
  customer_id: string;
  monthly_revenue: number;
  churn_score: number;
  churn_probability: number;
  risk_level: string;
  churn_reason: string;
  shap_explanation: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { upload_id, csv_data } = await req.json();

    if (!upload_id || !csv_data) {
      return new Response(
        JSON.stringify({ error: 'Missing upload_id or csv_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse CSV
    const customers: CustomerData[] = typeof csv_data === 'string' 
      ? Papa.parse(csv_data, { header: true, skipEmptyLines: true }).data as CustomerData[]
      : csv_data;

    console.log('Processing churn predictions for dataset');

    // Generate predictions for each customer
    const predictions: PredictionResult[] = customers.map((customer) => {
      const prediction = calculateChurnPrediction(customer);
      return {
        customer_id: customer.customer_id,
        monthly_revenue: customer.monthly_revenue,
        ...prediction
      };
    });

    // Store predictions in database
    const predictionRecords = predictions.map(pred => ({
      upload_id,
      user_id: user.id,
      customer_id: pred.customer_id,
      monthly_revenue: pred.monthly_revenue,
      churn_score: pred.churn_score,
      churn_probability: pred.churn_probability,
      risk_level: pred.risk_level,
      churn_reason: pred.churn_reason,
      shap_explanation: pred.shap_explanation
    }));

    const { data: insertedPredictions, error: insertError } = await supabase
      .from('predictions')
      .insert(predictionRecords)
      .select();

    if (insertError) {
      console.error('Error inserting predictions:', insertError);
      throw insertError;
    }

    // Calculate analytics
    const analytics = calculateAnalytics(predictions);

    // Update upload status
    await supabase
      .from('uploads')
      .update({ status: 'completed', processed_at: new Date().toISOString() })
      .eq('id', upload_id);

    console.log('Churn prediction completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        predictions,
        analytics
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Prediction error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process predictions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateChurnPrediction(customer: CustomerData) {
  let churnScore = 0;
  const reasons: string[] = [];
  const shapValues: any = {};

  // Payment behavior (30% weight)
  if (customer.payment_status === 'failed' || customer.payment_status === 'canceled') {
    churnScore += 30;
    reasons.push('Payment issues detected');
    shapValues.payment_status = 0.3;
  } else {
    shapValues.payment_status = -0.1;
  }

  // Engagement metrics (25% weight)
  if (customer.last_login_days_ago > 30) {
    churnScore += 25;
    reasons.push(`No login in ${customer.last_login_days_ago} days`);
    shapValues.last_login = 0.25;
  } else if (customer.last_login_days_ago > 14) {
    churnScore += 15;
    reasons.push('Low recent engagement');
    shapValues.last_login = 0.15;
  } else {
    shapValues.last_login = -0.1;
  }

  // Login frequency (15% weight)
  if (customer.logins_last30days < 3) {
    churnScore += 15;
    reasons.push('Very low login frequency');
    shapValues.logins_last30days = 0.15;
  } else if (customer.logins_last30days < 8) {
    churnScore += 8;
    reasons.push('Below average login frequency');
    shapValues.logins_last30days = 0.08;
  } else {
    shapValues.logins_last30days = -0.08;
  }

  // Feature adoption (15% weight)
  if (customer.active_features_used < 2) {
    churnScore += 15;
    reasons.push('Limited feature adoption');
    shapValues.active_features = 0.15;
  } else if (customer.active_features_used < 4) {
    churnScore += 8;
    reasons.push('Moderate feature usage');
    shapValues.active_features = 0.08;
  } else {
    shapValues.active_features = -0.1;
  }

  // Support tickets (10% weight)
  if (customer.tickets_opened > 5) {
    churnScore += 10;
    reasons.push('High support burden');
    shapValues.tickets_opened = 0.1;
  } else if (customer.tickets_opened > 2) {
    churnScore += 5;
    shapValues.tickets_opened = 0.05;
  } else {
    shapValues.tickets_opened = -0.05;
  }

  // NPS Score (5% weight)
  if (customer.NPS_score < 30) {
    churnScore += 5;
    reasons.push('Low satisfaction (NPS < 30)');
    shapValues.nps_score = 0.05;
  } else if (customer.NPS_score < 50) {
    churnScore += 2;
    shapValues.nps_score = 0.02;
  } else {
    shapValues.nps_score = -0.05;
  }

  // Determine risk level
  let riskLevel: string;
  if (churnScore >= 60) {
    riskLevel = 'high';
  } else if (churnScore >= 35) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Calculate probability (normalized score)
  const churnProbability = Math.min(churnScore / 100, 0.95);

  return {
    churn_score: churnScore,
    churn_probability: churnProbability,
    risk_level: riskLevel,
    churn_reason: reasons.length > 0 ? reasons.join('; ') : 'Customer showing healthy engagement',
    shap_explanation: shapValues
  };
}

function calculateAnalytics(predictions: PredictionResult[]) {
  const totalCustomers = predictions.length;
  const highRisk = predictions.filter(p => p.risk_level === 'high').length;
  const mediumRisk = predictions.filter(p => p.risk_level === 'medium').length;
  const lowRisk = predictions.filter(p => p.risk_level === 'low').length;

  const avgChurnScore = predictions.reduce((sum, p) => sum + p.churn_score, 0) / totalCustomers;
  const totalRevenue = predictions.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
  const atRiskRevenue = predictions
    .filter(p => p.risk_level === 'high' || p.risk_level === 'medium')
    .reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);

  // Industry benchmark: Average SaaS churn rate is ~5-7%
  const industryBenchmark = 6.0;
  const predictedChurnRate = (highRisk / totalCustomers) * 100;

  return {
    total_customers: totalCustomers,
    high_risk_count: highRisk,
    medium_risk_count: mediumRisk,
    low_risk_count: lowRisk,
    average_churn_score: Math.round(avgChurnScore * 10) / 10,
    predicted_churn_rate: Math.round(predictedChurnRate * 10) / 10,
    industry_benchmark: industryBenchmark,
    total_mrr: totalRevenue,
    at_risk_mrr: atRiskRevenue,
    revenue_at_risk_percentage: totalRevenue > 0 ? Math.round((atRiskRevenue / totalRevenue) * 100) : 0
  };
}

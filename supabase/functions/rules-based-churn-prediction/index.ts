import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Industry-standard rules-based churn prediction
function calculateChurnScore(customer: any): {
  churn_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  recommendations: string[];
} {
  let score = 0;
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // Rule 1: Payment Status (30 points)
  if (customer.payment_status === 'failed' || customer.payment_status === 'overdue') {
    score += 30;
    reasons.push('Payment issues detected');
    recommendations.push('Offer flexible payment options or payment plan');
  }

  // Rule 2: Login Activity (25 points)
  const lastLoginDays = Number(customer.last_login_days_ago) || 0;
  if (lastLoginDays > 30) {
    score += 25;
    reasons.push('Inactive for over 30 days');
    recommendations.push('Send re-engagement campaign with product value highlights');
  } else if (lastLoginDays > 14) {
    score += 15;
    reasons.push('Decreasing engagement');
    recommendations.push('Trigger personalized win-back email');
  }

  // Rule 3: Login Frequency (20 points)
  const logins = Number(customer.logins_last30days) || 0;
  if (logins === 0) {
    score += 20;
    reasons.push('Zero logins in last 30 days');
    recommendations.push('Immediate intervention needed - reach out personally');
  } else if (logins < 3) {
    score += 12;
    reasons.push('Very low login frequency');
    recommendations.push('Send product tips and success stories');
  }

  // Rule 4: Feature Adoption (15 points)
  const featuresUsed = Number(customer.active_features_used) || 0;
  if (featuresUsed === 0) {
    score += 15;
    reasons.push('No feature adoption');
    recommendations.push('Provide onboarding assistance and feature tutorials');
  } else if (featuresUsed < 2) {
    score += 8;
    reasons.push('Low feature usage');
    recommendations.push('Highlight unused features with quick-win guides');
  }

  // Rule 5: Support Tickets (10 points)
  const tickets = Number(customer.tickets_opened) || 0;
  if (tickets > 5) {
    score += 10;
    reasons.push('High support ticket volume');
    recommendations.push('Schedule success call to resolve pain points');
  } else if (tickets > 2) {
    score += 5;
    reasons.push('Multiple support requests');
    recommendations.push('Proactive check-in to ensure satisfaction');
  }

  // Rule 6: NPS Score (15 points)
  const nps = Number(customer.NPS_score);
  if (!isNaN(nps)) {
    if (nps <= 6) {
      score += 15;
      reasons.push('Detractor (NPS ≤ 6)');
      recommendations.push('Urgent: Schedule feedback call and address concerns');
    } else if (nps <= 8) {
      score += 8;
      reasons.push('Passive (NPS 7-8)');
      recommendations.push('Convert to promoter with exclusive benefits');
    }
  }

  // Rule 7: Revenue Contribution (10 points)
  const revenue = Number(customer.monthly_revenue) || 0;
  if (revenue === 0) {
    score += 10;
    reasons.push('Free tier user with no revenue');
    recommendations.push('Showcase ROI and upgrade benefits');
  }

  // Rule 8: Early Stage Risk (5 points)
  const daysSinceSignup = Number(customer.days_since_signup) || 0;
  if (daysSinceSignup < 30 && logins < 5) {
    score += 5;
    reasons.push('Poor onboarding experience');
    recommendations.push('Send onboarding sequence with quick wins');
  }

  // Determine risk level
  let risk_level: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 70) risk_level = 'critical';
  else if (score >= 50) risk_level = 'high';
  else if (score >= 30) risk_level = 'medium';
  else risk_level = 'low';

  return {
    churn_score: Math.min(score, 100) / 100, // Normalize to 0-1
    risk_level,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Customer appears stable',
    recommendations: recommendations.length > 0 ? recommendations : ['Continue standard engagement']
  };
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

    const { customers } = await req.json();

    if (!Array.isArray(customers) || customers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid customer data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${customers.length} customers with rules-based prediction`);

    const results = customers.map((customer, index) => {
      const prediction = calculateChurnScore(customer);
      
      return {
        customer_id: customer.customer_id || `customer_${index + 1}`,
        customer_email: customer.customer_email || customer.email,
        monthly_revenue: Number(customer.monthly_revenue) || 0,
        ...prediction,
        processed_at: new Date().toISOString()
      };
    });

    // Calculate analytics
    const totalCustomers = results.length;
    const criticalRisk = results.filter(r => r.risk_level === 'critical').length;
    const highRisk = results.filter(r => r.risk_level === 'high').length;
    const mediumRisk = results.filter(r => r.risk_level === 'medium').length;
    const lowRisk = results.filter(r => r.risk_level === 'low').length;

    const avgChurnScore = results.reduce((sum, r) => sum + r.churn_score, 0) / totalCustomers;
    const totalRevenue = results.reduce((sum, r) => sum + r.monthly_revenue, 0);
    const atRiskRevenue = results
      .filter(r => r.risk_level === 'high' || r.risk_level === 'critical')
      .reduce((sum, r) => sum + r.monthly_revenue, 0);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        analytics: {
          total_customers: totalCustomers,
          avg_churn_score: avgChurnScore,
          risk_distribution: {
            critical: criticalRisk,
            high: highRisk,
            medium: mediumRisk,
            low: lowRisk
          },
          revenue_at_risk: atRiskRevenue,
          total_revenue: totalRevenue,
          churn_rate_estimate: ((criticalRisk + highRisk) / totalCustomers * 100).toFixed(2)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Rules-based prediction error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
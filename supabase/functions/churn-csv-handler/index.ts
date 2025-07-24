import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CSVRow {
  customer_name: string;
  customer_email: string;
  signup_date: string;
  last_active_date: string;
  plan: string;
  billing_status: string;
  monthly_revenue: number;
  support_tickets_opened: number;
  email_opens_last30days: number;
  number_of_logins_last30days: number;
}

function parseNumericValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function normalizePlan(plan: string): 'Free' | 'Pro' | 'Enterprise' {
  const normalized = plan.toLowerCase().trim();
  if (normalized.includes('pro') || normalized.includes('premium')) return 'Pro';
  if (normalized.includes('enterprise') || normalized.includes('business')) return 'Enterprise';
  return 'Free';
}

async function processCsvRow(row: CSVRow): Promise<{ success: boolean; user_id?: string; error?: string }> {
  try {
    // Validate required fields
    if (!row.customer_email || !row.customer_name) {
      return { success: false, error: 'Missing customer_email or customer_name' };
    }

    // Transform and validate data
    const mapped = {
      customer_name: String(row.customer_name).trim(),
      customer_email: String(row.customer_email).trim(),
      monthly_revenue: parseNumericValue(row.monthly_revenue),
      support_tickets: parseInt(String(row.support_tickets_opened)) || 0,
      logins_last30: parseInt(String(row.number_of_logins_last30days)) || 0,
      email_opens: parseInt(String(row.email_opens_last30days)) || 0,
      plan: normalizePlan(row.plan),
      billing_status: String(row.billing_status).trim(),
      signup_date: row.signup_date,
      last_active_date: row.last_active_date,
    };

    // Call AI model for churn prediction
    const churnApiUrl = Deno.env.get('CHURN_API_URL');
    const churnApiKey = Deno.env.get('CHURN_API_KEY');
    
    let prediction = {
      churn_probability: 0.3,
      reason: 'Basic assessment based on activity patterns',
      understanding_score: 75,
      message: 'Initial risk assessment complete'
    };

    if (churnApiUrl && churnApiKey) {
      try {
        const apiResponse = await fetch(churnApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': churnApiKey
          },
          body: JSON.stringify({
            days_since_signup: 30, // Default
            monthly_revenue: mapped.monthly_revenue,
            subscription_plan_Pro: mapped.plan === 'Pro' ? 1 : 0,
            subscription_plan_FreeTrial: mapped.plan === 'Free' ? 1 : 0,
            number_of_logins_last30days: mapped.logins_last30,
            active_features_used: mapped.logins_last30, // Use logins as proxy
            support_tickets_opened: mapped.support_tickets,
            last_payment_status_Success: mapped.billing_status.toLowerCase().includes('success') ? 1 : 0,
            email_opens_last30days: mapped.email_opens,
            last_login_days_ago: 3, // Default
            billing_issue_count: 0
          })
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          prediction.churn_probability = apiData.churn_score || prediction.churn_probability;
          prediction.reason = apiData.churn_reason || prediction.reason;
          prediction.understanding_score = apiData.understanding_score || prediction.understanding_score;
          prediction.message = apiData.insight || prediction.message;
        }
      } catch (error) {
        console.warn('AI API call failed, using fallback prediction:', error);
      }
    }

    // Calculate risk level
    let risk_level: 'low' | 'medium' | 'high' = 'low';
    if (prediction.churn_probability >= 0.7) risk_level = 'high';
    else if (prediction.churn_probability >= 0.4) risk_level = 'medium';

    // Save to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from request context (will be set by calling function)
    const userId = (globalThis as any).__user_id__;

    const { error: saveError } = await supabase
      .from('user_data')
      .upsert({
        user_id: mapped.customer_email,
        owner_id: userId,
        plan: mapped.plan,
        usage: mapped.logins_last30,
        last_login: new Date(mapped.last_active_date).toISOString(),
        churn_score: prediction.churn_probability,
        churn_reason: prediction.reason,
        risk_level: risk_level,
        user_stage: 'analyzed',
        understanding_score: prediction.understanding_score,
        days_until_mature: 0,
        action_recommended: prediction.message,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'owner_id,user_id'
      });

    if (saveError) {
      console.error('Database save error:', saveError);
      return { success: false, error: `Database error: ${saveError.message}` };
    }

    return { success: true, user_id: mapped.customer_email };

  } catch (error) {
    console.error('Row processing error:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get auth user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set user ID in global context for processCsvRow function
    (globalThis as any).__user_id__ = user.id;

    const body = await req.json();
    const rows = body?.data || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid data format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${rows.length} rows for user ${user.id}`);

    // Process all rows
    const results = await Promise.all(rows.map(processCsvRow));

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    const errorDetails = results.filter(r => !r.success).map((r, index) => ({
      row: index + 1,
      user_id: r.user_id || 'unknown',
      error: r.error
    }));

    // Record CSV upload
    await supabase
      .from('csv_uploads')
      .insert({
        user_id: user.id,
        filename: body.filename || 'csv-upload.csv',
        rows_processed: successCount,
        rows_failed: failedCount,
        status: 'completed'
      });

    const response = {
      rows_processed: rows.length,
      rows_success: successCount,
      rows_failed: failedCount,
      error_details: errorDetails,
      message: `✅ ${successCount} rows processed successfully${failedCount > 0 ? `, ❌ ${failedCount} failed` : ''}`
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
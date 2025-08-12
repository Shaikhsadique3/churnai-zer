
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-sdk-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract API key from x-api-key header (preferred) or Authorization header (fallback)
    let apiKey = req.headers.get('x-api-key')?.trim()
    
    if (!apiKey) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim()
        // Only use if it looks like our API key format (cg_...) not a JWT
        if (token.startsWith('cg_')) {
          apiKey = token
        }
      }
    }

    const traceId = crypto.randomUUID()
    
    if (!apiKey) {
      console.error(`[TRACE ${traceId}] Missing API key in headers`)
      return new Response(
        JSON.stringify({ 
          error: 'Missing API key. Use x-api-key header.',
          trace_id: traceId 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key against api_keys table
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error(`[TRACE ${traceId}] Invalid API key:`, apiKey.substring(0, 6) + '...');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or inactive API key',
          trace_id: traceId 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ownerId = apiKeyData.user_id;

    // Parse request body
    const userData = await req.json();
    
    console.log(`[TRACE ${traceId}] SDK Track request received for user: ${userData.user_id}`);

    // Validate required fields
    const requiredFields = ['user_id', 'email'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        console.error(`[TRACE ${traceId}] Missing required field:`, field)
        return new Response(
          JSON.stringify({ 
            error: `Missing required field: ${field}`,
            trace_id: traceId 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Call the churn prediction API
    const churnApiUrl = Deno.env.get('CHURN_API_URL');
    const churnApiKey = Deno.env.get('CHURN_API_KEY');

    if (!churnApiUrl || !churnApiKey) {
      console.error(`[TRACE ${traceId}] Missing churn API configuration`);
      return new Response(
        JSON.stringify({ 
          error: 'Churn prediction service unavailable',
          trace_id: traceId 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for churn prediction
    const predictionData = {
      user_id: userData.user_id,
      customer_name: userData.customer_name || userData.email?.split('@')[0] || 'Unknown',
      customer_email: userData.email,
      days_since_signup: userData.days_since_signup || 0,
      monthly_revenue: userData.monthly_revenue || 0,
      subscription_plan: userData.subscription_plan || 'Free',
      number_of_logins_last30days: userData.number_of_logins_last30days || 1,
      active_features_used: userData.active_features_used || 1,
      support_tickets_opened: userData.support_tickets_opened || 0,
      last_payment_status: userData.last_payment_status || 'active',
      email_opens_last30days: userData.email_opens_last30days || 0,
      last_login_days_ago: userData.last_login_days_ago || 0,
      billing_issue_count: userData.billing_issue_count || 0,
      trace_id: traceId
    };

    // Get churn prediction
    const predictionResponse = await fetch(churnApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${churnApiKey}`
      },
      body: JSON.stringify(predictionData)
    });

    if (!predictionResponse.ok) {
      console.error(`[TRACE ${traceId}] Churn prediction API failed:`, predictionResponse.status);
      return new Response(
        JSON.stringify({ 
          error: 'Churn prediction failed',
          trace_id: traceId 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const predictionResult = await predictionResponse.json();
    
    console.log(`[TRACE ${traceId}] Churn prediction successful:`, {
      user_id: userData.user_id,
      churn_score: predictionResult.churn_score,
      risk_level: predictionResult.risk_level
    });

    // Store user data in database
    const { error: insertError } = await supabase
      .from('user_data')
      .upsert({
        user_id: userData.user_id,
        owner_id: ownerId,
        churn_score: predictionResult.churn_score,
        risk_level: predictionResult.risk_level,
        churn_reason: predictionResult.churn_reason,
        action_recommended: predictionResult.action_recommended,
        monthly_revenue: userData.monthly_revenue || 0,
        plan: userData.subscription_plan || 'Free',
        usage: userData.number_of_logins_last30days || 1,
        last_login: new Date(),
        status: predictionResult.risk_level === 'high' ? 'at_risk' : 'active',
        source: 'sdk'
      }, {
        onConflict: 'user_id,owner_id'
      });

    if (insertError) {
      console.error(`[TRACE ${traceId}] Failed to save user data:`, insertError);
    }

    // Return prediction result
    return new Response(
      JSON.stringify({
        status: 'ok',
        result: predictionResult,
        trace_id: traceId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const traceId = crypto.randomUUID();
    console.error(`[TRACE ${traceId}] SDK Track error:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        trace_id: traceId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

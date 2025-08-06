import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-sdk-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TrackRequest {
  user_id: string;
  days_since_signup: number;
  monthly_revenue: number;
  subscription_plan: string;
  number_of_logins_last30days: number;
  active_features_used: number;
  support_tickets_opened: number;
  last_payment_status: string;
  email_opens_last30days: number;
  last_login_days_ago: number;
  billing_issue_count: number;
  // Optional extended fields
  email?: string;
  customer_name?: string;
  customer_email?: string;
  loginCount?: number;
  dashboardViews?: number;
  feature_usage?: {
    dashboard?: number;
    reports?: number;
    settings?: number;
  };
}

// Utility function to fill missing fields with defaults
function fillDefaults(userData: any): TrackRequest {
  const defaults = {
    user_id: userData.user_id || 'unknown_user',
    email: userData.email || userData.customer_email || 'unknown@example.com',
    customer_name: userData.customer_name || 'Unknown Customer',
    customer_email: userData.customer_email || userData.email || 'unknown@example.com',
    days_since_signup: userData.days_since_signup ?? 30,
    monthly_revenue: userData.monthly_revenue ?? 0,
    subscription_plan: userData.subscription_plan || 'Free Trial',
    number_of_logins_last30days: userData.number_of_logins_last30days ?? userData.loginCount ?? 5,
    active_features_used: userData.active_features_used ?? 3,
    support_tickets_opened: userData.support_tickets_opened ?? 0,
    last_payment_status: userData.last_payment_status || 'Success',
    email_opens_last30days: userData.email_opens_last30days ?? 10,
    last_login_days_ago: userData.last_login_days_ago ?? 1,
    billing_issue_count: userData.billing_issue_count ?? 0,
    loginCount: userData.loginCount ?? userData.number_of_logins_last30days ?? 5,
    dashboardViews: userData.dashboardViews ?? 15,
    feature_usage: {
      dashboard: userData.feature_usage?.dashboard ?? 10,
      reports: userData.feature_usage?.reports ?? 5,
      settings: userData.feature_usage?.settings ?? 2,
    }
  };
  
  // Log which fields were filled with defaults
  const filledFields = [];
  for (const [key, value] of Object.entries(defaults)) {
    if (key === 'feature_usage') {
      // Handle nested feature_usage separately
      if (!userData.feature_usage) {
        filledFields.push('feature_usage (entire object)');
      } else {
        if (userData.feature_usage.dashboard === undefined) filledFields.push('feature_usage.dashboard');
        if (userData.feature_usage.reports === undefined) filledFields.push('feature_usage.reports');
        if (userData.feature_usage.settings === undefined) filledFields.push('feature_usage.settings');
      }
    } else if (userData[key] === undefined || userData[key] === null) {
      filledFields.push(key);
    }
  }
  
  if (filledFields.length > 0) {
    console.log(`Auto-filled missing fields for user ${defaults.user_id}:`, filledFields);
  }
  
  return defaults;
}

interface ChurnResponse {
  churn_score: number;
  churn_reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Parse request body first
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get API key from header (case-insensitive) or from request body
    let apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key') || req.headers.get('x-churnaizer-api-key');
    
    // If no API key in headers, try to get it from request body
    if (!apiKey) {
      apiKey = body.api_key || body.apiKey;
    }
    
    if (!apiKey) {
      console.log('No API key found in headers or body');
      return new Response(
        JSON.stringify({ code: 401, message: 'API key is required. Include it in X-API-Key header or api_key field in request body.' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get allowed API keys from environment (fallback to database if not set)
    const allowedKeysEnv = Deno.env.get('ALLOWED_API_KEYS');
    let ownerId: string;

    if (allowedKeysEnv) {
      // Validate against ENV list
      const allowedKeys = allowedKeysEnv.split(',').map(key => key.trim());
      if (!allowedKeys.includes(apiKey)) {
        console.log('API key not in ENV allowlist:', apiKey);
        return new Response(
          JSON.stringify({ code: 401, message: 'Unauthorized' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      // For ENV validation, use a default owner ID or derive from API key position
      ownerId = Deno.env.get('DEFAULT_OWNER_ID') || 'env-validated-user';
      console.log('Valid API key from ENV:', apiKey);
    } else {
      // Fallback to database validation
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('user_id, is_active')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (keyError || !keyData) {
        console.log('API key validation failed:', keyError);
        return new Response(
          JSON.stringify({ code: 401, message: 'Unauthorized' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      ownerId = keyData.user_id;
      console.log('Valid API key for user:', ownerId);
    }

    // Handle both single user and batch (array) requests
    const rawUsers = Array.isArray(body) ? body : [body];
    const results = [];

    for (const rawUserData of rawUsers) {
      // Fill defaults for missing fields instead of failing
      const userData = fillDefaults(rawUserData);
      
      const { 
        user_id, 
        days_since_signup, 
        monthly_revenue, 
        subscription_plan, 
        number_of_logins_last30days,
        active_features_used,
        support_tickets_opened,
        last_payment_status,
        email_opens_last30days,
        last_login_days_ago,
        billing_issue_count
      } = userData;

      console.log('Processing tracking request for user:', user_id);

      try {
        console.log('Processing prediction for user:', user_id);

        // Always attempt real API call to external churn prediction model
        const churnApiUrl = Deno.env.get('CHURN_API_URL') || 'https://ai-model-rumc.onrender.com/api/v1/predict';
        const churnApiKey = Deno.env.get('CHURN_API_KEY');

        let churnScore = null;
        let churnReason = 'AI prediction failed - external API unavailable';
        let riskLevel: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
        
        if (churnApiUrl && churnApiKey) {
          try {
            // One-hot encode categorical fields
            const subscription_plan_Pro = subscription_plan === 'Pro' ? 1 : 0;
            const subscription_plan_FreeTrial = subscription_plan === 'Free Trial' ? 1 : 0;
            const last_payment_status_Success = last_payment_status === 'Success' ? 1 : 0;
            
            // Prepare data for AI model v5 with one-hot encoding
            const modelData = {
              days_since_signup,
              monthly_revenue,
              subscription_plan_Pro,
              subscription_plan_FreeTrial,
              number_of_logins_last30days,
              active_features_used,
              support_tickets_opened,
              last_payment_status_Success,
              email_opens_last30days,
              last_login_days_ago,
              billing_issue_count
            };
            
            const churnResponse = await fetch(churnApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${churnApiKey}`,
              },
              body: JSON.stringify(modelData),
            });

            if (churnResponse.ok) {
              const churnData: ChurnResponse = await churnResponse.json();
              churnScore = churnData.churn_score;
              churnReason = churnData.churn_reason || 'AI model prediction based on user behavior patterns';
              console.log('Received churn prediction from AI v5:', { churnScore, churnReason });
            } else {
              console.warn('Churn API request failed, using fallback');
            }
          } catch (apiError) {
            console.warn('Churn API error, using fallback:', apiError);
          }
        } else {
          console.warn('Missing CHURN_API_URL or CHURN_API_KEY, using fallback score');
        }

        // Enhanced lifecycle-aware analysis
        let understandingScore = 0;
        let statusTag = '';
        let actionRecommended = '';
        let daysUntilMature = 0;

        // Analyze user lifecycle stage
        if (days_since_signup < 7) {
          // New User
          understandingScore = Math.min(40, days_since_signup * 5 + 10);
          statusTag = 'new_user';
          daysUntilMature = 7 - days_since_signup;
          if (churnScore === null) {
            churnReason = 'Too early to predict churn accurately – Need at least 7 days of behavior data.';
          }
          actionRecommended = 'Keep tracking. Reliable insights coming soon.';
        } else if (days_since_signup < 15) {
          // Growing User
          understandingScore = 40 + ((days_since_signup - 7) * 2.5);
          statusTag = 'growing_user';
          if (churnScore === null) {
            churnReason = 'Prediction getting stronger. More behavior signals are now available.';
          }
          actionRecommended = 'Monitor usage daily. Prediction is moderately accurate.';
        } else {
          // Mature User
          understandingScore = Math.min(100, 70 + ((days_since_signup - 15) * 0.5));
          statusTag = 'mature_user';
        }

        // Calculate risk level based on churn score
        if (churnScore === null) {
          riskLevel = 'medium'; // Use medium as fallback instead of unknown
          console.log('AI prediction failed - setting risk level to medium as fallback');
        } else if (churnScore >= 0.7) {
          riskLevel = 'high';
        } else if (churnScore >= 0.4) {
          riskLevel = 'medium';
        } else {
          riskLevel = 'low';
        }

        // Enhanced status tags and actions based on risk + maturity
        if (days_since_signup >= 15) {
          if (churnScore === null) {
            statusTag = 'mature_unknown';
            actionRecommended = 'AI prediction failed. Manual review recommended for mature user.';
          } else if (churnScore < 0.3) {
            statusTag = 'mature_safe';
            actionRecommended = 'Low risk of churn. Consider upsell or referral opportunities.';
          } else if (churnScore >= 0.5) {
            statusTag = 'high_risk_mature';
            actionRecommended = 'Send win-back email or offer discount. Consider urgent retention action.';
          } else {
            statusTag = 'medium_risk_mature';
            actionRecommended = 'Monitor closely. Consider engagement campaigns.';
          }
        }

        console.log('Enhanced analysis:', { riskLevel, understandingScore, statusTag, daysUntilMature });

        // Map subscription_plan to database plan enum
        const planMapping: { [key: string]: 'Free' | 'Pro' | 'Enterprise' } = {
          'Free Trial': 'Free',
          'Pro': 'Pro',
          'Enterprise': 'Enterprise'
        };
        const validatedPlan = planMapping[subscription_plan] || 'Free';

        // Calculate last_login from days_ago
        const lastLoginDate = new Date();
        lastLoginDate.setDate(lastLoginDate.getDate() - last_login_days_ago);
        
        // Save full model output to user_data table
        const { error: saveError } = await supabase
          .from('user_data')
          .upsert({
            user_id,
            owner_id: ownerId,
            plan: validatedPlan,
            usage: monthly_revenue, // Store monthly revenue in usage field
            last_login: lastLoginDate.toISOString(),
            churn_score: churnScore,
            churn_reason: churnReason || "🕵️ No strong signals yet",
            risk_level: riskLevel,
            user_stage: statusTag,
            understanding_score: Math.round(understandingScore),
            days_until_mature: daysUntilMature,
            action_recommended: actionRecommended,
            monthly_revenue: monthly_revenue,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'owner_id,user_id'
          });

        if (saveError) {
          console.error('Failed to save user data:', saveError);
          results.push({
            status: 'error',
            user_id,
            error: 'Failed to save tracking data'
          });
          continue;
        }

        console.log('Successfully saved user data for:', user_id);

        // Log SDK health data
        try {
          const { data: apiKeyData } = await supabase
            .from('api_keys')
            .select('id')
            .eq('key', apiKey)
            .eq('user_id', ownerId)
            .single();

          await supabase
            .from('sdk_health_logs')
            .insert({
              user_id: ownerId,
              api_key_id: apiKeyData?.id || null,
              ping_timestamp: new Date().toISOString(),
              status: 'success',
              request_data: { user_id, plan: validatedPlan, revenue: monthly_revenue },
              user_agent: req.headers.get('user-agent') || null,
              source: 'sdk'
            });
        } catch (logError) {
          console.warn('Failed to log SDK health data:', logError);
        }

        // Update user_data source to mark as SDK
        await supabase
          .from('user_data')
          .update({ source: 'sdk' })
          .eq('owner_id', ownerId)
          .eq('user_id', user_id);

        results.push({
          status: 'ok',
          user_id,
          churn_probability: churnScore,
          churn_score: churnScore,
          reason: churnReason,
          churn_reason: churnReason,
          message: actionRecommended,
          risk_level: riskLevel,
          understanding_score: understandingScore,
          shouldTriggerEmail: riskLevel === 'high',
          recommended_tone: riskLevel === 'high' ? 'empathetic' : 'friendly',
          status_tag: statusTag,
          action_recommended: actionRecommended,
          days_until_mature: daysUntilMature
        });

      } catch (userError) {
        console.error(`Error processing user ${user_id}:`, userError);
        
        // Log error to SDK health
        try {
          const { data: apiKeyData } = await supabase
            .from('api_keys')
            .select('id')
            .eq('key', apiKey)
            .eq('user_id', ownerId)
            .single();

          await supabase
            .from('sdk_health_logs')
            .insert({
              user_id: ownerId,
              api_key_id: apiKeyData?.id || null,
              ping_timestamp: new Date().toISOString(),
              status: 'error',
              error_message: userError.message || 'Processing failed',
              request_data: { user_id: user_id || 'unknown' },
              user_agent: req.headers.get('user-agent') || null
            });
        } catch (logError) {
          console.warn('Failed to log SDK error:', logError);
        }

        results.push({
          status: 'error',
          user_id,
          error: 'Processing failed'
        });
      }
    }

    // Return batch results
    const successful = results.filter(r => r.status === 'ok').length;
    const failed = results.filter(r => r.status === 'error').length;

    // Process playbooks after successful user data processing
    if (successful > 0) {
      try {
        console.log('Triggering playbook processing for updated users...');
        
        // Call the process-playbooks function
        const playbookResponse = await fetch(`${supabaseUrl}/functions/v1/process-playbooks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });

        if (playbookResponse.ok) {
          const playbookResult = await playbookResponse.json();
          console.log('Playbooks processed:', playbookResult);
        } else {
          console.warn('Playbook processing failed, but continuing...');
        }
      } catch (playbookError) {
        console.warn('Error triggering playbooks, but continuing:', playbookError);
      }
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        processed: successful,
        failed: failed,
        total: results.length,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
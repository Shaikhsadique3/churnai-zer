
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
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
    // Get API key from header (case-sensitive)
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing X-API-Key header' }),
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

    // Verify API key and get owner
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      console.log('API key validation failed:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const ownerId = keyData.user_id;
    console.log('Valid API key for user:', ownerId);

    // Parse request body - handle both single user and batch (array) requests
    const body = await req.json();
    const users: TrackRequest[] = Array.isArray(body) ? body : [body];
    const results = [];

    for (const userData of users) {
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

      // Validate all required fields for this user
      const requiredFields = [
        'user_id', 'days_since_signup', 'monthly_revenue', 'subscription_plan',
        'number_of_logins_last30days', 'active_features_used', 'support_tickets_opened',
        'last_payment_status', 'email_opens_last30days', 'last_login_days_ago', 'billing_issue_count'
      ];
      
      const missingFields = requiredFields.filter(field => userData[field] === undefined || userData[field] === null);
      
      if (missingFields.length > 0) {
        console.error(`Missing required fields for user ${user_id || 'unknown'}:`, missingFields);
        results.push({
          status: 'error',
          user_id: user_id || 'unknown',
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
        continue;
      }

      console.log('Processing tracking request for user:', user_id);

      try {
        // Call external churn prediction API with fallback
        const churnApiUrl = Deno.env.get('CHURN_API_URL');
        const churnApiKey = Deno.env.get('CHURN_API_KEY');

        let churnScore = 0.5; // Default fallback score
        let churnReason = 'Fallback prediction - external API unavailable';
        
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
        let riskLevel: 'low' | 'medium' | 'high';
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
          churnReason = 'Too early to predict churn accurately – Need at least 7 days of behavior data.';
          actionRecommended = 'Keep tracking. Reliable insights coming soon.';
        } else if (days_since_signup < 15) {
          // Growing User
          understandingScore = 40 + ((days_since_signup - 7) * 2.5);
          statusTag = 'growing_user';
          churnReason = 'Prediction getting stronger. More behavior signals are now available.';
          actionRecommended = 'Monitor usage daily. Prediction is moderately accurate.';
        } else {
          // Mature User
          understandingScore = Math.min(100, 70 + ((days_since_signup - 15) * 0.5));
          statusTag = 'mature_user';
        }

        // Calculate risk level
        if (churnScore >= 0.7) {
          riskLevel = 'high';
        } else if (churnScore >= 0.4) {
          riskLevel = 'medium';
        } else {
          riskLevel = 'low';
        }

        // Enhanced status tags and actions based on risk + maturity
        if (days_since_signup >= 15) {
          if (churnScore < 0.3) {
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

        results.push({
          status: 'ok',
          churn_score: churnScore,
          churn_reason: churnReason,
          risk_level: riskLevel,
          understanding_score: understandingScore,
          status_tag: statusTag,
          action_recommended: actionRecommended,
          days_until_mature: daysUntilMature,
          user_id
        });

      } catch (userError) {
        console.error(`Error processing user ${user_id}:`, userError);
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

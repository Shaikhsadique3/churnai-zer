import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CSVRow {
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

function analyzeUserStage(daysSignup: number) {
  if (daysSignup < 7) {
    return {
      stage: 'new_user',
      emoji: '🐣',
      label: 'New User',
      understandingScore: Math.min(40, daysSignup * 5 + 10),
      daysUntilMature: 7 - daysSignup,
      skipAutomation: true,
      message: 'Too early to predict churn accurately'
    };
  } else if (daysSignup < 15) {
    return {
      stage: 'growing_user', 
      emoji: '🌱',
      label: 'Growing User',
      understandingScore: 40 + ((daysSignup - 7) * 2.5),
      daysUntilMature: 0,
      skipAutomation: false,
      message: 'Prediction getting stronger'
    };
  } else {
    return {
      stage: 'mature_user',
      emoji: '🌳', 
      label: 'Mature User',
      understandingScore: Math.min(100, 70 + ((daysSignup - 15) * 0.5)),
      daysUntilMature: 0,
      skipAutomation: false,
      message: 'High confidence prediction available'
    };
  }
}

function validateCSVRow(row: any): { isValid: boolean; missingFields: string[] } {
  const requiredFields = [
    'user_id', 'days_since_signup', 'monthly_revenue', 'subscription_plan',
    'number_of_logins_last30days', 'active_features_used', 'support_tickets_opened',
    'last_payment_status', 'email_opens_last30days', 'last_login_days_ago', 'billing_issue_count'
  ];
  
  const missingFields = requiredFields.filter(field => 
    row[field] === undefined || row[field] === null || row[field] === ''
  );
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

async function processChurnPrediction(userData: CSVRow) {
  // Get external API details
  const churnApiUrl = Deno.env.get('CHURN_API_URL');
  const churnApiKey = Deno.env.get('CHURN_API_KEY');

  let churnScore = 0.5;
  let churnReason = 'Fallback prediction - external API unavailable';
  
  // Analyze user stage first
  const stageAnalysis = analyzeUserStage(userData.days_since_signup);
  
  if (churnApiUrl && churnApiKey && !stageAnalysis.skipAutomation) {
    try {
      // One-hot encode categorical fields
      const subscription_plan_Pro = userData.subscription_plan === 'Pro' ? 1 : 0;
      const subscription_plan_FreeTrial = userData.subscription_plan === 'Free Trial' ? 1 : 0;
      const last_payment_status_Success = userData.last_payment_status === 'Success' ? 1 : 0;
      
      const modelData = {
        days_since_signup: userData.days_since_signup,
        monthly_revenue: userData.monthly_revenue,
        subscription_plan_Pro,
        subscription_plan_FreeTrial,
        number_of_logins_last30days: userData.number_of_logins_last30days,
        active_features_used: userData.active_features_used,
        support_tickets_opened: userData.support_tickets_opened,
        last_payment_status_Success,
        email_opens_last30days: userData.email_opens_last30days,
        last_login_days_ago: userData.last_login_days_ago,
        billing_issue_count: userData.billing_issue_count
      };
      
      const response = await fetch(churnApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${churnApiKey}`,
        },
        body: JSON.stringify(modelData),
      });

      if (response.ok) {
        const churnData = await response.json();
        churnScore = churnData.churn_score;
        churnReason = churnData.churn_reason || 'AI model prediction based on user behavior patterns';
      }
    } catch (error) {
      console.warn('Churn API error for user', userData.user_id, error);
    }
  } else if (stageAnalysis.skipAutomation) {
    churnReason = stageAnalysis.message;
  }

  // Calculate risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (churnScore >= 0.7) {
    riskLevel = 'high';
  } else if (churnScore >= 0.4) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Generate action recommendation
  let actionRecommended = '';
  if (stageAnalysis.skipAutomation) {
    actionRecommended = `Wait ${stageAnalysis.daysUntilMature} more days for full prediction`;
  } else if (churnScore < 0.3) {
    actionRecommended = 'Low risk. Consider upsell or referral opportunities.';
  } else if (churnScore >= 0.5) {
    actionRecommended = 'High risk. Send win-back email or offer discount.';
  } else {
    actionRecommended = 'Monitor closely. Consider engagement campaigns.';
  }

  return {
    churn_score: churnScore,
    churn_reason: churnReason,
    risk_level: riskLevel,
    user_stage: stageAnalysis.stage,
    understanding_score: Math.round(stageAnalysis.understandingScore),
    days_until_mature: stageAnalysis.daysUntilMature,
    action_recommended: actionRecommended,
    skip_automation: stageAnalysis.skipAutomation
  };
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
    const { csvData, filename } = await req.json();
    
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSV data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
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
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing CSV for user:', user.id, 'with', csvData.length, 'rows');

    // Record CSV upload
    const { data: uploadRecord } = await supabase
      .from('csv_uploads')
      .insert({
        user_id: user.id,
        filename: filename || 'upload.csv',
        status: 'processing'
      })
      .select()
      .single();

    const results = [];
    let processedCount = 0;
    let failedCount = 0;
    const validationErrors = [];

    for (const [index, row] of csvData.entries()) {
      try {
        // Validate row data
        const validation = validateCSVRow(row);
        
        if (!validation.isValid) {
          console.error(`Row ${index + 1}: Missing fields:`, validation.missingFields);
          validationErrors.push({
            row: index + 1,
            user_id: row.user_id || 'unknown',
            error: `Missing required fields: ${validation.missingFields.join(', ')}`,
            action: 'Please ensure all required columns are present in your CSV'
          });
          failedCount++;
          continue;
        }

        // Process churn prediction with stage analysis
        const prediction = await processChurnPrediction(row);
        
        // Map subscription plan
        const planMapping: { [key: string]: 'Free' | 'Pro' | 'Enterprise' } = {
          'Free Trial': 'Free',
          'Pro': 'Pro', 
          'Enterprise': 'Enterprise'
        };
        const validatedPlan = planMapping[row.subscription_plan] || 'Free';

        // Calculate last login date
        const lastLoginDate = new Date();
        lastLoginDate.setDate(lastLoginDate.getDate() - row.last_login_days_ago);
        
        // Save to database
        const { error: saveError } = await supabase
          .from('user_data')
          .upsert({
            user_id: row.user_id,
            owner_id: user.id,
            plan: validatedPlan,
            usage: row.monthly_revenue,
            last_login: lastLoginDate.toISOString(),
            churn_score: prediction.churn_score,
            churn_reason: prediction.churn_reason,
            risk_level: prediction.risk_level,
            user_stage: prediction.user_stage,
            understanding_score: prediction.understanding_score,
            days_until_mature: prediction.days_until_mature,
            action_recommended: prediction.action_recommended,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'owner_id,user_id'
          });

        if (saveError) {
          console.error(`Failed to save user ${row.user_id}:`, saveError);
          failedCount++;
          continue;
        }

        results.push({
          user_id: row.user_id,
          churn_probability: prediction.churn_score,
          reason: prediction.churn_reason,
          understanding_score: prediction.understanding_score,
          user_stage: prediction.user_stage,
          action: prediction.action_recommended,
          skip_automation: prediction.skip_automation
        });
        
        processedCount++;
        
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        failedCount++;
      }
    }

    // Update upload record
    if (uploadRecord) {
      await supabase
        .from('csv_uploads')
        .update({
          rows_processed: processedCount,
          rows_failed: failedCount,
          status: 'completed'
        })
        .eq('id', uploadRecord.id);
    }

    // Prepare response with validation errors
    const response: any = {
      status: 'completed',
      processed: processedCount,
      failed: failedCount,
      total: csvData.length,
      results
    };

    if (validationErrors.length > 0) {
      response.validation_errors = validationErrors;
      response.message = `Your CSV is missing key columns needed for accurate churn detection. Please review the validation errors.`;
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing CSV:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
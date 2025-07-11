import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MappedCSVRow {
  user_id: string;
  email?: string;
  signup_date?: string;
  last_login_date?: string;
  subscription_plan: string;
  monthly_revenue: number;
  active_features_used: number;
  support_tickets_opened: number;
  payment_status: string;
  email_opens_last30days: number;
  billing_issue_count: number;
  days_since_signup?: number;
  last_login_days_ago?: number;
  number_of_logins_last30days?: number;
}

interface ColumnMapping {
  user_id: string;
  email: string;
  signup_date: string;
  last_login_date: string;
  subscription_plan: string;
  monthly_revenue: string;
  active_features_used: string;
  support_tickets_opened: string;
  payment_status: string;
  email_opens_last30days: string;
  billing_issue_count: string;
  days_since_signup?: string;
  last_login_days_ago?: string;
  number_of_logins_last30days?: string;
}

function parseNumericValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  // Try to parse various date formats
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try common formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  const dateStr = String(dateValue);
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY or MM-DD-YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [, part1, part2, part3] = match;
      // Try different interpretations
      const attempts = [
        new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2)), // MM/DD/YYYY
        new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1)), // DD/MM/YYYY
        new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3)), // YYYY-MM-DD
      ];
      
      for (const attempt of attempts) {
        if (!isNaN(attempt.getTime())) {
          return attempt;
        }
      }
    }
  }
  
  return null;
}

function normalizeSubscriptionPlan(plan: string): 'Free' | 'Pro' | 'Enterprise' {
  const normalized = plan.toLowerCase().trim();
  
  if (normalized.includes('pro') || normalized.includes('premium') || normalized.includes('plus')) {
    return 'Pro';
  }
  if (normalized.includes('enterprise') || normalized.includes('business') || normalized.includes('team')) {
    return 'Enterprise';
  }
  return 'Free'; // Default for free, trial, basic, etc.
}

function normalizePaymentStatus(status: string): string {
  const normalized = status.toLowerCase().trim();
  
  if (normalized.includes('success') || normalized.includes('paid') || normalized.includes('complete')) {
    return 'Success';
  }
  if (normalized.includes('fail') || normalized.includes('error') || normalized.includes('decline')) {
    return 'Failed';
  }
  if (normalized.includes('pending') || normalized.includes('processing')) {
    return 'Pending';
  }
  return status; // Return original if no pattern matches
}

function calculateDaysDifference(fromDate: Date, toDate: Date = new Date()): number {
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function analyzeUserStage(daysSignup: number) {
  if (daysSignup < 7) {
    return {
      stage: 'new_user',
      label: 'New User',
      understandingScore: Math.min(40, daysSignup * 5 + 10),
      daysUntilMature: 7 - daysSignup,
      skipAutomation: true,
      message: 'Too early to predict churn accurately'
    };
  } else if (daysSignup < 15) {
    return {
      stage: 'growing_user', 
      label: 'Growing User',
      understandingScore: 40 + ((daysSignup - 7) * 2.5),
      daysUntilMature: 0,
      skipAutomation: false,
      message: 'Prediction getting stronger'
    };
  } else {
    return {
      stage: 'mature_user',
      label: 'Mature User',
      understandingScore: Math.min(100, 70 + ((daysSignup - 15) * 0.5)),
      daysUntilMature: 0,
      skipAutomation: false,
      message: 'High confidence prediction available'
    };
  }
}

function validateMappedRow(row: MappedCSVRow): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!row.user_id || String(row.user_id).trim() === '') {
    errors.push('Missing user_id');
  }
  
  if (!row.subscription_plan || String(row.subscription_plan).trim() === '') {
    errors.push('Missing subscription_plan');
  }
  
  if (row.monthly_revenue === undefined || row.monthly_revenue === null) {
    errors.push('Missing monthly_revenue');
  }
  
  if (row.active_features_used === undefined || row.active_features_used === null) {
    errors.push('Missing active_features_used');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

async function processChurnPrediction(userData: MappedCSVRow) {
  // Get external API details
  const churnApiUrl = Deno.env.get('CHURN_API_URL');
  const churnApiKey = Deno.env.get('CHURN_API_KEY');

  let churnScore = 0.3; // Default low risk
  let churnReason = '';
  
  // Use days_since_signup or calculate it
  let daysSignup = userData.days_since_signup || 30; // Default if not provided
  if (!userData.days_since_signup && userData.signup_date) {
    const signupDate = parseDate(userData.signup_date);
    if (signupDate) {
      daysSignup = calculateDaysDifference(signupDate);
    }
  }
  
  // Calculate last_login_days_ago if not provided
  let lastLoginDaysAgo = userData.last_login_days_ago || 3; // Default
  if (!userData.last_login_days_ago && userData.last_login_date) {
    const loginDate = parseDate(userData.last_login_date);
    if (loginDate) {
      lastLoginDaysAgo = calculateDaysDifference(loginDate);
    }
  }
  
  // Analyze user stage
  const stageAnalysis = analyzeUserStage(daysSignup);
  
  if (churnApiUrl && churnApiKey && !stageAnalysis.skipAutomation) {
    try {
      // Prepare data for external API
      const normalizedPlan = normalizeSubscriptionPlan(userData.subscription_plan);
      
      const modelData = {
        days_since_signup: daysSignup,
        monthly_revenue: parseNumericValue(userData.monthly_revenue),
        subscription_plan_Pro: normalizedPlan === 'Pro' ? 1 : 0,
        subscription_plan_FreeTrial: normalizedPlan === 'Free' ? 1 : 0,
        number_of_logins_last30days: userData.number_of_logins_last30days || 10,
        active_features_used: parseNumericValue(userData.active_features_used),
        support_tickets_opened: parseNumericValue(userData.support_tickets_opened),
        last_payment_status_Success: normalizePaymentStatus(userData.payment_status) === 'Success' ? 1 : 0,
        email_opens_last30days: parseNumericValue(userData.email_opens_last30days),
        last_login_days_ago: lastLoginDaysAgo,
        billing_issue_count: parseNumericValue(userData.billing_issue_count)
      };
      
      console.log('Calling churn API for user:', userData.user_id, modelData);
      
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
        churnScore = churnData.churn_score || churnScore;
        churnReason = churnData.churn_reason || 'AI model prediction based on user behavior patterns';
      } else {
        console.warn('Churn API error:', response.status, await response.text());
        churnReason = 'Fallback prediction - external API unavailable';
      }
    } catch (error) {
      console.warn('Churn API error for user', userData.user_id, error);
      churnReason = 'Fallback prediction - external API error';
    }
  } else if (stageAnalysis.skipAutomation) {
    churnReason = stageAnalysis.message;
  } else {
    // Simple fallback logic
    let riskFactors = 0;
    if (lastLoginDaysAgo > 14) riskFactors += 0.3;
    if (parseNumericValue(userData.monthly_revenue) === 0) riskFactors += 0.2;
    if (parseNumericValue(userData.support_tickets_opened) > 2) riskFactors += 0.2;
    if (parseNumericValue(userData.email_opens_last30days) < 5) riskFactors += 0.1;
    if (parseNumericValue(userData.billing_issue_count) > 0) riskFactors += 0.2;
    
    churnScore = Math.min(0.8, 0.1 + riskFactors);
    churnReason = 'Prediction based on behavioral patterns and engagement metrics';
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
    last_login_calculated: lastLoginDaysAgo,
    days_since_signup_calculated: daysSignup
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
    const { csvData, filename, mapping } = await req.json();
    
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

    console.log('Processing enhanced CSV for user:', user.id, 'with', csvData.length, 'rows');

    // Record CSV upload
    const { data: uploadRecord } = await supabase
      .from('csv_uploads')
      .insert({
        user_id: user.id,
        filename: filename || 'enhanced-upload.csv',
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
        // Validate mapped row data
        const validation = validateMappedRow(row);
        
        if (!validation.isValid) {
          console.error(`Row ${index + 1}: Validation errors:`, validation.errors);
          validationErrors.push({
            row: index + 1,
            user_id: row.user_id || 'unknown',
            error: `Validation errors: ${validation.errors.join(', ')}`,
            action: 'Please ensure all required fields are mapped correctly'
          });
          failedCount++;
          continue;
        }

        // Process churn prediction
        const prediction = await processChurnPrediction(row);
        
        // Normalize data for database storage
        const normalizedPlan = normalizeSubscriptionPlan(row.subscription_plan);
        
        // Calculate last login date if we have the days ago
        let lastLoginDate = null;
        if (prediction.last_login_calculated) {
          lastLoginDate = new Date();
          lastLoginDate.setDate(lastLoginDate.getDate() - prediction.last_login_calculated);
        }
        
        // Save to database
        const { error: saveError } = await supabase
          .from('user_data')
          .upsert({
            user_id: row.user_id,
            owner_id: user.id,
            plan: normalizedPlan,
            usage: parseNumericValue(row.monthly_revenue),
            last_login: lastLoginDate?.toISOString(),
            churn_score: prediction.churn_score,
            churn_reason: prediction.churn_reason || "🕵️ No strong signals yet",
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
          validationErrors.push({
            row: index + 1,
            user_id: row.user_id,
            error: `Database save error: ${saveError.message}`,
            action: 'Check data format and try again'
          });
          failedCount++;
          continue;
        }

        results.push({
          user_id: row.user_id,
          churn_probability: prediction.churn_score,
          reason: prediction.churn_reason,
          understanding_score: prediction.understanding_score,
          user_stage: prediction.user_stage,
          action: prediction.action_recommended
        });
        
        processedCount++;
        
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        validationErrors.push({
          row: index + 1,
          user_id: row.user_id || 'unknown',
          error: `Processing error: ${error.message}`,
          action: 'Check data format and contact support if issue persists'
        });
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

    // Prepare response
    const response: any = {
      status: 'completed',
      processed: processedCount,
      failed: failedCount,
      total: csvData.length,
      results,
      message: `Successfully processed ${processedCount} out of ${csvData.length} records with enhanced auto-mapping`
    };

    if (validationErrors.length > 0) {
      response.validation_errors = validationErrors;
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing enhanced CSV:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
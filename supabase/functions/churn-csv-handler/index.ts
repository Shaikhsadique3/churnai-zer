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
  console.log("Function parseNumericValue - START"); // Debug log
  console.log(`Input Summary: Value: ${value}`); // Debug log
  if (typeof value === 'number') {
    console.log(`Output Summary: Parsed Value: ${value}`); // Debug log
    console.log("Function parseNumericValue - END (Success)"); // Debug log
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    const result = isNaN(parsed) ? 0 : parsed;
    console.log(`Output Summary: Parsed Value: ${result}`); // Debug log
    console.log("Function parseNumericValue - END (Success)"); // Debug log
    return result;
  }
  console.log(`Output Summary: Parsed Value: 0`); // Debug log
  console.log("Function parseNumericValue - END (Success)"); // Debug log
  return 0;
}

function normalizePlan(plan: string): 'Free' | 'Pro' | 'Enterprise' {
  console.log("Function normalizePlan - START"); // Debug log
  console.log(`Input Summary: Plan: ${plan}`); // Debug log
  const normalized = plan.toLowerCase().trim();
  if (normalized.includes('pro') || normalized.includes('premium')) {
    console.log(`Output Summary: Normalized Plan: Pro`); // Debug log
    console.log("Function normalizePlan - END (Success)"); // Debug log
    return 'Pro';
  }
  if (normalized.includes('enterprise') || normalized.includes('business')) {
    console.log(`Output Summary: Normalized Plan: Enterprise`); // Debug log
    console.log("Function normalizePlan - END (Success)"); // Debug log
    return 'Enterprise';
  }
  console.log(`Output Summary: Normalized Plan: Free`); // Debug log
  console.log("Function normalizePlan - END (Success)"); // Debug log
  return 'Free';
}

function generateChurnReason(data: any): string {
  console.log("Function generateChurnReason - START"); // Debug log
  console.log(`Input Summary: Data: ${JSON.stringify(data)}`); // Debug log
  const reasons = [];
  
  if (data.logins_last30 < 3) {
    reasons.push('Very low login activity (under 3 times)');
  } else if (data.logins_last30 < 8) {
    reasons.push('Below average engagement');
  }
  
  if (data.email_opens < 2) {
    reasons.push('Poor email engagement');
  }
  
  if (data.support_tickets > 3) {
    reasons.push('High support ticket volume indicates frustration');
  }
  
  if (data.plan === 'Free' && data.monthly_revenue === 0) {
    reasons.push('Free plan user with no revenue conversion');
  }
  
  if (data.billing_status.toLowerCase().includes('inactive') || data.billing_status.toLowerCase().includes('failed')) {
    reasons.push('Billing/payment issues detected');
  }
  
  if (reasons.length === 0) {
    console.log(`Output Summary: Churn Reason: User showing healthy engagement patterns`); // Debug log
    console.log("Function generateChurnReason - END (Success)"); // Debug log
    return 'User showing healthy engagement patterns';
  }
  
  const result = reasons.join('; ');
  console.log(`Output Summary: Churn Reason: ${result}`); // Debug log
  console.log("Function generateChurnReason - END (Success)"); // Debug log
  return result;
}

function generateRecommendedAction(data: any): string {
  console.log("Function generateRecommendedAction - START"); // Debug log
  console.log(`Input Summary: Data: ${JSON.stringify(data)}`); // Debug log
  const actions = [];
  
  if (data.logins_last30 < 3) {
    actions.push('Send re-engagement email campaign');
  }
  
  if (data.email_opens < 2) {
    actions.push('Improve email subject lines and content');
  }
  
  if (data.support_tickets > 3) {
    actions.push('Prioritize customer success outreach');
  }
  
  if (data.plan === 'Free' && data.monthly_revenue === 0) {
    actions.push('Offer upgrade incentives and onboarding');
  }
  
  if (data.billing_status.toLowerCase().includes('inactive')) {
    actions.push('Resolve billing issues immediately');
  }
  
  if (actions.length === 0) {
    console.log(`Output Summary: Recommended Action: Continue standard engagement strategy`); // Debug log
    console.log("Function generateRecommendedAction - END (Success)"); // Debug log
    return 'Continue standard engagement strategy';
  }
  
  const result = actions.join('; ');
  console.log(`Output Summary: Recommended Action: ${result}`); // Debug log
  console.log("Function generateRecommendedAction - END (Success)"); // Debug log
  return result;
}

function calculateUnderstandingScore(data: any): number {
  console.log("Function calculateUnderstandingScore - START"); // Debug log
  console.log(`Input Summary: Data: ${JSON.stringify(data)}`); // Debug log
  let score = 85; // Base score
  
  // Reduce score for concerning behaviors
  if (data.logins_last30 < 3) score -= 20;
  else if (data.logins_last30 < 8) score -= 10;
  
  if (data.email_opens < 2) score -= 15;
  
  if (data.support_tickets > 3) score -= 10;
  
  if (data.plan === 'Free' && data.monthly_revenue === 0) score -= 5;
  
  if (data.billing_status.toLowerCase().includes('inactive')) score -= 15;
  
  // Ensure score stays within bounds
  const result = Math.max(Math.min(score, 100), 30);
  console.log(`Output Summary: Understanding Score: ${result}`); // Debug log
  console.log("Function calculateUnderstandingScore - END (Success)"); // Debug log
  return result;
}

async function processCsvRow(row: CSVRow): Promise<{ success: boolean; user_id?: string; error?: string }> {
  console.log("Function processCsvRow - START"); // Debug log
  console.log(`Input Summary: Row: ${JSON.stringify(row)}`); // Debug log
  try {
    // Validate required fields
    if (!row.customer_email || !row.customer_name) {
      console.log("Function processCsvRow - END (Error: Missing customer_email or customer_name)"); // Debug log
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
    
    console.log('🔍 Debug - Environment variables:', {
      hasChurnApiUrl: !!churnApiUrl,
      hasChurnApiKey: !!churnApiKey,
      churnApiUrl: churnApiUrl || 'NOT SET'
    });
    
    // Calculate dynamic churn probability based on actual data
    let baseScore = 0.2;
    
    // Increase score based on risk factors
    if (mapped.logins_last30 < 5) baseScore += 0.3;
    if (mapped.email_opens < 3) baseScore += 0.2;
    if (mapped.support_tickets > 2) baseScore += 0.2;
    if (mapped.plan === 'Free' && mapped.monthly_revenue === 0) baseScore += 0.15;
    if (mapped.billing_status.toLowerCase().includes('inactive')) baseScore += 0.25;
    
    // Cap at 0.95
    baseScore = Math.min(baseScore, 0.95);
    
    // Generate dynamic insights based on user behavior
    const dynamicReason = generateChurnReason(mapped);
    const recommendedAction = generateRecommendedAction(mapped);
    const understandingScore = calculateUnderstandingScore(mapped);
    
    let prediction = {
      churn_probability: baseScore,
      reason: dynamicReason,
      understanding_score: understandingScore,
      message: recommendedAction
    };

    if (churnApiUrl && churnApiKey) {
      try {
        const payload = {
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
        };
        
        console.log('📤 Sending to AI model:', { email: mapped.customer_email, payload });
        
        // Try different endpoints that might work
        const endpoints = [
          `${churnApiUrl}/api/v1/predict`,
          `${churnApiUrl}/predict`,
          `${churnApiUrl}/api/predict`,
          churnApiUrl
        ];
        
        let apiResponse = null;
        let lastError = null;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Trying endpoint: ${endpoint}`);
            apiResponse = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': churnApiKey,
                'Authorization': `Bearer ${churnApiKey}`
              },
              body: JSON.stringify(payload)
            });
            
            console.log(`📥 Response from ${endpoint}:`, {
              status: apiResponse.status,
              ok: apiResponse.ok,
              statusText: apiResponse.statusText
            });
            
            if (apiResponse.ok) {
              break; // Success, exit loop
            }
            
            lastError = `${apiResponse.status} ${apiResponse.statusText}`;
          } catch (fetchError) {
            console.log(`❌ Endpoint ${endpoint} failed:`, fetchError.message);
            lastError = fetchError.message;
            continue;
          }
        }

        if (apiResponse && apiResponse.ok) {
          const apiData = await apiResponse.json();
          console.log('🧠 AI Model Data:', apiData);
          
          // Update prediction with AI model response
          if (apiData.churn_score !== undefined) {
            prediction.churn_probability = apiData.churn_score;
          }
          if (apiData.churn_reason) {
            prediction.reason = apiData.churn_reason;
          }
          if (apiData.understanding_score !== undefined) {
            prediction.understanding_score = apiData.understanding_score;
          }
          console.log(`Output Summary: Prediction: ${JSON.stringify(prediction)}`); // Debug log
          console.log("Function processCsvRow - END (Success with AI model)"); // Debug log
          return { success: true, user_id: mapped.customer_email };
        } else {
          console.warn(`AI model call failed after trying all endpoints. Last error: ${lastError}`);
          console.log(`Output Summary: Prediction: ${JSON.stringify(prediction)}`); // Debug log
          console.log("Function processCsvRow - END (Success with fallback prediction)"); // Debug log
          return { success: true, user_id: mapped.customer_email };
        }
      } catch (apiError) {
        console.error("Error calling AI model:", apiError);
        console.log(`Output Summary: Prediction: ${JSON.stringify(prediction)}`); // Debug log
        console.log("Function processCsvRow - END (Success with fallback prediction due to API error)"); // Debug log
        return { success: true, user_id: mapped.customer_email };
      }
    } else {
      console.warn("CHURN_API_URL or CHURN_API_KEY not set. Skipping AI model call.");
      console.log(`Output Summary: Prediction: ${JSON.stringify(prediction)}`); // Debug log
      console.log("Function processCsvRow - END (Success with fallback prediction due to missing API keys)"); // Debug log
      return { success: true, user_id: mapped.customer_email };
    }
  } catch (error) {
    console.error("Error processing CSV row:", error);
    console.log("Function processCsvRow - END (Error)"); // Debug log
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  console.log("Function churn-csv-handler/index.ts - START"); // Debug log
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvContent, uploadId } = await req.json();
    console.log(`Input Summary: Upload ID: ${uploadId}, CSV Content Length: ${csvContent ? csvContent.length : 0}`); // Debug log

    if (!csvContent || !uploadId) {
      console.error('Error: Missing CSV content or upload ID.');
      console.log("Function churn-csv-handler/index.ts - END (Error: Missing CSV content or upload ID)"); // Debug log
      return new Response(
        JSON.stringify({ error: 'Missing CSV content or upload ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const lines = csvContent.split('\n').filter((line: string) => line.trim() !== '');
    const headers = lines[0].split(',').map((header: string) => header.trim());
    const rows = lines.slice(1).map((line: string) => {
      const values = line.split(',');
      return headers.reduce((obj: any, header: string, index: number) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });

    console.log(`CSV parsed. Number of rows: ${rows.length}`); // Debug log

    const processingPromises = rows.map(processCsvRow);
    const results = await Promise.all(processingPromises);

    const successfulCount = results.filter(r => r.success).length;
    const failedCount = results.length - successfulCount;

    console.log(`Processing complete. Successful rows: ${successfulCount}, Failed rows: ${failedCount}`); // Debug log

    // Update the churn_uploads table with processed status and results summary
    const { error: updateError } = await supabase
      .from('churn_uploads')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        processed_rows: successfulCount,
        failed_rows: failedCount,
        processing_log: JSON.stringify(results.filter(r => !r.success).map(r => r.error)),
      })
      .eq('id', uploadId);

    if (updateError) {
      console.error('Error updating upload status:', updateError);
      console.log("Function churn-csv-handler/index.ts - END (Error: Failed to update upload status)"); // Debug log
      return new Response(
        JSON.stringify({ error: 'Failed to update upload status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Output Summary: Successful Rows: ${successfulCount}, Failed Rows: ${failedCount}`); // Debug log
    console.log("Function churn-csv-handler/index.ts - END (Success)"); // Debug log
    return new Response(
      JSON.stringify({ success: true, successfulRows: successfulCount, failedRows: failedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing CSV:', error);
    console.log("Function churn-csv-handler/index.ts - END (Internal Server Error)"); // Debug log
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
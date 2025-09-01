// @deno-t    const parsed = parseFloat(cleaned);pes="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apike    const parsed = parseFloat(cleaned);, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CSVRow {
  user_id: string;
  plan: string;
  last_login: string;
  avg_session_duration: number;
  billing_status: string;
  monthly_revenue: number;
  feature_usage_count: number;
  support_tickets: number;
  feature_adopted?: string;
  cancellation_reason?: string;
}

interface Prediction {
  user_id: string;
  churn_score: number;
  risk_level: 'high' | 'medium' | 'low';
  monthly_revenue: number;
  prediction_id: string;
}

function parseNumericValue(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
const cleaned = String(value).replace(/[^0-9.-]/g, '');

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

function generateChurnReason(data: Record<string, unknown>): string {
  const reasons: string[] = [];
  
  const lastLoginDays = calculateDaysSince(data.last_login as string);
  
  if (lastLoginDays > 14) {
    reasons.push(`Inactive for ${lastLoginDays} days`);
  }
  
  if ((data.avg_session_duration as number) < 5) {
    reasons.push('Very low session engagement');
  }
  
  if ((data.support_tickets as number) > 3) {
    reasons.push('High support ticket volume indicates frustration');
  }
  
  if ((data.plan as string) === 'Free' && (data.monthly_revenue as number) === 0) {
    reasons.push('Free plan user with no revenue conversion');
  }
  
  if ((data.billing_status as string).toLowerCase().includes('failed') || (data.billing_status as string).toLowerCase().includes('overdue')) {
    reasons.push('Payment/billing issues detected');
  }
  
  if ((data.feature_usage_count as number) < 5) {
    reasons.push('Low feature adoption and usage');
  }
  
  if (reasons.length === 0) {
    return 'User showing healthy engagement patterns';
  }
  
  return reasons.join('; ');
}

function calculateDaysSince(dateString: string): number {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

function generateRecommendedAction(data: Record<string, unknown>): string {
  const actions: string[] = [];
  
  const lastLoginDays = calculateDaysSince(data.last_login as string);
  
  if (lastLoginDays > 14) {
    actions.push('Send immediate re-engagement email campaign');
  }
  
  if ((data.avg_session_duration as number) < 5) {
    actions.push('Improve user onboarding and feature discovery');
  }
  
  if ((data.support_tickets as number) > 3) {
    actions.push('Prioritize customer success outreach and issue resolution');
  }
  
  if ((data.plan as string) === 'Free' && (data.monthly_revenue as number) === 0) {
    actions.push('Offer upgrade incentives with personalized demo');
  }
  
  if ((data.billing_status as string).toLowerCase().includes('failed')) {
    actions.push('Resolve payment issues immediately and offer payment assistance');
  }
  
  if ((data.feature_usage_count as number) < 5) {
    actions.push('Provide feature training and usage guidance');
  }
  
  if (actions.length === 0) {
    return 'Continue standard engagement strategy with health monitoring';
  }
  
  return actions.join('; ');
}

function calculateRulesBasedScore(data: Record<string, unknown>): number {
  let score = 0.1; // Base 10% risk
  
  const lastLoginDays = calculateDaysSince(data.last_login as string);
  
  // Inactive >14 days → +30% risk
  if (lastLoginDays > 14) {
    score += 0.3;
  }
  
  // Downgrade plan → +25% risk (would need previous plan data)
  // For now, assume Free plan users who should be Pro
  if ((data.plan as string) === 'Free' && (data.monthly_revenue as number) === 0 && (data.feature_usage_count as number) > 10) {
    score += 0.25;
  }
  
  // Failed payment → +40% risk
  if ((data.billing_status as string).toLowerCase().includes('failed') || (data.billing_status as string).toLowerCase().includes('overdue')) {
    score += 0.4;
  }
  
  // Low engagement indicators
  if ((data.avg_session_duration as number) < 5) {
    score += 0.15;
  }
  
  if ((data.feature_usage_count as number) < 3) {
    score += 0.2;
  }
  
  if ((data.support_tickets as number) > 3) {
    score += 0.15;
  }
  
  // Cap at 95% max
  return Math.min(score, 0.95);
}

async function processCsvRow(row: CSVRow, analysisId: string, userId: string): Promise<{ success: boolean; user_id?: string; error?: string }> {
  try {
    // Validate required fields
    if (!row.user_id) {
      return { success: false, error: 'Missing user_id' };
    }

    // Transform and validate data
    const mapped = {
      user_id: String(row.user_id).trim(),
      monthly_revenue: parseNumericValue(row.monthly_revenue),
      support_tickets: parseInt(String(row.support_tickets)) || 0,
      feature_usage_count: parseInt(String(row.feature_usage_count)) || 0,
      avg_session_duration: parseNumericValue(row.avg_session_duration),
      plan: normalizePlan(row.plan),
      billing_status: String(row.billing_status).trim(),
      last_login: row.last_login,
    };

    console.log('Processing customer:', mapped.user_id);

    // Try Flask AI model first
    const churnApiUrl = Deno.env.get('CHURN_API_URL');
    const churnApiKey = Deno.env.get('CHURN_API_KEY');
    
    let churnProbability = 0;
    let contributing_factors = [];
    let recommended_actions = [];
    let usingFallback = false;
    
    if (churnApiUrl && churnApiKey) {
      try {
        console.log('🧠 Attempting AI model prediction for:', mapped.user_id);
        
        // Prepare payload for AI model - using your specific endpoint structure
        const payload = {
          user_id: mapped.user_id,
          plan: mapped.plan,
          last_login_days_ago: calculateDaysSince(mapped.last_login),
          avg_session_duration_minutes: mapped.avg_session_duration,
          billing_status: mapped.billing_status,
          monthly_revenue: mapped.monthly_revenue,
          feature_usage_count: mapped.feature_usage_count,
          support_tickets_count: mapped.support_tickets
        };
        
        // Log the request payload being sent to the AI model
        console.log('🔍 AI Model Request:', JSON.stringify(payload));
        
        // Use your specific AI model endpoint
        const aiModelUrl = churnApiUrl || 'https://ai-model-rumc.onrender.com';
        const response = await fetch(`${aiModelUrl}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000) // 15 second timeout for external API
        });
        
        console.log(`🌐 AI Model Response Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ AI Model success:', result);
          console.log('📊 AI Model Prediction Details:', JSON.stringify({
            user_id: mapped.user_id,
            prediction_result: result
          }));
          
          // Parse response from your AI model
          churnProbability = result.churn_probability || result.prediction || result.score || 0;
          contributing_factors = Array.isArray(result.reasons) ? result.reasons : 
                               Array.isArray(result.factors) ? result.factors : 
                               result.reason ? [result.reason] : [];
          recommended_actions = Array.isArray(result.actions) ? result.actions : 
                              Array.isArray(result.recommendations) ? result.recommendations : 
                              result.action ? [result.action] : [];
          
          // Log the processed prediction data
          console.log('🔄 Processed Prediction:', JSON.stringify({
            user_id: mapped.user_id,
            churn_probability: churnProbability,
            contributing_factors: contributing_factors,
            recommended_actions: recommended_actions
          }));
          
          // If no factors/actions provided by AI, generate them
          if (contributing_factors.length === 0) {
            contributing_factors = [generateChurnReason(mapped)];
          }
          if (recommended_actions.length === 0) {
            recommended_actions = [generateRecommendedAction(mapped)];
          }
        } else {
          throw new Error(`AI Model error: ${response.status} ${response.statusText}`);
        }
        
      } catch (error: any) {
        console.log('❌ AI Model failed:', error.message);
        console.log('🔄 Falling back to rules-based logic');
        usingFallback = true;
      }
    } else {
      console.log('⚠️ Using default AI model endpoint with rules-based fallback');
      // Try the default endpoint without API key
      try {
        const payload = {
          user_id: mapped.user_id,
          plan: mapped.plan,
          last_login_days_ago: calculateDaysSince(mapped.last_login),
          avg_session_duration_minutes: mapped.avg_session_duration,
          billing_status: mapped.billing_status,
          monthly_revenue: mapped.monthly_revenue,
          feature_usage_count: mapped.feature_usage_count,
          support_tickets_count: mapped.support_tickets
        };
        
        // Log the request payload being sent to the default AI model
        console.log('🔍 Default AI Model Request:', JSON.stringify(payload));
        
        const response = await fetch('https://ai-model-rumc.onrender.com/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000)
        });
        
        console.log(`🌐 Default AI Model Response Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Default AI Model success:', result);
          console.log('📊 Default AI Model Prediction Details:', JSON.stringify({
            user_id: mapped.user_id,
            prediction_result: result
          }));
          
          churnProbability = result.churn_probability || result.prediction || result.score || 0;
          contributing_factors = Array.isArray(result.reasons) ? result.reasons : 
                               Array.isArray(result.factors) ? result.factors : 
                               result.reason ? [result.reason] : [];
          recommended_actions = Array.isArray(result.actions) ? result.actions : 
                              Array.isArray(result.recommendations) ? result.recommendations : 
                              result.action ? [result.action] : [];
          
          // Log the processed prediction data
          console.log('🔄 Processed Default Prediction:', JSON.stringify({
            user_id: mapped.user_id,
            churn_probability: churnProbability,
            contributing_factors: contributing_factors,
            recommended_actions: recommended_actions
          }));
        } else {
          throw new Error(`Default AI Model error: ${response.status}`);
        }
      } catch (error: any) {
        console.log('❌ Default AI Model also failed:', (error as Error).message);
        usingFallback = true;
      }
    }
    
    // Fallback to rules-based logic if AI model unavailable
    if (usingFallback) {
      churnProbability = calculateRulesBasedScore(mapped);
      contributing_factors = [generateChurnReason(mapped)];
      
      // Generate specific suggested actions based on risk factors
      const suggestedActions = [];
      const lastLoginDays = calculateDaysSince(mapped.last_login);
      
      if (lastLoginDays > 14) {
        suggestedActions.push('Send reactivation email');
      }
      if (mapped.billing_status.toLowerCase().includes('failed') || mapped.billing_status.toLowerCase().includes('overdue')) {
        suggestedActions.push('Check billing');
      }
      if (mapped.plan === 'Free' && mapped.monthly_revenue === 0) {
        suggestedActions.push('Offer discount');
      }
      if (mapped.support_tickets > 3) {
        suggestedActions.push('Priority customer success call');
      }
      if (suggestedActions.length === 0) {
        suggestedActions.push('Monitor engagement closely');
      }
      
      recommended_actions = suggestedActions;
      
      console.log('📊 Rules-based prediction:', {
        user_id: mapped.user_id,
        score: churnProbability,
        factors: contributing_factors,
        actions: recommended_actions
      });
    }
    
    // Determine risk level
    let risk_level: 'low' | 'medium' | 'high' = 'low';
    if (churnProbability >= 0.7) risk_level = 'high';
    else if (churnProbability >= 0.4) risk_level = 'medium';

    // Save prediction to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the global user ID from the handler
    const ownerUserId = (globalThis as unknown as { __user_id__?: string }).__user_id__ || userId;

    const { error: saveError } = await supabase
      .from('user_data')
      .upsert({
        owner_id: ownerUserId,
        user_id: mapped.user_id,
        churn_score: churnProbability,
        risk_level: risk_level,
        churn_reason: Array.isArray(contributing_factors) ? contributing_factors.join('; ') : contributing_factors,
        action_recommended: Array.isArray(recommended_actions) ? recommended_actions.join('; ') : recommended_actions,
        monthly_revenue: mapped.monthly_revenue,
        plan: mapped.plan,
        last_login: new Date(mapped.last_login),
        usage: mapped.feature_usage_count,
        understanding_score: 85, // Default understanding score
        days_until_mature: 30,
        source: 'ai_model'
      }, { onConflict: 'user_id, owner_id' });

    if (saveError) {
      console.error('Error saving user data:', saveError);
      return { success: false, user_id: mapped.user_id, error: saveError.message };
    }

    return { success: true, user_id: mapped.user_id };
  } catch (error: any) {
    console.error('Error processing CSV row:', error);
    return { success: false, error: error.message };

        source: 'ai_model'
      }, { onConflict: 'user_id, owner_id' });

    if (saveError) {
      console.error('Database save error:', saveError);
      return { success: false, error: `Database error: ${saveError.message}` };
    }

    return { success: true, user_id: mapped.user_id };

  } catch (error: any) {
    console.error('Row processing error:', error);
    return { success: false, error: error.message };
  }
}

async function parseCSVFromStorage(fileName: string): Promise<CSVRow[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('📁 Downloading CSV file:', fileName);
  
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('csv-uploads')
    .download(fileName);
    
  if (downloadError) {
    throw new Error(`Failed to download file: ${downloadError.message}`);
  }
  
  const csvText = await fileData.text();
  console.log('📄 CSV content preview:', csvText.substring(0, 200) + '...');
  
  // Parse CSV manually
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }
  
  const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
  console.log('📋 CSV headers:', headers);
  
  const requiredColumns = ['user_id', 'plan', 'last_login', 'avg_session_duration', 'billing_status', 'monthly_revenue', 'feature_usage_count', 'support_tickets'];
  const optionalColumns = ['feature_adopted', 'cancellation_reason'];
  const missingColumns = requiredColumns.filter(col => !headers.some((h: string) => h.toLowerCase() === col.toLowerCase()));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
  
  console.log('Optional columns found:', optionalColumns.filter(col => headers.some(h => h.toLowerCase() === col.toLowerCase())));
  
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
    
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}, skipping`);
      continue;
    }
    
    const row: Record<string, string> = {};
    headers.forEach((header: string, index: number) => {
      const normalizedHeader = header.toLowerCase();
      row[normalizedHeader] = values[index];
    });
    
    rows.push({
      user_id: row.user_id || '',
      plan: row.plan || 'Free',
      last_login: row.last_login || new Date().toISOString().split('T')[0],
      avg_session_duration: parseFloat(row.avg_session_duration) || 0,
      billing_status: row.billing_status || 'Active',
      monthly_revenue: parseFloat(row.monthly_revenue) || 0,
      feature_usage_count: parseInt(row.feature_usage_count) || 0,
      support_tickets: parseInt(row.support_tickets) || 0,
      feature_adopted: row.feature_adopted || undefined,
      cancellation_reason: row.cancellation_reason || undefined
    });
  }
  
  console.log(`✅ Parsed ${rows.length} rows from CSV`);
  return rows;
}

serve(async (req: Request) => {
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
    (globalThis as unknown as { __user_id__: string }).__user_id__ = user.id;

    const body = await req.json();
    console.log('📥 Incoming request body:', JSON.stringify(body));
    
    const { fileName, userId: requestUserId } = body;

    if (!fileName) {
      return new Response(
        JSON.stringify({ error: 'fileName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Processing CSV file: ${fileName} for user ${user.id}`);

    // Parse CSV from storage
    const rows = await parseCSVFromStorage(fileName);
    
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid rows found in CSV' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First create the upload record
    console.log('💾 Creating upload record...');
    const { data: uploadData, error: uploadError } = await supabase
      .from('csv_uploads')
      .insert({
        user_id: user.id,
        filename: fileName,
        rows_processed: 0,
        rows_failed: 0,
        status: 'processing'
      })
      .select()
      .single();

    if (uploadError) {
      console.error('Upload record creation error:', uploadError);
      throw new Error(`Failed to create upload record: ${uploadError.message}`);
    }

    // Create analysis record
    console.log('📊 Creating analysis record...');
    const { data: analysisData, error: analysisError } = await supabase
      .from('churn_analysis_results')
      .insert({
        user_id: user.id,
        upload_id: uploadData.id,
        total_customers: rows.length,
        churn_rate: 0, // Will be calculated after processing
        high_risk_customers: 0,
        medium_risk_customers: 0,
        low_risk_customers: 0,
        avg_cltv: 0
      })
      .select()
      .single();

    if (analysisError || !analysisData) {
      throw new Error(`Failed to create analysis record: ${analysisError?.message}`);
    }

    console.log(`📈 Created analysis record: ${analysisData.id}`);

    // Process all rows
    const results = await Promise.all(
      rows.map(row => processCsvRow(row, analysisData.id, user.id))
    );

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    // Process retention analytics if optional fields are present
    console.log('🔍 Processing retention analytics...');
    await processRetentionAnalytics(supabase, user.id, uploadData.id, rows);

    // Calculate summary statistics
    const { data: predictions } = await supabase
      .from('user_data')
      .select('churn_score, risk_level, monthly_revenue')
      .eq('owner_id', user.id);

    let highRisk = 0, mediumRisk = 0, lowRisk = 0;
    let totalRevenue = 0;
    let totalChurnProb = 0;

    if (predictions) {
      predictions.forEach((p: Prediction) => {
        if (p.risk_level === 'high') highRisk++;
        else if (p.risk_level === 'medium') mediumRisk++;
        else lowRisk++;
        
        totalRevenue += p.monthly_revenue || 0;
        totalChurnProb += p.churn_score || 0;
      });
    }

    const avgChurnRate = predictions?.length ? totalChurnProb / predictions.length : 0;
    const avgCltv = predictions?.length ? (totalRevenue * 12) / predictions.length : 0; // Rough CLTV estimate

    // Update analysis with calculated stats
    await supabase
      .from('churn_analysis_results')
      .update({
        churn_rate: avgChurnRate,
        high_risk_customers: highRisk,
        medium_risk_customers: mediumRisk,
        low_risk_customers: lowRisk,
        avg_cltv: avgCltv
      })
      .eq('id', analysisData.id);

    // Update upload record with final counts
    const { error: uploadUpdateError } = await supabase
      .from('csv_uploads')
      .update({
        rows_processed: successCount,
        rows_failed: failedCount,
        status: successCount > 0 ? 'completed' : 'failed'
      })
      .eq('id', uploadData.id);

    if (uploadUpdateError) {
      console.error('Upload update error:', uploadUpdateError);
    }

    const errorDetails = results.filter((r: { success: boolean; user_id?: string; error?: string }) => !r.success).map((r: { success: boolean; user_id?: string; error?: string }, index: number) => ({
      row: index + 1,
      user_id: r.user_id || 'unknown',
      error: r.error
    }));

    // Send email report to founder
    console.log('📧 Sending email report to founder...');
    try {
      if (predictions && predictions.length > 0) {
        const topRiskyUsers = predictions
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (Number(b.churn_score || 0) - Number(a.churn_score || 0)))
          .slice(0, 5); // Top 5 risky users

        await sendFounderEmailReport(supabase, user.id, analysisData.id, topRiskyUsers);
        console.log('✅ Email report sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Failed to send email report:', emailError);
      // Don't fail the whole process if email fails
    }

    const response = {
      success: successCount > 0,
      total_rows: rows.length,
      processed_rows: successCount,
      failed_rows: failedCount,
      analysis_id: analysisData.id,
      error_details: errorDetails,
      message: `✅ ${successCount} customers analyzed successfully${failedCount > 0 ? `, ❌ ${failedCount} failed` : ''}. View results in your dashboard.`
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendFounderEmailReport(supabase: ReturnType<typeof createClient>, userId: string, analysisId: string, topRiskyUsers: Array<Record<string, unknown>>) {
  try {
    // Get founder profile
    const { data: profile, error: profileError } = await supabase
      .from('founder_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Could not fetch founder profile');
    }

    // Get auth user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user?.email) {
      console.error('User fetch error:', userError);
      throw new Error('Could not fetch user email');
    }

    const founderEmail = user.email;
    const companyName = profile?.company_name || 'Your Company';
    
    const highRiskCount = topRiskyUsers.filter(u => u.risk_level === 'high').length;
    const subject = `⚠️ Cancel-Intent Alerts: ${highRiskCount} Users At Risk`;
    
    // Create email body
    let emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
        🚨 Cancel-Intent Alert for ${companyName}
      </h2>
      
      <p>Hi there,</p>
      
      <p>Our AI has detected <strong>${topRiskyUsers.length}</strong> customers at high risk of canceling. Here are the top 5 that need immediate attention:</p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
    `;

    topRiskyUsers.forEach((user, index) => {
      const probability = (Number(user.churn_probability || 0) * 100).toFixed(1);
      const reasons = Array.isArray(user.contributing_factors) 
        ? user.contributing_factors.slice(0, 2).join(', ')
        : user.contributing_factors || 'Low engagement detected';
      const actions = Array.isArray(user.recommended_actions)
        ? user.recommended_actions.slice(0, 2).join(', ')
        : user.recommended_actions || 'Send reactivation email';

      emailBody += `
        <div style="margin: 15px 0; padding: 12px; background-color: white; border-radius: 6px; border-left: 4px solid ${user.risk_level === 'high' ? '#dc2626' : user.risk_level === 'medium' ? '#f59e0b' : '#10b981'};">
          <h4 style="margin: 0 0 8px 0; color: #374151;">
            ${index + 1}. Customer ID: ${user.customer_id}
          </h4>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Cancel Probability:</strong> ${probability}%</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Reason:</strong> ${reasons}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Suggested Action:</strong> ${actions}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Monthly Revenue:</strong> $${Number(user.monthly_revenue || 0).toFixed(2)}</p>
        </div>
      `;
    });

    emailBody += `
      </div>
      
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">💡 Quick Action Tips:</h3>
        <ul style="color: #374151; line-height: 1.6;">
          <li><strong>High Risk (70%+ probability):</strong> Reach out within 24 hours with personalized offers</li>
          <li><strong>Medium Risk (40-70%):</strong> Send targeted retention campaigns this week</li>
          <li><strong>Low Risk (&lt;40%):</strong> Monitor and include in general engagement flows</li>
        </ul>
      </div>
      
      <p style="margin: 20px 0;">
        <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '')}.vercel.app/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Full Dashboard →
        </a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #6b7280; font-size: 14px;">
        This alert was generated automatically by Churnaizer AI. 
        <br>Questions? Reply to this email or check your <a href="#">dashboard</a>.
      </p>
    </div>
    `;

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Churnaizer Alerts <alerts@churnaizer.com>',
        to: [founderEmail],
        subject: subject,
        html: emailBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log('📧 Email sent successfully:', emailResult);

  } catch (error: any) {
    console.error('Email sending error:', error);
    throw error;
  }
}

async function processRetentionAnalytics(supabase: ReturnType<typeof createClient>, userId: string, uploadId: string, rows: CSVRow[]) {
  try {
    // Check if we have the required optional columns
    const hasFeatureData = rows.some((row: CSVRow) => row.feature_adopted);
    const hasChurnReasons = rows.some((row: CSVRow) => row.cancellation_reason);
    
    console.log('Analytics data availability:', { hasFeatureData, hasChurnReasons });

    // Process Feature-Retention Fit
    if (hasFeatureData) {
      console.log('📊 Processing feature-retention analytics...');
      const featureAnalytics = await analyzeFeatureRetention(rows);
      
      // Save feature analytics
      for (const feature of featureAnalytics) {
        await supabase
          .from('retention_analytics')
          .insert({
            user_id: userId,
            upload_id: uploadId,
            feature_name: feature.name,
            retention_percentage: feature.retention_percentage,
            revenue_contribution: feature.revenue_contribution,
            user_count: feature.user_count
          });
      }
      console.log(`✅ Saved ${featureAnalytics.length} feature retention records`);
    }

    // Process Churn Reason Clusters
    if (hasChurnReasons) {
      console.log('📊 Processing churn reason clusters...');
      const churnClusters = await analyzeChurnReasons(rows);
      
      // Save churn clusters
      for (const cluster of churnClusters) {
        await supabase
          .from('churn_reason_clusters')
          .insert({
            user_id: userId,
            upload_id: uploadId,
            cluster_name: cluster.name,
            reason_examples: cluster.examples,
            percentage: cluster.percentage,
            user_count: cluster.user_count
          });
      }
      console.log(`✅ Saved ${churnClusters.length} churn cluster records`);
    }

  } catch (error: any) {
    console.error('Retention analytics processing error:', error);
    // Don't fail the whole upload if analytics fail
  }
}

async function analyzeFeatureRetention(rows: CSVRow[]) {
  const featureAnalysis = new Map();
  
  // Group users by feature adoption
  for (const row of rows) {
    if (!row.feature_adopted) continue;
    
    const features = row.feature_adopted.split(',').map(f => f.trim());
    const isActive = calculateDaysSince(row.last_login) <= 30; // Active if logged in within 30 days
    
    for (const feature of features) {
      if (!featureAnalysis.has(feature)) {
        featureAnalysis.set(feature, {
          total_users: 0,
          active_users: 0,
          total_revenue: 0
        });
      }
      
      const analysis = featureAnalysis.get(feature);
      analysis.total_users++;
      if (isActive) analysis.active_users++;
      analysis.total_revenue += row.monthly_revenue || 0;
    }
  }
  
  // Calculate retention percentages and sort by retention
  const results = Array.from(featureAnalysis.entries()).map(([feature, data]: [string, { total_users: number; active_users: number; total_revenue: number }]) => ({
    name: feature,
    retention_percentage: data.total_users > 0 ? (data.active_users / data.total_users) * 100 : 0,
    revenue_contribution: data.total_revenue,
    user_count: data.total_users
  })).sort((a, b) => b.retention_percentage - a.retention_percentage);
  
  return results;
}

async function analyzeChurnReasons(rows: CSVRow[]) {
  const reasons = rows
    .filter(row => row.cancellation_reason)
    .map(row => row.cancellation_reason!.toLowerCase());
    
  if (reasons.length === 0) return [];
  
  // Simple keyword-based clustering
  const clusters = new Map();
  
  for (const reason of reasons) {
    let clustered = false;
    
    // Pricing cluster
    if (reason.includes('price') || reason.includes('cost') || reason.includes('expensive') || reason.includes('budget')) {
      addToCluster(clusters, 'Pricing Issues', reason);
      clustered = true;
    }
    // Feature cluster
    else if (reason.includes('feature') || reason.includes('missing') || reason.includes('need') || reason.includes('functionality')) {
      addToCluster(clusters, 'Missing Features', reason);
      clustered = true;
    }
    // Support/UX cluster
    else if (reason.includes('support') || reason.includes('help') || reason.includes('difficult') || reason.includes('complex') || reason.includes('confusing')) {
      addToCluster(clusters, 'UX/Support Issues', reason);
      clustered = true;
    }
    // Competition cluster
    else if (reason.includes('competitor') || reason.includes('alternative') || reason.includes('switch') || reason.includes('found')) {
      addToCluster(clusters, 'Competition', reason);
      clustered = true;
    }
    // Usage cluster
    else if (reason.includes("don't use") || reason.includes('not using') || reason.includes('no longer') || reason.includes('not needed')) {
      addToCluster(clusters, 'Low Usage', reason);
      clustered = true;
    }
    
    // Default cluster for uncategorized
    if (!clustered) {
      addToCluster(clusters, 'Other Reasons', reason);
    }
  }
  
  const totalReasons = reasons.length;
  const results = Array.from(clusters.entries()).map(([name, data]: [string, { count: number; examples: string[] }]) => ({
    name,
    examples: data.examples.slice(0, 3), // Top 3 examples
    percentage: (data.count / totalReasons) * 100,
    user_count: data.count
  })).sort((a: { percentage: number }, b: { percentage: number }) => b.percentage - a.percentage);
  
  return results;
}

function addToCluster(clusters: Map<string, { count: number; examples: string[] }>, clusterName: string, reason: string) {
  if (!clusters.has(clusterName)) {
    clusters.set(clusterName, { count: 0, examples: [] });
  }
  const cluster = clusters.get(clusterName)!;
  cluster.count++;
  if (cluster.examples.length < 5) {
    cluster.examples.push(reason);
  }
}
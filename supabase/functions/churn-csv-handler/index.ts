// @deno-t    const parsed = parseFloat(cleaned);pes="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};


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
          

        } else if (!response.ok) {
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
          last_login_days_ago: 0,
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
    

    
    // Determine risk level
    let risk_level: 'low' | 'medium' | 'high' = 'low';
    if (churnProbability >= 0.7) risk_level = 'high';
    else if (churnProbability >= 0.4) risk_level = 'medium';



  } catch (error: any) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});



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
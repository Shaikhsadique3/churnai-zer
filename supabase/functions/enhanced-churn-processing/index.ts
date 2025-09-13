import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomerData {
  user_id: string;
  email?: string;
  plan_type?: string;
  monthly_revenue?: number;
  last_login_days_ago?: number;
  total_logins?: number;
  support_tickets?: number;
  feature_usage_score?: number;
  churn_score?: number;
  risk_level?: string;
  churn_reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { upload_id } = await req.json();

    if (!upload_id) {
      throw new Error('Upload ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Update status to processing
    await supabase
      .from('churn_uploads')
      .update({ status: 'processing' })
      .eq('id', upload_id);

    // Get upload details
    const { data: upload, error: uploadError } = await supabase
      .from('churn_uploads')
      .select('*')
      .eq('id', upload_id)
      .single();

    if (uploadError || !upload) {
      throw new Error('Upload not found');
    }

    // Download and process CSV
    const csvResponse = await fetch(upload.csv_url);
    const csvText = await csvResponse.text();
    
    const processedData = await processCSVData(csvText);
    const predictions = await generateChurnPredictions(processedData);
    const summary = generateSummary(predictions);
    
    // Store analysis results
    const { data: analysisResult, error: analysisError } = await supabase
      .from('churn_analysis_results')
      .insert({
        user_id: null, // Public upload
        upload_id: upload_id,
        total_customers: predictions.length,
        churn_rate: summary.overall_churn_rate,
        high_risk_customers: summary.high_risk_count,
        medium_risk_customers: summary.medium_risk_count,
        low_risk_customers: summary.low_risk_count,
        top_churn_drivers: summary.top_churn_reasons,
        feature_importance: summary.feature_importance
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Analysis storage failed: ${analysisError.message}`);
    }

    // Generate lite report
    const liteReportContent = generateLiteReport(summary, predictions);
    
    // Store lite report as text (for now, could be enhanced to PDF)
    const reportFilename = `lite_report_${upload_id}.txt`;
    const { data: reportUpload, error: reportError } = await supabase.storage
      .from('reports')
      .upload(reportFilename, new Blob([liteReportContent], { type: 'text/plain' }));

    if (reportError) {
      throw new Error(`Report upload failed: ${reportError.message}`);
    }

    // Get report URL
    const { data: reportUrl } = supabase.storage
      .from('reports')
      .getPublicUrl(reportFilename);

    // Create report record
    await supabase
      .from('churn_reports')
      .insert({
        user_id: null,
        analysis_id: analysisResult.id,
        report_name: 'Lite Churn Audit Report',
        pdf_file_path: reportFilename,
        report_url: reportUrl.publicUrl,
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    // Update upload status
    await supabase
      .from('churn_uploads')
      .update({ 
        status: 'done',
        csv_url: reportUrl.publicUrl // Store the report URL for easy access
      })
      .eq('id', upload_id);

    // Send notification email (optional)
    try {
      await supabase.functions.invoke('send-churn-report-email', {
        body: {
          email: upload.email,
          upload_id: upload_id,
          report_url: reportUrl.publicUrl,
          summary: summary
        }
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the processing if email fails
    }

    return new Response(JSON.stringify({
      status: 'completed',
      analysis_id: analysisResult.id,
      summary: summary,
      report_url: reportUrl.publicUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Processing error:', error);
    
    // Try to update status to failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabase = createClient(supabaseUrl!, supabaseKey!);
      
      const { upload_id } = await req.json();
      if (upload_id) {
        await supabase
          .from('churn_uploads')
          .update({ status: 'failed' })
          .eq('id', upload_id);
      }
    } catch (updateError) {
      console.error('Failed to update status:', updateError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function processCSVData(csvText: string): CustomerData[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: CustomerData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      // Map common variations of column names
      const customer: CustomerData = {
        user_id: row.user_id || row.id || row.customer_id || `user_${i}`,
        email: row.email || row.customer_email,
        plan_type: row.plan_type || row.plan || row.subscription_type || 'Unknown',
        monthly_revenue: parseFloat(row.monthly_revenue || row.revenue || row.mrr || '0'),
        last_login_days_ago: parseInt(row.last_login_days_ago || row.days_since_login || '0'),
        total_logins: parseInt(row.total_logins || row.login_count || '0'),
        support_tickets: parseInt(row.support_tickets || row.tickets || '0'),
        feature_usage_score: parseFloat(row.feature_usage_score || row.usage_score || '5.0')
      };
      
      data.push(customer);
    }
  }

  return data;
}

function generateChurnPredictions(data: CustomerData[]): CustomerData[] {
  return data.map(customer => {
    // Simple AI-like scoring algorithm
    let churnScore = 0;
    let reasons = [];

    // Login recency factor (0-0.4)
    const loginDays = customer.last_login_days_ago || 0;
    if (loginDays > 30) {
      churnScore += 0.4;
      reasons.push('Long time since last login');
    } else if (loginDays > 14) {
      churnScore += 0.2;
      reasons.push('Moderate time since last login');
    }

    // Login frequency factor (0-0.3)
    const totalLogins = customer.total_logins || 0;
    if (totalLogins < 5) {
      churnScore += 0.3;
      reasons.push('Very low login frequency');
    } else if (totalLogins < 15) {
      churnScore += 0.15;
      reasons.push('Below average engagement');
    }

    // Support burden factor (0-0.2)
    const supportTickets = customer.support_tickets || 0;
    if (supportTickets > 3) {
      churnScore += 0.2;
      reasons.push('High support burden');
    } else if (supportTickets > 1) {
      churnScore += 0.1;
      reasons.push('Multiple support interactions');
    }

    // Feature usage factor (0-0.1)
    const usageScore = customer.feature_usage_score || 5;
    if (usageScore < 3) {
      churnScore += 0.1;
      reasons.push('Low feature utilization');
    }

    // Plan type factor
    if (customer.plan_type === 'Free' || customer.plan_type === 'Trial') {
      churnScore += 0.1;
      reasons.push('Free/trial user without conversion');
    }

    // Revenue factor
    const revenue = customer.monthly_revenue || 0;
    if (revenue === 0) {
      churnScore += 0.05;
      reasons.push('No revenue contribution');
    }

    // Cap the score at 1.0
    churnScore = Math.min(churnScore, 1.0);

    // Determine risk level
    let riskLevel: string;
    if (churnScore >= 0.7) {
      riskLevel = 'High';
    } else if (churnScore >= 0.3) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    return {
      ...customer,
      churn_score: Math.round(churnScore * 100) / 100,
      risk_level: riskLevel,
      churn_reason: reasons.length > 0 ? reasons.join('; ') : 'Healthy engagement patterns'
    };
  });
}

function generateSummary(predictions: CustomerData[]) {
  const total = predictions.length;
  const highRisk = predictions.filter(p => p.risk_level === 'High').length;
  const mediumRisk = predictions.filter(p => p.risk_level === 'Medium').length;
  const lowRisk = predictions.filter(p => p.risk_level === 'Low').length;

  // Calculate top churn reasons
  const reasonCounts: Record<string, number> = {};
  predictions.forEach(p => {
    if (p.churn_reason && p.churn_reason !== 'Healthy engagement patterns') {
      const reasons = p.churn_reason.split('; ');
      reasons.forEach(reason => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    }
  });

  const topReasons = Object.entries(reasonCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }));

  return {
    total_customers: total,
    high_risk_count: highRisk,
    medium_risk_count: mediumRisk,
    low_risk_count: lowRisk,
    high_risk_percentage: Math.round((highRisk / total) * 100),
    medium_risk_percentage: Math.round((mediumRisk / total) * 100),
    low_risk_percentage: Math.round((lowRisk / total) * 100),
    overall_churn_rate: Math.round(((highRisk + mediumRisk * 0.5) / total) * 100),
    top_churn_reasons: topReasons,
    feature_importance: {
      login_recency: 0.4,
      login_frequency: 0.3,
      support_burden: 0.2,
      feature_usage: 0.1
    }
  };
}

function generateLiteReport(summary: any, predictions: CustomerData[]): string {
  const highRiskCustomers = predictions
    .filter(p => p.risk_level === 'High')
    .sort((a, b) => (b.churn_score || 0) - (a.churn_score || 0))
    .slice(0, 10);

  return `
CHURN AUDIT LITE REPORT
========================

EXECUTIVE SUMMARY
-----------------
Total Customers Analyzed: ${summary.total_customers}
Overall Churn Risk: ${summary.overall_churn_rate}%

RISK DISTRIBUTION
-----------------
High Risk: ${summary.high_risk_count} customers (${summary.high_risk_percentage}%)
Medium Risk: ${summary.medium_risk_count} customers (${summary.medium_risk_percentage}%)
Low Risk: ${summary.low_risk_count} customers (${summary.low_risk_percentage}%)

TOP CHURN DRIVERS
-----------------
${summary.top_churn_reasons.map((r: any, i: number) => 
  `${i + 1}. ${r.reason} (${r.count} customers)`
).join('\n')}

HIGH-RISK CUSTOMERS (TOP 10)
----------------------------
${highRiskCustomers.map((c, i) => 
  `${i + 1}. Customer ID: ${c.user_id.replace(/./g, '*').slice(0, -3)}*** | Risk Score: ${c.churn_score} | Reason: ${c.churn_reason}`
).join('\n')}

IMMEDIATE ACTIONS RECOMMENDED
-----------------------------
1. Contact high-risk customers within 48 hours
2. Set up automated engagement campaigns for medium-risk segments
3. Address top churn drivers through product/service improvements
4. Implement retention offers for at-risk revenue segments

INDUSTRY BENCHMARKS
-------------------
Your churn risk (${summary.overall_churn_rate}%) vs Industry Average:
- SaaS Industry Average: 5-7% monthly churn
- ${summary.overall_churn_rate < 5 ? 'EXCELLENT' : summary.overall_churn_rate < 8 ? 'GOOD' : 'NEEDS IMPROVEMENT'}: Your performance relative to industry standards

For a complete analysis with detailed segmentation, retention playbooks, 
and 90-day action plans, upgrade to the Full Report.

Generated on: ${new Date().toISOString()}
Report ID: ${crypto.randomUUID()}
  `.trim();
}
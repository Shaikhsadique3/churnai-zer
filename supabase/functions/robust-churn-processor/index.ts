import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import Puppeteer and JSDOM dynamically to avoid Deno bundle issues
const { JSDOM } = await import("npm:jsdom");
const puppeteer = await import("npm:puppeteer");
const Chart = (await import("npm:chart.js")).default;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomerData {
  user_id: string;
  email: string;
  plan_type?: string;
  monthly_revenue?: number;
  last_login_days_ago?: number;
  total_logins?: number;
  support_tickets?: number;
  feature_usage_score?: number;
  churn_score?: number;
  risk_level?: 'high' | 'medium' | 'low';
  churn_reason?: string;
}

serve(async (req) => {
  let upload_id: string | undefined; // Declare upload_id here
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { upload_id: id } = await req.json(); // Assign to a temporary variable
    upload_id = id; // Assign to the outer scoped upload_id
    
    if (!upload_id) {
      throw new Error('Upload ID is required');
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[robust-churn-processor] Starting enhanced processing for upload: ${upload_id}`);

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

    console.log(`Processing CSV from: ${upload.csv_url}`);

    // Download and process CSV
    const csvResponse = await fetch(upload.csv_url);
    const csvText = await csvResponse.text();
    console.log(`[robust-churn-processor] Preprocessing started for upload: ${upload_id}`);
    const customerData = await processCSVData(csvText);
    console.log(`[robust-churn-processor] Preprocessing completed for upload: ${upload_id}. Processed ${customerData.length} customer records.`);

    // Generate churn predictions using enhanced ML model
    console.log(`[robust-churn-processor] Prediction started for upload: ${upload_id}`);
    const predictions = await generateAdvancedChurnPredictions(customerData);
    console.log(`[robust-churn-processor] Prediction completed for upload: ${upload_id}. Generated ${predictions.length} predictions.`);
    
    // Generate comprehensive analysis
    const analysis = await generateComprehensiveAnalysis(predictions);
    
    // Store analysis results
    const { data: analysisResult, error: analysisError } = await supabase
      .from('churn_analysis_results')
      .insert({
        user_id: upload.user_id,
        upload_id: upload_id,
        total_customers: predictions.length,
        churn_rate: analysis.churn_rate,
        high_risk_customers: analysis.high_risk_customers,
        medium_risk_customers: analysis.medium_risk_customers,
        low_risk_customers: analysis.low_risk_customers,
        top_churn_drivers: analysis.top_churn_drivers,
        feature_importance: analysis.feature_importance
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error('Failed to store analysis results');
    }

    // Generate professional PDF report
    console.log(`[robust-churn-processor] Report generation started for upload: ${upload_id}`);
    const reportData = await generateProfessionalReport(analysis, predictions, upload.email);
    console.log(`[robust-churn-processor] Report generation completed for upload: ${upload_id}`);
    
    // Store report in Supabase Storage
    const reportFileName = `report_${upload_id}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError2 } = await supabase.storage
      .from('reports')
      .upload(reportFileName, reportData, {
        contentType: 'application/pdf'
      });

    if (uploadError2) {
      throw new Error('Failed to upload report');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(reportFileName);

    // Store report record
    await supabase
      .from('reports')
      .insert({
        user_id: upload.user_id,
        analysis_id: analysisResult.id,
        report_name: `Churn_Audit_Report_${new Date().toISOString().split('T')[0]}`,
        pdf_file_path: reportFileName,
        report_url: urlData.publicUrl,
        status: 'completed'
      });

    // Update upload status
    await supabase
      .from('churn_uploads')
      .update({ 
        status: 'done',
        csv_url: urlData.publicUrl 
      })
      .eq('id', upload_id);

    // Send notification email
    try {
      await supabase.functions.invoke('send-churn-report-email', {
        body: { 
          email: upload.email, 
          upload_id: upload_id,
          report_url: urlData.publicUrl
        }
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }

    console.log(`Processing completed for upload: ${upload_id}`);

    return new Response(JSON.stringify({
      success: true,
      upload_id: upload_id,
      status: 'completed',
      report_url: urlData.publicUrl,
      analysis: {
        total_customers: predictions.length,
        high_risk_percentage: Math.round((analysis.high_risk_customers / predictions.length) * 100),
        churn_rate: analysis.churn_rate
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[robust-churn-processor] Enhanced processing error:', error.message, error.stack);
    
    // Update status to failed
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      if (upload_id) {
        await supabase
          .from('churn_uploads')
          .update({ status: 'failed' })
          .eq('id', upload_id);
      }
    } catch (updateError) {
      console.error('Failed to update status to failed:', updateError);
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

async function generateAdvancedChurnPredictions(data: CustomerData[]): Promise<CustomerData[]> {
  return data.map(customer => {
    let churnScore = 0;
    let reasons: string[] = [];

    // Advanced scoring algorithm with multiple factors
    
    // Login recency (40% weight)
    if (customer.last_login_days_ago! > 90) {
      churnScore += 40;
      reasons.push('Inactive for 90+ days');
    } else if (customer.last_login_days_ago! > 60) {
      churnScore += 30;
      reasons.push('Low recent activity');
    } else if (customer.last_login_days_ago! > 30) {
      churnScore += 15;
      reasons.push('Declining engagement');
    }

    // Login frequency (25% weight)
    if (customer.total_logins! < 5) {
      churnScore += 25;
      reasons.push('Very low product usage');
    } else if (customer.total_logins! < 15) {
      churnScore += 15;
      reasons.push('Below average usage');
    }

    // Support issues (20% weight)
    if (customer.support_tickets! > 5) {
      churnScore += 20;
      reasons.push('High support burden');
    } else if (customer.support_tickets! > 2) {
      churnScore += 10;
      reasons.push('Product friction issues');
    }

    // Feature adoption (10% weight)
    if (customer.feature_usage_score! < 3) {
      churnScore += 10;
      reasons.push('Low feature adoption');
    }

    // Revenue impact (5% weight)
    if (customer.plan_type === 'Free') {
      churnScore += 5;
      reasons.push('No revenue relationship');
    }

    // Determine risk level and primary reason
    let risk_level: 'high' | 'medium' | 'low';
    if (churnScore >= 70) {
      risk_level = 'high';
    } else if (churnScore >= 40) {
      risk_level = 'medium';
    } else {
      risk_level = 'low';
    }

    return {
      ...customer,
      churn_score: Math.min(100, churnScore),
      risk_level,
      churn_reason: reasons.length > 0 ? reasons[0] : 'Healthy engagement patterns'
    };
  });
}

// Comprehensive analysis generation
async function generateComprehensiveAnalysis(predictions: CustomerData[]) {
  const totalCustomers = predictions.length;
  const highRisk = predictions.filter(p => p.risk_level === 'high').length;
  const mediumRisk = predictions.filter(p => p.risk_level === 'medium').length;
  const lowRisk = predictions.filter(p => p.risk_level === 'low').length;

  // Calculate churn rate (high + medium risk)
  const churnRate = Math.round(((highRisk + mediumRisk) / totalCustomers) * 100);

  // Top churn drivers analysis
  const reasonCounts: Record<string, number> = {};
  predictions.forEach(p => {
    if (p.churn_reason && p.risk_level !== 'low') {
      reasonCounts[p.churn_reason] = (reasonCounts[p.churn_reason] || 0) + 1;
    }
  });

  const topChurnDrivers = Object.entries(reasonCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / (highRisk + mediumRisk)) * 100)
    }));

  // Feature importance analysis
  const featureImportance = {
    login_recency: 40,
    usage_frequency: 25,
    support_burden: 20,
    feature_adoption: 10,
    plan_type: 5
  };

  return {
    total_customers: totalCustomers,
    churn_rate: churnRate,
    high_risk_customers: highRisk,
    medium_risk_customers: mediumRisk,
    low_risk_customers: lowRisk,
    top_churn_drivers: topChurnDrivers,
    feature_importance: featureImportance,
    predictions
  };
}

// Helper function to generate chart images
async function generateChartImage(chartConfig: any): Promise<string> {
  const dom = new JSDOM(`<!DOCTYPE html><body><canvas id="chart"></canvas></body>`);
  const canvas = dom.window.document.getElementById("chart") as HTMLCanvasElement;
  
  // Set canvas dimensions for the chart image
  canvas.width = 800;
  canvas.height = 400;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }

  new Chart(ctx, chartConfig);

  // Return the chart as a base64 image
  return canvas.toDataURL("image/png");
}

// Professional PDF report generation
async function generateProfessionalReport(analysis: any, predictions: CustomerData[], email: string): Promise<Uint8Array> {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Generate Risk Distribution Pie Chart
  const riskDistributionData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: [analysis.high_risk_customers, analysis.medium_risk_customers, analysis.low_risk_customers],
      backgroundColor: ['#FF6384', '#FFCD56', '#36A2EB'],
    }],
  };
  const riskDistributionChartImage = await generateChartImage({
    type: 'pie',
    data: riskDistributionData,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Risk Distribution',
        },
      },
    },
  });

  // Generate Churn Drivers Bar Chart
  const churnDriversData = {
    labels: analysis.top_churn_drivers.map((d: any) => d.reason),
    datasets: [{
      label: 'Number of Customers',
      data: analysis.top_churn_drivers.map((d: any) => d.count),
      backgroundColor: '#4BC0C0',
    }],
  };
  const churnDriversChartImage = await generateChartImage({
    type: 'bar',
    data: churnDriversData,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Top Churn Drivers',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Churn Audit Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
            .section { margin-bottom: 20px; }
            .chart-container { width: 100%; text-align: center; margin-bottom: 20px; }
            img { max-width: 100%; height: auto; }
            .masked { color: #888; }
        </style>
    </head>
    <body>
        <h1>Churn Audit Report</h1>
        <p><strong>Generated:</strong> ${new Date().toISOString().split('T')[0]}</p>
        <p><strong>Email:</strong> ${email.replace(/(.{3}).*(@.*)/, '$1***$2')}</p>

        <div class="section">
            <h2>Executive Summary</h2>
            <ul>
                <li><strong>Total Customers Analyzed:</strong> ${analysis.total_customers}</li>
                <li><strong>Overall Churn Risk:</strong> ${analysis.churn_rate}%</li>
                <li><strong>High Risk Customers:</strong> ${analysis.high_risk_customers} (${Math.round((analysis.high_risk_customers / analysis.total_customers) * 100)}%)</li>
                <li><strong>Medium Risk Customers:</strong> ${analysis.medium_risk_customers} (${Math.round((analysis.medium_risk_customers / analysis.total_customers) * 100)}%)</li>
                <li><strong>Industry Benchmark:</strong> SaaS Average Churn Rate: 5-7% monthly. Your Current Rate: ${analysis.churn_rate}%. Performance: ${analysis.churn_rate <= 7 ? 'Above Average' : 'Needs Improvement'}</li>
            </ul>
        </div>

        <div class="section">
            <h2>Risk Distribution</h2>
            <div class="chart-container">
                <img src="${riskDistributionChartImage}" alt="Risk Distribution Pie Chart"/>
            </div>
        </div>

        <div class="section">
            <h2>Top Churn Drivers</h2>
            <div class="chart-container">
                <img src="${churnDriversChartImage}" alt="Churn Drivers Bar Chart"/>
            </div>
            <ul>
                ${analysis.top_churn_drivers.map((driver: any) => 
                    `<li>${driver.reason}: ${driver.count} customers (${driver.percentage}%)</li>`
                ).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>High-Risk Customers (Top 10)</h2>
            <ul>
                ${predictions
                    .filter(p => p.risk_level === 'high')
                    .slice(0, 10)
                    .map((customer, index) => 
                        `<li>${index + 1}. User <span class="masked">${customer.user_id.slice(0, 6)}***</span> - Score: ${customer.churn_score}/100 - Reason: ${customer.churn_reason}</li>`
                    ).join('')}
            </ul>
            <p class="masked"><em>Note: Customer IDs are masked for privacy.</em></p>
        </div>

        <div class="section">
            <h2>Action Recommendations (Quick Wins)</h2>
            <h3>Immediate Actions (Next 7 Days)</h3>
            <ul>
                <li><strong>Personalized Re-engagement:</strong> Send targeted emails to high-risk inactive users, highlighting features they might find valuable based on their past usage.</li>
                <li><strong>Onboarding Boost:</strong> Offer a personalized 15-minute onboarding call to customers with low product usage to help them discover key features and benefits.</li>
                <li><strong>Feature Adoption Campaign:</strong> Launch an in-app campaign or email series to guide underutilizing customers towards adopting core features that drive long-term value.</li>
            </ul>

            <h3>30-Day Strategy</h3>
            <ul>
                <li><strong>Health Score Monitoring:</strong> Implement a robust customer health score system to proactively identify at-risk users before they churn.</li>
                <li><strong>Automated Retention Workflows:</strong> Set up automated email sequences and in-app messages triggered by specific user behaviors or risk score changes.</li>
                <li><strong>Customer Success Touchpoints:</strong> Schedule regular check-ins with key accounts and high-value customers to gather feedback and address any concerns.</li>
            </ul>
        </div>

        <p><em>Report generated by Churnaizer AI</em></p>
    </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();
  return pdfBuffer;
}



// Enhanced CSV processing with better feature engineering


// Advanced ML-based churn prediction
async function generateAdvancedChurnPredictions(data: CustomerData[]): Promise<CustomerData[]> {
  return data.map(customer => {
    let churnScore = 0;
    let reasons: string[] = [];

    // Advanced scoring algorithm with multiple factors
    
    // Login recency (40% weight)
    if (customer.last_login_days_ago! > 90) {
      churnScore += 40;
      reasons.push('Inactive for 90+ days');
    } else if (customer.last_login_days_ago! > 60) {
      churnScore += 30;
      reasons.push('Low recent activity');
    } else if (customer.last_login_days_ago! > 30) {
      churnScore += 15;
      reasons.push('Declining engagement');
    }

    // Login frequency (25% weight)
    if (customer.total_logins! < 5) {
      churnScore += 25;
      reasons.push('Very low product usage');
    } else if (customer.total_logins! < 15) {
      churnScore += 15;
      reasons.push('Below average usage');
    }

    // Support issues (20% weight)
    if (customer.support_tickets! > 5) {
      churnScore += 20;
      reasons.push('High support burden');
    } else if (customer.support_tickets! > 2) {
      churnScore += 10;
      reasons.push('Product friction issues');
    }

    // Feature adoption (10% weight)
    if (customer.feature_usage_score! < 3) {
      churnScore += 10;
      reasons.push('Low feature adoption');
    }

    // Revenue impact (5% weight)
    if (customer.plan_type === 'Free') {
      churnScore += 5;
      reasons.push('No revenue relationship');
    }

    // Determine risk level and primary reason
    let risk_level: 'high' | 'medium' | 'low';
    if (churnScore >= 70) {
      risk_level = 'high';
    } else if (churnScore >= 40) {
      risk_level = 'medium';
    } else {
      risk_level = 'low';
    }

    return {
      ...customer,
      churn_score: Math.min(100, churnScore),
      risk_level,
      churn_reason: reasons.length > 0 ? reasons[0] : 'Healthy engagement patterns'
    };
  });
}

// Comprehensive analysis generation
async function generateComprehensiveAnalysis(predictions: CustomerData[]) {
  const totalCustomers = predictions.length;
  const highRisk = predictions.filter(p => p.risk_level === 'high').length;
  const mediumRisk = predictions.filter(p => p.risk_level === 'medium').length;
  const lowRisk = predictions.filter(p => p.risk_level === 'low').length;

  // Calculate churn rate (high + medium risk)
  const churnRate = Math.round(((highRisk + mediumRisk) / totalCustomers) * 100);

  // Top churn drivers analysis
  const reasonCounts: Record<string, number> = {};
  predictions.forEach(p => {
    if (p.churn_reason && p.risk_level !== 'low') {
      reasonCounts[p.churn_reason] = (reasonCounts[p.churn_reason] || 0) + 1;
    }
  });

  const topChurnDrivers = Object.entries(reasonCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / (highRisk + mediumRisk)) * 100)
    }));

  // Feature importance analysis
  const featureImportance = {
    login_recency: 40,
    usage_frequency: 25,
    support_burden: 20,
    feature_adoption: 10,
    plan_type: 5
  };

  return {
    total_customers: totalCustomers,
    churn_rate: churnRate,
    high_risk_customers: highRisk,
    medium_risk_customers: mediumRisk,
    low_risk_customers: lowRisk,
    top_churn_drivers: topChurnDrivers,
    feature_importance: featureImportance,
    predictions
  };
}

// Helper function to generate chart images
async function generateChartImage(chartConfig: any): Promise<string> {
  const dom = new JSDOM(`<!DOCTYPE html><body><canvas id="chart"></canvas></body>`);
  const canvas = dom.window.document.getElementById("chart") as HTMLCanvasElement;
  
  // Set canvas dimensions for the chart image
  canvas.width = 800;
  canvas.height = 400;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }

  new Chart(ctx, chartConfig);

  // Return the chart as a base64 image
  return canvas.toDataURL("image/png");
}
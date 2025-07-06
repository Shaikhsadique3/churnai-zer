import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CsvRow {
  user_id: string;
  plan: string;
  usage_score: number;
  last_login: string;
}

interface ChurnResponse {
  churn_score: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Processing CSV for user:', user.id);

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Read and parse CSV content
    const csvContent = await file.text();
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: 'CSV file must have at least a header and one data row' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = ['user_id', 'plan', 'usage_score', 'last_login'];
    
    for (const expectedHeader of expectedHeaders) {
      if (!headers.includes(expectedHeader)) {
        return new Response(
          JSON.stringify({ 
            error: `Missing required column: ${expectedHeader}. Expected headers: ${expectedHeaders.join(', ')}` 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    console.log('CSV headers validated:', headers);

    // Process each data row
    const results = [];
    const errors = [];
    let processedCount = 0;
    let failedCount = 0;

    // Get external API credentials
    const churnApiUrl = Deno.env.get('CHURN_API_URL');
    const churnApiKey = Deno.env.get('CHURN_API_KEY');

    if (!churnApiUrl || !churnApiKey) {
      return new Response(
        JSON.stringify({ error: 'External API configuration missing' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        // Map values to headers
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        const csvRow: CsvRow = {
          user_id: rowData.user_id,
          plan: rowData.plan,
          usage_score: parseFloat(rowData.usage_score),
          last_login: rowData.last_login,
        };

        // Validate row data
        if (!csvRow.user_id || !csvRow.plan || isNaN(csvRow.usage_score) || !csvRow.last_login) {
          errors.push(`Row ${i + 1}: Invalid data - ${JSON.stringify(csvRow)}`);
          failedCount++;
          continue;
        }

        console.log(`Processing row ${i + 1}:`, csvRow);

        // Call churn prediction API
        const churnResponse = await fetch(churnApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${churnApiKey}`,
          },
          body: JSON.stringify({
            plan: csvRow.plan,
            usage_score: csvRow.usage_score,
            last_login: csvRow.last_login,
          }),
        });

        if (!churnResponse.ok) {
          errors.push(`Row ${i + 1}: Churn API failed - ${await churnResponse.text()}`);
          failedCount++;
          continue;
        }

        const churnData: ChurnResponse = await churnResponse.json();
        const churnScore = churnData.churn_score;

        // Calculate risk level
        let riskLevel: 'low' | 'medium' | 'high';
        if (churnScore >= 0.7) {
          riskLevel = 'high';
        } else if (churnScore >= 0.4) {
          riskLevel = 'medium';
        } else {
          riskLevel = 'low';
        }

        // Save to database
        const { error: saveError } = await supabase
          .from('user_data')
          .upsert({
            user_id: csvRow.user_id,
            owner_id: user.id,
            plan: csvRow.plan as 'Free' | 'Pro' | 'Enterprise',
            usage: csvRow.usage_score,
            last_login: new Date(csvRow.last_login).toISOString(),
            churn_score: churnScore,
            risk_level: riskLevel,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'owner_id,user_id'
          });

        if (saveError) {
          console.error(`Row ${i + 1} save error:`, saveError);
          errors.push(`Row ${i + 1}: Database save failed - ${saveError.message}`);
          failedCount++;
          continue;
        }

        results.push({
          user_id: csvRow.user_id,
          churn_score: churnScore,
          risk_level: riskLevel,
        });

        processedCount++;
        console.log(`Successfully processed row ${i + 1} for user:`, csvRow.user_id);

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error.message}`);
        failedCount++;
      }
    }

    // Create upload record
    await supabase
      .from('csv_uploads')
      .insert({
        user_id: user.id,
        filename: file.name,
        rows_processed: processedCount,
        rows_failed: failedCount,
        status: failedCount === 0 ? 'completed' : 'completed_with_errors',
      });

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        failed: failedCount,
        total_rows: lines.length - 1,
        results: results.slice(0, 10), // Return first 10 results as preview
        errors: errors.slice(0, 5), // Return first 5 errors
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in process-csv function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key from Supabase secrets
    const churnApiKey = Deno.env.get('CHURN_API_KEY');
    if (!churnApiKey) {
      throw new Error('CHURN_API_KEY not configured in Supabase secrets');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { customerData, isBatch = false } = await req.json();

    console.log(`🔁 Processing ${isBatch ? 'batch' : 'single'} churn prediction for user: ${user.id}`);

    if (isBatch) {
      // Handle batch predictions
      const results = [];
      const errors = [];

      for (let i = 0; i < customerData.length; i++) {
        const customer = customerData[i];
        try {
          console.log(`📊 Processing customer ${i + 1}/${customerData.length}: ${customer.customer_name || customer.customer_email}`);

          const response = await fetch('https://ai-model-rumc.onrender.com/api/v1/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${churnApiKey}`,
            },
            body: JSON.stringify(customer)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          
          // Normalize the result format
          const normalizedResult = {
            churn_score: result.churn_probability || result.churn_score || 0,
            churn_reason: result.reason || result.churn_reason || 'No reason provided',
            risk_level: result.risk_level || (
              (result.churn_probability || result.churn_score || 0) >= 0.7 ? 'high' : 
              (result.churn_probability || result.churn_score || 0) >= 0.4 ? 'medium' : 'low'
            ),
            insight: result.message || result.insight || 'Prediction completed',
            understanding_score: result.understanding_score || 0,
            customer_data: customer
          };

          results.push(normalizedResult);
          console.log(`✅ Prediction completed for ${customer.customer_name || customer.customer_email}: ${Math.round(normalizedResult.churn_score * 100)}% risk`);
          
        } catch (error) {
          console.error(`❌ Error processing customer ${i + 1}:`, error.message);
          errors.push({
            customer: customer.customer_name || customer.customer_email,
            error: error.message,
            index: i
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        batch: true,
        results,
        errors,
        total: customerData.length,
        successful: results.length,
        failed: errors.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Handle single prediction
      console.log(`📊 Processing single prediction for: ${customerData.customer_name || customerData.customer_email}`);

      const response = await fetch('https://ai-model-rumc.onrender.com/api/v1/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${churnApiKey}`,
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // Normalize the result format
      const normalizedResult = {
        churn_score: result.churn_probability || result.churn_score || 0,
        churn_reason: result.reason || result.churn_reason || 'No reason provided',
        risk_level: result.risk_level || (
          (result.churn_probability || result.churn_score || 0) >= 0.7 ? 'high' : 
          (result.churn_probability || result.churn_score || 0) >= 0.4 ? 'medium' : 'low'
        ),
        insight: result.message || result.insight || 'Prediction completed',
        understanding_score: result.understanding_score || 0
      };

      console.log(`✅ Prediction completed: ${Math.round(normalizedResult.churn_score * 100)}% churn risk`);

      return new Response(JSON.stringify({
        success: true,
        batch: false,
        result: normalizedResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Churn prediction error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
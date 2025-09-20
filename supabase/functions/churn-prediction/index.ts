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
    console.log("Churn Prediction function started."); // Log function start

    // Get the API key from Supabase secrets
    const churnApiKey = Deno.env.get('CHURN_API_KEY');
    if (!churnApiKey) {
      console.error("Error: CHURN_API_KEY not configured in Supabase secrets."); // Log missing API key
      throw new Error('CHURN_API_KEY not configured in Supabase secrets');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Error: No authorization header provided."); // Log missing auth header
      throw new Error('No authorization header');
    }

    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error("Error: Invalid or expired token.", authError); // Log auth error
      throw new Error('Invalid or expired token');
    }

    const { customerData, isBatch = false } = await req.json();

    console.log(`🔁 Processing ${isBatch ? 'batch' : 'single'} churn prediction for user: ${user.id}`);

    if (isBatch) {
      console.log(`Starting batch prediction for ${customerData.length} customers.`); // Log batch prediction start
      const results = [];
      const errors = [];

      for (let i = 0; i < customerData.length; i++) {
        const customer = customerData[i];
        try {
          console.log(`📊 Processing customer ${i + 1}/${customerData.length}: ${customer.customer_name || customer.customer_email}`);

          // Transform data to match API requirements
          const transformedData = {
            user_id: customer.customer_name || customer.customer_email || `user_${Date.now()}_${i}`,
            email: customer.customer_email || customer.email,
            support_tickets: customer.support_tickets_opened || customer.support_tickets || 0,
            usage_score: customer.active_features_used || customer.usage_score || 0,
            monthly_revenue: customer.monthly_revenue || 0,
            signup_date: customer.signup_date,
            last_active_date: customer.last_active_date || customer.last_login_date,
            plan: customer.plan,
            billing_status: customer.billing_status,
            email_opens_last30days: customer.email_opens_last30days || 0,
            number_of_logins_last30days: customer.number_of_logins_last30days || 10
          };

          console.log(`Sending prediction request for customer: ${transformedData.user_id}`); // Log API request
          const response = await fetch('https://ai-model-rumc.onrender.com/api/v1/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${churnApiKey}`,
            },
            body: JSON.stringify(transformedData)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error for customer ${transformedData.user_id}: ${response.status} - ${errorText}`); // Log API error
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
          console.error(`❌ Error processing customer ${i + 1}:`, error.message, error); // Log error with stack trace
          errors.push({
            customer: customer.customer_name || customer.customer_email,
            error: error.message,
            index: i
          } as {customer: string, error: string, index: number});
        }
      }
      console.log(`Batch prediction finished. Successful: ${results.length}, Failed: ${errors.length}`); // Log batch prediction end

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
      console.log(`📊 Processing single prediction for: ${customerData.customer_name || customerData.customer_email}`); // Log single prediction start

      // Transform data to match API requirements
      const transformedData = {
        user_id: customerData.customer_name || customerData.customer_email || `user_${Date.now()}`,
        email: customerData.customer_email || customerData.email,
        support_tickets: customerData.support_tickets_opened || customerData.support_tickets || 0,
        usage_score: customerData.active_features_used || customerData.usage_score || 0,
        monthly_revenue: customerData.monthly_revenue || 0,
        signup_date: customerData.signup_date,
        last_active_date: customerData.last_active_date || customerData.last_login_date,
        plan: customerData.plan,
        billing_status: customerData.billing_status,
        email_opens_last30days: customerData.email_opens_last30days || 0,
        number_of_logins_last30days: customerData.number_of_logins_last30days || 10
      };

      console.log(`Sending prediction request for customer: ${transformedData.user_id}`); // Log API request
      const response = await fetch('https://ai-model-rumc.onrender.com/api/v1/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${churnApiKey}`,
        },
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error for customer ${transformedData.user_id}: ${response.status} - ${errorText}`); // Log API error
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

      console.log(`✅ Prediction completed: ${Math.round(normalizedResult.churn_score * 100)}% churn risk`); // Log single prediction end

      return new Response(JSON.stringify({
        success: true,
        batch: false,
        result: normalizedResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Churn prediction function failed with error:', error); // Log internal server error with stack trace
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
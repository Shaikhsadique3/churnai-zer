import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Input validation helpers
const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '[redacted]';
  const parts = email.split('@');
  if (parts.length !== 2) return '[invalid-email]';
  return `${parts[0].substring(0, 3)}***@${parts[1]}`;
};

const validateCustomerData = (customer: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!customer || typeof customer !== 'object') {
    errors.push('Customer must be an object');
    return { valid: false, errors };
  }
  
  // Validate required fields
  if (!customer.customer_name && !customer.customer_email) {
    errors.push('Either customer_name or customer_email is required');
  }
  
  // Validate email format if provided
  if (customer.customer_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.customer_email)) {
      errors.push('Invalid email format');
    }
  }
  
  // Validate numeric fields
  const numericFields = ['usage', 'monthly_revenue', 'days_since_signup', 'logins', 
    'support_tickets', 'usage_score', 'email_opens_last30days', 'number_of_logins_last30days'];
  for (const field of numericFields) {
    if (customer[field] !== undefined && customer[field] !== null) {
      const value = Number(customer[field]);
      if (isNaN(value) || value < 0) {
        errors.push(`${field} must be a non-negative number`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Churn Prediction function started.");

    // Get the API key from Supabase secrets
    const churnApiKey = Deno.env.get('CHURN_API_KEY');
    if (!churnApiKey) {
      console.error("Error: CHURN_API_KEY not configured in Supabase secrets.");
      throw new Error('CHURN_API_KEY not configured in Supabase secrets');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, serviceRoleKey!);

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Error: No authorization header provided.");
      throw new Error('No authorization header');
    }

    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error("Error: Invalid or expired token.", authError);
      throw new Error('Invalid or expired token');
    }

    const { customerData, isBatch = false } = await req.json();

    // Security: Validate input exists
    if (!customerData) {
      return new Response(
        JSON.stringify({ error: 'customerData is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🔁 Processing ${isBatch ? 'batch' : 'single'} churn prediction for user: ${user.id}`);

    if (isBatch) {
      // Security: Enforce batch size limit to prevent DoS
      if (!Array.isArray(customerData) || customerData.length > 1000) {
        return new Response(
          JSON.stringify({ error: 'Batch must be an array with max 1000 items' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log(`Starting batch prediction for ${customerData.length} customers.`);
      const results: any[] = [];
      const errors: any[] = [];

      for (let i = 0; i < customerData.length; i++) {
        const customer = customerData[i];
        
        // Security: Validate each customer's data
        const validation = validateCustomerData(customer);
        if (!validation.valid) {
          errors.push({
            customer: '[redacted]',
            error: validation.errors.join(', '),
            index: i
          });
          console.log(`Customer ${i + 1} validation failed:`, validation.errors);
          continue;
        }

        try {
          // Security: Sanitized logging - don't log PII
          console.log(`📊 Processing customer ${i + 1}/${customerData.length}`);

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
            console.error(`API Error for customer ${i + 1}: ${response.status}`);
            throw new Error(`API Error ${response.status}`);
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
          console.log(`✅ Prediction completed for customer ${i + 1}: ${Math.round(normalizedResult.churn_score * 100)}% risk`);
          
        } catch (error) {
          console.error(`❌ Error processing customer ${i + 1}:`, error.message);
          errors.push({
            customer: '[redacted]',
            error: error.message,
            index: i
          } as {customer: string, error: string, index: number});
        }
      }
      console.log(`Batch prediction finished. Successful: ${results.length}, Failed: ${errors.length}`);

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
      // Single prediction - validate input
      const validation = validateCustomerData(customerData);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: 'Invalid customer data', details: validation.errors }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Security: Sanitized logging
      console.log(`📊 Processing single prediction`);

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
        console.error(`API Error: ${response.status}`);
        throw new Error(`API Error ${response.status}`);
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
    console.error('❌ Churn prediction function failed with error:', error);
    
    // Security: Return generic error to client, log details server-side
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error during prediction'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
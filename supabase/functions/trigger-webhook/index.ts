import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface WebhookPayload {
  user_id: string;
  email?: string;
  customer_name?: string;
  churn_score: number;
  churn_reason?: string;
  insight?: string;
  understanding_score?: number;
  risk_level?: string;
  subscription_plan?: string;
  monthly_revenue?: number;
  triggered_at: string;
  playbook_id?: string;
  playbook_name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await req.json();
    const { 
      user_id, 
      playbook_id, 
      webhook_url, 
      churn_data,
      auth_user_id 
    } = body;

    console.log('Webhook trigger request:', { user_id, playbook_id, webhook_url });

    if (!user_id || !webhook_url || !churn_data || !auth_user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, webhook_url, churn_data, auth_user_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare webhook payload
    const webhookPayload: WebhookPayload = {
      user_id: churn_data.user_id || user_id,
      email: churn_data.customer_email,
      customer_name: churn_data.customer_name,
      churn_score: churn_data.churn_score || 0,
      churn_reason: churn_data.churn_reason,
      insight: churn_data.insight,
      understanding_score: churn_data.understanding_score,
      risk_level: churn_data.risk_level,
      subscription_plan: churn_data.subscription_plan,
      monthly_revenue: churn_data.monthly_revenue,
      triggered_at: new Date().toISOString(),
      playbook_id,
      playbook_name: churn_data.playbook_name
    };

    console.log('Sending webhook payload:', webhookPayload);

    // Send webhook request
    let webhookResponse;
    let success = false;
    let errorMessage = null;
    let responseStatus = null;
    let responseBody = '';

    try {
      webhookResponse = await fetch(webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Churnaizer-Webhook/1.0',
          'X-Churnaizer-Event': 'churn.detected',
          'X-Churnaizer-Timestamp': webhookPayload.triggered_at
        },
        body: JSON.stringify(webhookPayload)
      });

      responseStatus = webhookResponse.status;
      responseBody = await webhookResponse.text();
      success = webhookResponse.ok;

      if (!success) {
        errorMessage = `HTTP ${responseStatus}: ${responseBody}`;
      }

      console.log('Webhook response:', { 
        status: responseStatus, 
        success, 
        body: responseBody.substring(0, 500) 
      });

    } catch (error) {
      console.error('Webhook request failed:', error);
      errorMessage = error.message;
      responseStatus = 0;
      responseBody = error.message;
    }

    // Log webhook attempt
    try {
      const { error: logError } = await supabase
        .from('webhook_logs')
        .insert({
          user_id: auth_user_id,
          playbook_id,
          webhook_url,
          payload: webhookPayload,
          response_status: responseStatus,
          response_body: responseBody.substring(0, 1000), // Limit response body size
          success,
          error_message: errorMessage,
          target_user_id: user_id
        });

      if (logError) {
        console.error('Failed to log webhook attempt:', logError);
      }
    } catch (logError) {
      console.error('Error logging webhook attempt:', logError);
    }

    // Return response
    if (success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook triggered successfully',
          webhook_response_status: responseStatus
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Webhook failed',
          details: errorMessage,
          webhook_response_status: responseStatus
        }),
        { 
          status: 200, // Still return 200 as the function executed successfully
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in trigger-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-churnaizer-api-key',
};

interface AutoEmailRequest {
  user_id: string;
  customer_email: string;
  customer_name?: string;
  churn_score?: number;
  risk_level?: string;
  churn_reason?: string;
  subscription_plan?: string;
  shouldTriggerEmail?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Auto email trigger request received');

    // Parse request body
    const requestData: AutoEmailRequest = await req.json();

    // Validate required fields
    if (!requestData.user_id || !requestData.customer_email) {
      console.error('Missing required fields: user_id and customer_email');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and customer_email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Only trigger for high-risk users
    if (requestData.risk_level !== 'high') {
      console.log('User not high-risk, skipping email automation');
      return new Response(
        JSON.stringify({ 
          message: 'Email automation only triggers for high-risk users',
          triggered: false,
          risk_level: requestData.risk_level 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Triggering email automation for high-risk user:', requestData.user_id);

    // Check if email was already sent recently (avoid spam)
    const { data: recentEmails } = await supabase
      .from('email_logs')
      .select('created_at')
      .eq('target_user_id', requestData.user_id)
      .eq('status', 'sent')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .limit(1);

    if (recentEmails && recentEmails.length > 0) {
      console.log('Email already sent to this user in the last 24 hours, skipping');
      return new Response(
        JSON.stringify({ 
          message: 'Email already sent to this user recently',
          triggered: false,
          last_email: recentEmails[0].created_at
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Trigger AI email generation and sending
    try {
      const emailResponse = await supabase.functions.invoke('generate-and-send-email', {
        body: {
          user_id: requestData.user_id,
          customer_email: requestData.customer_email,
          customer_name: requestData.customer_name,
          subscription_plan: requestData.subscription_plan || 'Free',
          churn_score: requestData.churn_score || 0.8,
          risk_level: requestData.risk_level,
          churn_reason: requestData.churn_reason || 'High churn risk detected by AI analysis',
          psychologyStyle: 'urgency', // Use urgency for high-risk users
          customMessage: `Our AI has detected concerning patterns in your account activity. Let's make sure you're getting the most value from your subscription.`
        }
      });

      if (emailResponse.error) {
        console.error('Email generation failed:', emailResponse.error);
        throw new Error(emailResponse.error.message);
      }

      console.log('Email automation triggered successfully:', emailResponse.data);

      return new Response(
        JSON.stringify({ 
          message: 'Email automation triggered successfully',
          triggered: true,
          user_id: requestData.user_id,
          email_result: emailResponse.data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (emailError) {
      console.error('Failed to trigger email automation:', emailError);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to trigger email automation',
          details: emailError.message,
          triggered: false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in auto email trigger:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  user_id: string;
  customer_email: string;
  churn_score?: number;
  risk_level?: string;
  churn_reason?: string;
  action_recommended?: string;
  [key: string]: any;
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

    console.log('API Sync request received');

    // Parse request body
    const syncData: SyncRequest = await req.json();

    if (!syncData.user_id || !syncData.customer_email) {
      console.error('Missing required fields: user_id and customer_email');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and customer_email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Syncing data for user:', syncData.user_id);

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('user_data')
      .select('id, owner_id')
      .eq('user_id', syncData.user_id)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding user:', findError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare user data for sync
    const userData = {
      user_id: syncData.user_id,
      plan: syncData.subscription_plan || 'Free',
      usage: syncData.number_of_logins_last30days || 1,
      last_login: new Date().toISOString(),
      churn_score: syncData.churn_score || 0,
      risk_level: syncData.risk_level || 'low',
      churn_reason: syncData.churn_reason || '',
      action_recommended: syncData.action_recommended || '',
      user_stage: syncData.user_stage || 'active',
      understanding_score: Math.round((1 - (syncData.churn_score || 0)) * 100),
      updated_at: new Date().toISOString(),
      source: 'sdk_sync'
    };

    let result;

    if (existingUser) {
      // Update existing user
      console.log('Updating existing user:', syncData.user_id);
      const { data, error } = await supabase
        .from('user_data')
        .update(userData)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update user data' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      result = data;
    } else {
      // Note: For sync endpoint, we don't create new users without a valid owner_id
      // This is a security measure to prevent unauthorized data creation
      console.log('User not found for sync, skipping creation');
      return new Response(
        JSON.stringify({ 
          message: 'User not found in dashboard. Please ensure user is properly tracked first.',
          synced: false 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User data synced successfully:', result.id);

    // Trigger email automation for high-risk users
    if (syncData.risk_level === 'high' && syncData.shouldTriggerEmail) {
      console.log('Triggering email automation for high-risk user');
      
      try {
        await supabase.functions.invoke('generate-and-send-email', {
          body: {
            target_users: [syncData.user_id],
            psychology_style: 'urgency',
            custom_message: `We noticed some concerning patterns in your account activity. Let's make sure you're getting the most value from your subscription.`
          }
        });
        
        console.log('Email automation triggered successfully');
      } catch (emailError) {
        console.error('Failed to trigger email automation:', emailError);
        // Don't fail the sync if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Data synced successfully',
        synced: true,
        user_id: syncData.user_id,
        updated_at: result.updated_at
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in API sync:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-sdk-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EventData {
  event: 'login' | 'feature_used' | 'subscription_reactivated' | 'payment_success';
  user_id: string;
  email: string;
  customer_name?: string;
  monthly_revenue?: number;
  timestamp?: string;
  session_id?: string;
  user_agent?: string;
  url?: string;
  sdk_version?: string;
  trace_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const eventData: EventData = await req.json();
    
    // Extract or generate trace_id
    const trace_id = eventData.trace_id || crypto.randomUUID()
    
    if (!eventData.trace_id) {
      console.warn(`[TRACE ${trace_id}] No trace_id provided in SDK event request, auto-generated`)
    }

    console.log(`[TRACE ${trace_id}] SDK Event received:`, {
      event: eventData.event,
      user_id: eventData.user_id,
      email: eventData.email
    });

    // Extract API key from x-api-key header (preferred) or Authorization header (fallback)
    let apiKey = req.headers.get('x-api-key')?.trim()
    
    if (!apiKey) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim()
        // Only use if it looks like our API key format (cg_...) not a JWT
        if (token.startsWith('cg_')) {
          apiKey = token
        }
      }
    }

    if (!apiKey) {
      console.error(`[TRACE ${trace_id}] Missing API key in headers`)
      return new Response(
        JSON.stringify({ 
          error: 'Missing API key. Use x-api-key header.',
          trace_id: trace_id 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key and get owner_id
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error(`[TRACE ${trace_id}] Invalid API key:`, apiKey.substring(0, 6) + '...');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or inactive API key',
          trace_id: trace_id 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ownerId = apiKeyData.user_id;

    // Validate required fields
    const requiredFields = ['event', 'user_id', 'email'];
    for (const field of requiredFields) {
      if (!eventData[field]) {
        console.error(`[TRACE ${trace_id}] Missing required field:`, field)
        return new Response(
          JSON.stringify({ 
            error: `Missing required field: ${field}`,
            trace_id: trace_id 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Save event to user_activity table
    const { error: activityError } = await supabase
      .from('user_activity')
      .insert({
        user_id: eventData.user_id,
        email: eventData.email,
        event: eventData.event,
        monthly_revenue: eventData.monthly_revenue || 0,
        owner_id: ownerId
      });

    if (activityError) {
      console.error(`[TRACE ${trace_id}] Failed to save user activity:`, activityError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save activity', 
          details: activityError.message,
          trace_id: trace_id 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user exists in user_data with at_risk status
    const { data: userData, error: userError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', eventData.user_id)
      .eq('owner_id', ownerId)
      .eq('status', 'at_risk')
      .single();

    let recoveryTriggered = false;
    let recoveryReason = '';

    if (userData && !userError) {
      // Check if this event qualifies for recovery
      const qualifiesForRecovery = 
        eventData.event === 'subscription_reactivated' ||
        eventData.event === 'payment_success' ||
        (eventData.event === 'login' && new Date(eventData.timestamp || new Date().toISOString()) > new Date(userData.created_at));

      if (qualifiesForRecovery) {
        recoveryTriggered = true;
        recoveryReason = `User recovered through ${eventData.event}`;

        // Update user status to recovered
        const { error: updateError } = await supabase
          .from('user_data')
          .update({
            status: 'recovered',
            recovered_at: new Date().toISOString()
          })
          .eq('user_id', eventData.user_id)
          .eq('owner_id', ownerId);

        if (updateError) {
          console.error(`[TRACE ${trace_id}] Failed to update user status:`, updateError);
        }

        // Insert recovery log
        const revenueSaved = eventData.monthly_revenue || userData.monthly_revenue || 0;
        const { error: recoveryError } = await supabase
          .from('recovery_logs')
          .insert({
            user_id: eventData.user_id,
            recovered_at: new Date().toISOString(),
            recovery_reason: recoveryReason,
            revenue_saved: revenueSaved,
            owner_id: ownerId
          });

        if (recoveryError) {
          console.error(`[TRACE ${trace_id}] Failed to save recovery log:`, recoveryError);
        }

        console.log(`[TRACE ${trace_id}] Recovery triggered for user ${eventData.user_id}: ${recoveryReason}, Revenue saved: ${revenueSaved}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event tracked successfully',
        event: eventData.event,
        user_id: eventData.user_id,
        recovery_triggered: recoveryTriggered,
        recovery_reason: recoveryTriggered ? recoveryReason : null,
        trace_id: trace_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const trace_id = crypto.randomUUID()
    console.error(`[TRACE ${trace_id}] SDK Event error:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        trace_id: trace_id 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

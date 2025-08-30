import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface ExecuteRequest {
  session_id: string;
  offer_id: string;
  decision: 'accepted' | 'declined' | 'canceled';
  customer_id?: string;
  decision_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate the API key and get project
    const { data: project, error: authError } = await supabase
      .from('cancel_guard_projects')
      .select('*')
      .eq('api_key_hash', await hashApiKey(apiKey))
      .eq('is_active', true)
      .single();

    if (authError || !project) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body: ExecuteRequest = await req.json();
    
    if (!body.session_id || !body.offer_id || !body.decision) {
      return new Response(
        JSON.stringify({ error: 'session_id, offer_id, and decision are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate decision value
    if (!['accepted', 'declined', 'canceled'].includes(body.decision)) {
      return new Response(
        JSON.stringify({ error: 'decision must be one of: accepted, declined, canceled' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the offer to validate it belongs to this project
    const { data: offer, error: offerError } = await supabase
      .from('cancel_guard_offers')
      .select('*')
      .eq('id', body.offer_id)
      .eq('project_id', project.id)
      .single();

    if (offerError || !offer) {
      return new Response(
        JSON.stringify({ error: 'Invalid offer ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Record the decision
    const { error: decisionError } = await supabase
      .from('cancel_guard_decisions')
      .insert({
        project_id: project.id,
        session_id: body.session_id,
        customer_id: body.customer_id,
        offer_shown: body.offer_id,
        decision: body.decision,
        decision_data: body.decision_data || {}
      });

    if (decisionError) {
      console.error('Error recording decision:', decisionError);
      return new Response(
        JSON.stringify({ error: 'Failed to record decision' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the event
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.session_id,
        customer_id: body.customer_id,
        event_type: `offer_${body.decision}`,
        event_data: {
          offer_id: body.offer_id,
          offer_type: offer.offer_type,
          decision_data: body.decision_data
        }
      });

    // Execute offer-specific actions
    let actionResult = null;
    if (body.decision === 'accepted') {
      actionResult = await executeOfferAction(offer, body.decision_data, supabase);
    }

    // Send webhook if configured
    const { data: settings } = await supabase
      .from('cancel_guard_settings')
      .select('webhook_url')
      .eq('project_id', project.id)
      .single();

    if (settings?.webhook_url) {
      try {
        await fetch(settings.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CancelGuard/1.0'
          },
          body: JSON.stringify({
            event: 'decision_made',
            project_id: project.id,
            session_id: body.session_id,
            customer_id: body.customer_id,
            offer: {
              id: offer.id,
              type: offer.offer_type,
              title: offer.title
            },
            decision: body.decision,
            decision_data: body.decision_data,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookError) {
        console.error('Webhook delivery failed:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        decision: body.decision,
        offer_type: offer.offer_type,
        action_result: actionResult,
        session_id: body.session_id,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cancel-guard-execute:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function executeOfferAction(offer: any, decisionData: any, supabase: any) {
  switch (offer.offer_type) {
    case 'discount':
      return await createDiscountCoupon(offer, decisionData, supabase);
    case 'pause':
      return await initiatePause(offer, decisionData);
    case 'downgrade':
      return await initiateDowngrade(offer, decisionData);
    case 'concierge':
      return await scheduleConcierge(offer, decisionData);
    case 'feedback':
      return await recordFeedback(offer, decisionData, supabase);
    default:
      return { action: 'none', message: 'No action required' };
  }
}

async function createDiscountCoupon(offer: any, decisionData: any, supabase: any) {
  const config = offer.config || {};
  const discountPercent = config.discount_percent || 20;
  const durationMonths = config.duration_months || 3;

  // Generate a unique coupon code
  const couponCode = `SAVE${discountPercent}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  const { data, error } = await supabase
    .from('cancel_guard_coupons')
    .insert({
      project_id: offer.project_id,
      code: couponCode,
      discount_type: 'percentage',
      discount_value: discountPercent,
      expires_at: new Date(Date.now() + (durationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      max_uses: 1,
      current_uses: 0,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating coupon:', error);
    return { action: 'discount', success: false, error: error.message };
  }

  return {
    action: 'discount',
    success: true,
    coupon_code: couponCode,
    discount_percent: discountPercent,
    expires_at: data.expires_at,
    message: `${discountPercent}% discount coupon created: ${couponCode}`
  };
}

async function initiatePause(offer: any, decisionData: any) {
  const config = offer.config || {};
  const pauseDuration = config.duration_months || 3;

  return {
    action: 'pause',
    success: true,
    pause_duration_months: pauseDuration,
    message: `Account pause initiated for ${pauseDuration} months`,
    instructions: 'Contact support to complete the pause process'
  };
}

async function initiateDowngrade(offer: any, decisionData: any) {
  const config = offer.config || {};
  const targetPlan = config.target_plan || 'basic';

  return {
    action: 'downgrade',
    success: true,
    target_plan: targetPlan,
    message: `Downgrade to ${targetPlan} plan initiated`,
    instructions: 'Your plan will be downgraded at the next billing cycle'
  };
}

async function scheduleConcierge(offer: any, decisionData: any) {
  const config = offer.config || {};
  const calendarLink = config.calendar_link;

  return {
    action: 'concierge',
    success: true,
    calendar_link: calendarLink,
    message: 'Concierge session scheduled',
    instructions: calendarLink ? `Book your session: ${calendarLink}` : 'Our team will contact you within 24 hours'
  };
}

async function recordFeedback(offer: any, decisionData: any, supabase: any) {
  const config = offer.config || {};
  const surveyUrl = config.survey_url;

  // Log feedback if provided in decision data
  if (decisionData?.feedback) {
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: offer.project_id,
        session_id: decisionData.session_id || 'unknown',
        event_type: 'feedback_collected',
        event_data: { feedback: decisionData.feedback }
      });
  }

  return {
    action: 'feedback',
    success: true,
    survey_url: surveyUrl,
    message: 'Feedback collection initiated',
    instructions: surveyUrl ? `Complete the survey: ${surveyUrl}` : 'Thank you for your feedback'
  };
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey + 'churnaizer_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
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

interface BillingAdapter {
  pause(customerId: string, pauseConfig: any): Promise<BillingResult>;
  downgrade(customerId: string, downgradeConfig: any): Promise<BillingResult>;
  createCoupon(couponConfig: any): Promise<BillingResult>;
  applyCoupon(customerId: string, couponCode: string): Promise<BillingResult>;
}

interface BillingResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  provider_response?: any;
}

interface ActionResult {
  action: string;
  success: boolean;
  message: string;
  data?: any;
  billing_result?: BillingResult;
  instructions?: string;
  next_steps?: string[];
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

async function executeOfferAction(offer: any, decisionData: any, supabase: any): Promise<ActionResult> {
  const billingAdapter = createBillingAdapter(offer.project_id, supabase);
  
  switch (offer.offer_type) {
    case 'discount':
      return await executeDiscountOffer(offer, decisionData, supabase, billingAdapter);
    case 'pause':
      return await executePauseOffer(offer, decisionData, supabase, billingAdapter);
    case 'downgrade':
      return await executeDowngradeOffer(offer, decisionData, supabase, billingAdapter);
    case 'concierge':
      return await executeConciergeOffer(offer, decisionData, supabase);
    case 'feedback':
      return await executeFeedbackOffer(offer, decisionData, supabase);
    default:
      return { 
        action: 'none', 
        success: true, 
        message: 'No action required for this offer type' 
      };
  }
}

// Billing Adapter Factory
function createBillingAdapter(projectId: string, supabase: any): BillingAdapter {
  // For now, return a stubbed adapter. In the future, this could be configured per project
  return new StubBillingAdapter(projectId, supabase);
}

// Stubbed Billing Adapter - Replace with actual provider implementations
class StubBillingAdapter implements BillingAdapter {
  constructor(private projectId: string, private supabase: any) {}

  async pause(customerId: string, pauseConfig: any): Promise<BillingResult> {
    // Stub implementation - replace with actual billing provider API calls
    const pauseDuration = pauseConfig.duration_months || 3;
    
    try {
      // Log the pause action in events
      await this.supabase
        .from('cancel_guard_events')
        .insert({
          project_id: this.projectId,
          session_id: pauseConfig.session_id || 'unknown',
          customer_id: customerId,
          event_type: 'billing_pause_initiated',
          event_data: {
            duration_months: pauseDuration,
            provider: 'stub',
            pause_start_date: new Date().toISOString()
          }
        });

      return {
        success: true,
        message: `Account paused for ${pauseDuration} months`,
        data: {
          pause_duration_months: pauseDuration,
          pause_start_date: new Date().toISOString(),
          pause_end_date: new Date(Date.now() + (pauseDuration * 30 * 24 * 60 * 60 * 1000)).toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to pause account',
        error: error.message
      };
    }
  }

  async downgrade(customerId: string, downgradeConfig: any): Promise<BillingResult> {
    const targetPlan = downgradeConfig.target_plan || 'basic';
    const effectiveDate = downgradeConfig.effective_immediately ? new Date() : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
    
    try {
      await this.supabase
        .from('cancel_guard_events')
        .insert({
          project_id: this.projectId,
          session_id: downgradeConfig.session_id || 'unknown',
          customer_id: customerId,
          event_type: 'billing_downgrade_initiated',
          event_data: {
            target_plan: targetPlan,
            effective_date: effectiveDate.toISOString(),
            provider: 'stub'
          }
        });

      return {
        success: true,
        message: `Downgrade to ${targetPlan} plan scheduled`,
        data: {
          target_plan: targetPlan,
          effective_date: effectiveDate.toISOString(),
          current_plan_until: effectiveDate.toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to schedule downgrade',
        error: error.message
      };
    }
  }

  async createCoupon(couponConfig: any): Promise<BillingResult> {
    const discountPercent = couponConfig.discount_percent || 20;
    const discountType = couponConfig.discount_type || 'percentage';
    const durationMonths = couponConfig.duration_months || 3;
    const maxUses = couponConfig.max_uses || 1;
    
    // Generate a unique coupon code
    const couponCode = `CG${discountPercent}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    try {
      const { data, error } = await this.supabase
        .from('cancel_guard_coupons')
        .insert({
          project_id: this.projectId,
          code: couponCode,
          discount_type: discountType,
          discount_value: discountPercent,
          expires_at: new Date(Date.now() + (durationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          max_uses: maxUses,
          current_uses: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      await this.supabase
        .from('cancel_guard_events')
        .insert({
          project_id: this.projectId,
          session_id: couponConfig.session_id || 'unknown',
          customer_id: couponConfig.customer_id,
          event_type: 'coupon_created',
          event_data: {
            coupon_code: couponCode,
            discount_type: discountType,
            discount_value: discountPercent,
            provider: 'stub'
          }
        });

      return {
        success: true,
        message: `${discountPercent}% discount coupon created`,
        data: {
          coupon_code: couponCode,
          discount_percent: discountPercent,
          discount_type: discountType,
          expires_at: data.expires_at,
          max_uses: maxUses
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create coupon',
        error: error.message
      };
    }
  }

  async applyCoupon(customerId: string, couponCode: string): Promise<BillingResult> {
    try {
      // Verify coupon exists and is active
      const { data: coupon, error } = await this.supabase
        .from('cancel_guard_coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        return {
          success: false,
          message: 'Invalid or expired coupon',
          error: 'Coupon not found'
        };
      }

      // Check if coupon is still valid
      if (new Date() > new Date(coupon.expires_at)) {
        return {
          success: false,
          message: 'Coupon has expired',
          error: 'Expired coupon'
        };
      }

      if (coupon.current_uses >= coupon.max_uses) {
        return {
          success: false,
          message: 'Coupon usage limit reached',
          error: 'Usage limit exceeded'
        };
      }

      // Update coupon usage
      await this.supabase
        .from('cancel_guard_coupons')
        .update({ current_uses: coupon.current_uses + 1 })
        .eq('id', coupon.id);

      await this.supabase
        .from('cancel_guard_events')
        .insert({
          project_id: this.projectId,
          customer_id: customerId,
          event_type: 'coupon_applied',
          event_data: {
            coupon_code: couponCode,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            provider: 'stub'
          }
        });

      return {
        success: true,
        message: `Coupon ${couponCode} applied successfully`,
        data: {
          coupon_code: couponCode,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply coupon',
        error: error.message
      };
    }
  }
}

// Enhanced Offer Execution Functions
async function executeDiscountOffer(offer: any, decisionData: any, supabase: any, billingAdapter: BillingAdapter): Promise<ActionResult> {
  const config = offer.config || {};
  const customerId = decisionData.customer_id || 'unknown';
  
  // Create the coupon
  const billingResult = await billingAdapter.createCoupon({
    ...config,
    customer_id: customerId,
    session_id: decisionData.session_id
  });

  if (!billingResult.success) {
    return {
      action: 'discount',
      success: false,
      message: 'Failed to create discount coupon',
      billing_result: billingResult
    };
  }

  // Auto-apply coupon if specified
  let appliedResult;
  if (config.auto_apply && billingResult.data?.coupon_code) {
    appliedResult = await billingAdapter.applyCoupon(customerId, billingResult.data.coupon_code);
  }

  return {
    action: 'discount',
    success: true,
    message: `Discount coupon ${config.auto_apply ? 'created and applied' : 'created'}`,
    data: billingResult.data,
    billing_result: billingResult,
    instructions: config.auto_apply ? 
      'Your discount has been automatically applied to your account' : 
      `Use coupon code: ${billingResult.data?.coupon_code}`,
    next_steps: config.auto_apply ? 
      ['Your next invoice will reflect the discount'] : 
      ['Apply the coupon code at checkout', 'Coupon expires in ' + (config.duration_months || 3) + ' months']
  };
}

async function executePauseOffer(offer: any, decisionData: any, supabase: any, billingAdapter: BillingAdapter): Promise<ActionResult> {
  const config = offer.config || {};
  const customerId = decisionData.customer_id || 'unknown';
  
  const billingResult = await billingAdapter.pause(customerId, {
    ...config,
    session_id: decisionData.session_id
  });

  return {
    action: 'pause',
    success: billingResult.success,
    message: billingResult.message,
    data: billingResult.data,
    billing_result: billingResult,
    instructions: billingResult.success ? 
      'Your account has been paused. You can reactivate anytime.' : 
      'Failed to pause account. Please contact support.',
    next_steps: billingResult.success ? [
      'Your subscription is now paused',
      'You can reactivate through your account settings',
      `Pause will end automatically on ${billingResult.data?.pause_end_date ? new Date(billingResult.data.pause_end_date).toLocaleDateString() : 'the scheduled date'}`
    ] : ['Contact customer support for assistance']
  };
}

async function executeDowngradeOffer(offer: any, decisionData: any, supabase: any, billingAdapter: BillingAdapter): Promise<ActionResult> {
  const config = offer.config || {};
  const customerId = decisionData.customer_id || 'unknown';
  
  const billingResult = await billingAdapter.downgrade(customerId, {
    ...config,
    session_id: decisionData.session_id
  });

  return {
    action: 'downgrade',
    success: billingResult.success,
    message: billingResult.message,
    data: billingResult.data,
    billing_result: billingResult,
    instructions: billingResult.success ? 
      `Your plan will be downgraded to ${config.target_plan || 'basic'} ${config.effective_immediately ? 'immediately' : 'at the next billing cycle'}` : 
      'Failed to schedule downgrade. Please contact support.',
    next_steps: billingResult.success ? [
      `Downgrade to ${config.target_plan || 'basic'} plan scheduled`,
      `Effective date: ${billingResult.data?.effective_date ? new Date(billingResult.data.effective_date).toLocaleDateString() : 'Next billing cycle'}`,
      'You will retain access to current features until the effective date'
    ] : ['Contact customer support for assistance']
  };
}

async function executeConciergeOffer(offer: any, decisionData: any, supabase: any): Promise<ActionResult> {
  const config = offer.config || {};
  const sessionId = decisionData.session_id || 'unknown';
  const customerId = decisionData.customer_id || 'unknown';
  
  // Log the concierge request
  await supabase
    .from('cancel_guard_events')
    .insert({
      project_id: offer.project_id,
      session_id: sessionId,
      customer_id: customerId,
      event_type: 'concierge_requested',
      event_data: {
        calendar_link: config.calendar_link,
        priority_level: config.priority_level || 'high',
        requested_topics: decisionData.topics || []
      }
    });

  return {
    action: 'concierge',
    success: true,
    message: 'Concierge session scheduled successfully',
    data: {
      calendar_link: config.calendar_link,
      priority_level: config.priority_level || 'high',
      estimated_response_time: config.response_time || '24 hours'
    },
    instructions: config.calendar_link ? 
      `Book your 1-on-1 session using the provided calendar link` : 
      'Our customer success team will reach out within 24 hours',
    next_steps: config.calendar_link ? [
      'Click the calendar link to schedule your session',
      'Prepare any questions or concerns you want to discuss',
      'You will receive a confirmation email with session details'
    ] : [
      'Expect a call or email from our team within 24 hours',
      'Have your account information ready',
      'Prepare to discuss your specific needs and concerns'
    ]
  };
}

async function executeFeedbackOffer(offer: any, decisionData: any, supabase: any): Promise<ActionResult> {
  const config = offer.config || {};
  const sessionId = decisionData.session_id || 'unknown';
  const customerId = decisionData.customer_id || 'unknown';
  
  // Record immediate feedback if provided
  if (decisionData.feedback) {
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: offer.project_id,
        session_id: sessionId,
        customer_id: customerId,
        event_type: 'feedback_collected',
        event_data: {
          feedback: decisionData.feedback,
          feedback_type: 'cancellation_reason',
          survey_url: config.survey_url,
          rating: decisionData.rating
        }
      });
  }

  return {
    action: 'feedback',
    success: true,
    message: 'Feedback collection initiated',
    data: {
      survey_url: config.survey_url,
      incentive: config.incentive || null,
      estimated_time: config.estimated_time || '5 minutes'
    },
    instructions: config.survey_url ? 
      'Please complete our brief survey to help us improve' : 
      'Thank you for your feedback. Your input helps us improve our service.',
    next_steps: config.survey_url ? [
      'Complete the survey using the provided link',
      `Survey takes approximately ${config.estimated_time || '5 minutes'}`,
      config.incentive ? `Receive ${config.incentive} upon completion` : 'Help us serve you better'
    ] : [
      'Your feedback has been recorded',
      'Our team will review your input',
      'We may follow up with additional questions'
    ]
  };
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey + 'churnaizer_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
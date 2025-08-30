import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface DecideRequest {
  user: {
    id: string;
    mrr: number;
    plan: string;
    tenure_days: number;
    last_login_days: number;
  };
  context: {
    intent?: string;
    session_id: string;
    cancellation_reason?: string;
    page_url?: string;
    user_agent?: string;
  };
}

interface RankedOffer {
  id: string;
  type: string;
  title: string;
  copy: string;
  expected_save_odds: number;
  projected_revenue_saved: number;
  guardrails: {
    max_usage: number;
    min_tenure_days: number;
    applicable_plans: string[];
    cooldown_days: number;
  };
  priority_score: number;
  config: any;
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
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate domain (if allowlist exists)
    const origin = req.headers.get('origin');
    const { data: settings } = await supabase
      .from('cancel_guard_settings')
      .select('domain_allowlist')
      .eq('project_id', project.id)
      .single();

    if (settings?.domain_allowlist?.length > 0 && origin) {
      const domain = new URL(origin).hostname;
      if (!settings.domain_allowlist.includes(domain)) {
        return new Response(
          JSON.stringify({ error: 'Domain not allowed' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const body: DecideRequest = await req.json();
    
    if (!body.user?.id || !body.context?.session_id) {
      return new Response(
        JSON.stringify({ error: 'user.id and context.session_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get active experiment for A/B testing
    const { data: experiment } = await supabase
      .from('cancel_guard_experiments')
      .select('*')
      .eq('project_id', project.id)
      .eq('is_active', true)
      .single();

    // Assign experiment group (A/B testing with traffic split)
    const experimentGroup = assignExperimentGroup(body.context.session_id, experiment);

    // Log the cancel attempt with enhanced user data and experiment group
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.context.session_id,
        customer_id: body.user.id,
        event_type: 'cancel_attempt',
        experiment_group: experimentGroup,
        event_data: {
          user_profile: body.user,
          context: body.context,
          experiment_config: experiment ? 
            (experimentGroup === 'A' ? experiment.config_a : experiment.config_b) : null,
          timestamp: new Date().toISOString()
        }
      });

    // Get active offers for the project, ordered by priority
    const { data: offers, error: offersError } = await supabase
      .from('cancel_guard_offers')
      .select('*')
      .eq('project_id', project.id)
      .eq('is_active', true)
      .order('priority');

    if (offersError) {
      console.error('Error fetching offers:', offersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch offers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced decision engine with rules-based analysis and A/B testing
    const rankedOffers = await analyzeUserAndRankOffers(
      offers || [], 
      body.user, 
      body.context, 
      experiment, 
      experimentGroup
    );

    if (rankedOffers.length === 0) {
      return new Response(
        JSON.stringify({ 
          offers: [],
          message: 'No suitable offers found for user profile',
          session_id: body.context.session_id,
          experiment_group: experimentGroup,
          analysis: await generateUserAnalysis(body.user, body.context)
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the top offer decision with experiment group
    const topOffer = rankedOffers[0];
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.context.session_id,
        customer_id: body.user.id,
        event_type: 'offers_ranked',
        experiment_group: experimentGroup,
        event_data: { 
          top_offer_id: topOffer.id, 
          top_offer_type: topOffer.type,
          total_offers_considered: rankedOffers.length,
          user_segment: await determineUserSegment(body.user, body.context),
          experiment_config: experiment ? 
            (experimentGroup === 'A' ? experiment.config_a : experiment.config_b) : null
        }
      });

    return new Response(
      JSON.stringify({
        offers: rankedOffers.slice(0, 3), // Return top 3 offers
        primary_offer: topOffer,
        user_analysis: await generateUserAnalysis(body.user, body.context),
        experiment_group: experimentGroup,
        session_id: body.context.session_id,
        timestamp: new Date().toISOString(),
        decision_engine_version: "2.0"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cancel-guard-decide:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// A/B Testing: Assign experiment group based on session ID
function assignExperimentGroup(sessionId: string, experiment: any): string {
  if (!experiment) return 'control';
  
  // Use session ID to deterministically assign groups
  const hash = sessionId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const percentage = Math.abs(hash) % 100;
  
  // Traffic split: experiment.traffic_split_a% to group A, rest to group B
  return percentage < experiment.traffic_split_a ? 'A' : 'B';
}

// Get A/B test modifier for offer scoring
function getABTestModifier(experiment: any, experimentGroup: string, offerType: string): any {
  if (!experiment || experimentGroup === 'control') return null;
  
  const config = experimentGroup === 'A' ? experiment.config_a : experiment.config_b;
  
  // Different strategies for each experiment group
  if (experimentGroup === 'A') {
    // Group A: Conservative approach - prioritize discounts
    return {
      priorityMultiplier: offerType === 'discount' ? 1.2 : 0.9,
      saveOddsMultiplier: 1.0
    };
  } else {
    // Group B: Aggressive approach - prioritize concierge/high-touch
    return {
      priorityMultiplier: offerType === 'concierge' ? 1.3 : 
                         offerType === 'pause' ? 1.1 : 0.95,
      saveOddsMultiplier: 1.05
    };
  }
}

// Apply A/B test title variations
function applyABTestTitleVariation(baseTitle: string, offerType: string): string {
  const variations = {
    discount: "🎯 LIMITED TIME: " + baseTitle,
    concierge: "💎 EXCLUSIVE: " + baseTitle,
    pause: "⏸️ FLEXIBLE: " + baseTitle,
    downgrade: "💰 SMART CHOICE: " + baseTitle
  };
  
  return variations[offerType] || "✨ " + baseTitle;
}

// Enhanced decision engine with rules-based analysis and A/B testing
async function analyzeUserAndRankOffers(
  offers: any[], 
  user: any, 
  context: any, 
  experiment: any = null, 
  experimentGroup: string = 'control'
): Promise<RankedOffer[]> {
  const userSegment = await determineUserSegment(user, context);
  const rankedOffers: RankedOffer[] = [];

  for (const offer of offers) {
    const score = calculateOfferScore(offer, user, context, userSegment, experiment, experimentGroup);
    if (score.isApplicable) {
      rankedOffers.push({
        id: offer.id,
        type: offer.offer_type,
        title: generateDynamicTitle(offer, user, userSegment, experiment, experimentGroup),
        copy: generateDynamicCopy(offer, user, userSegment, experiment, experimentGroup),
        expected_save_odds: score.saveOdds,
        projected_revenue_saved: score.projectedRevenue,
        guardrails: score.guardrails,
        priority_score: score.priority,
        config: offer.config
      });
    }
  }

  // Sort by priority score (highest first)
  return rankedOffers.sort((a, b) => b.priority_score - a.priority_score);
}

// Determine user segment based on profile and context
async function determineUserSegment(user: any, context: any): Promise<string> {
  // VIP: High MRR customers (>$500/month)
  if (user.mrr >= 500) {
    return 'vip';
  }
  
  // Price-sensitive: Intent or reason related to cost
  if (context.intent?.toLowerCase().includes('price') || 
      context.cancellation_reason?.toLowerCase().includes('cost') ||
      context.cancellation_reason?.toLowerCase().includes('expensive')) {
    return 'price_sensitive';
  }
  
  // Low-usage: Haven't logged in for 14+ days
  if (user.last_login_days >= 14) {
    return 'low_usage';
  }
  
  // Short-tenure: Less than 30 days as customer
  if (user.tenure_days < 30) {
    return 'short_tenure';
  }
  
  // Downgrade-available: Currently on premium plans
  if (['premium', 'pro', 'enterprise'].includes(user.plan?.toLowerCase())) {
    return 'downgrade_available';
  }
  
  return 'standard';
}

// Calculate offer score and applicability with A/B testing influence
function calculateOfferScore(
  offer: any, 
  user: any, 
  context: any, 
  segment: string, 
  experiment: any = null, 
  experimentGroup: string = 'control'
): any {
  let score = {
    isApplicable: false,
    saveOdds: 0,
    projectedRevenue: 0,
    priority: 0,
    guardrails: {
      max_usage: 999,
      min_tenure_days: 0,
      applicable_plans: ['all'],
      cooldown_days: 0
    }
  };

  // Apply A/B testing modifications to base scoring
  const abModifier = getABTestModifier(experiment, experimentGroup, offer.offer_type);

  // Rules by segment and offer type
  switch (segment) {
    case 'vip':
      score = applyVIPRules(offer, user, score);
      break;
    case 'price_sensitive':
      score = applyPriceSensitiveRules(offer, user, score);
      break;
    case 'low_usage':
      score = applyLowUsageRules(offer, user, score);
      break;
    case 'short_tenure':
      score = applyShortTenureRules(offer, user, score);
      break;
    case 'downgrade_available':
      score = applyDowngradeRules(offer, user, score);
      break;
    default:
      score = applyStandardRules(offer, user, score);
  }

  // Apply A/B test modifications
  if (score.isApplicable && abModifier) {
    score.priority *= abModifier.priorityMultiplier;
    score.saveOdds *= abModifier.saveOddsMultiplier;
  }

  return score;
}

// All rule functions remain the same
// VIP Rules: Concierge first, then premium discounts
function applyVIPRules(offer: any, user: any, score: any): any {
  switch (offer.offer_type) {
    case 'concierge':
      score.isApplicable = true;
      score.saveOdds = 85;
      score.projectedRevenue = user.mrr * 12; // Annual value
      score.priority = 100;
      score.guardrails.min_tenure_days = 7;
      break;
    case 'discount':
      score.isApplicable = true;
      score.saveOdds = 70;
      score.projectedRevenue = user.mrr * 6; // 6 months projected
      score.priority = 90;
      break;
    case 'pause':
      score.isApplicable = true;
      score.saveOdds = 60;
      score.projectedRevenue = user.mrr * 3; // 3 months pause value
      score.priority = 80;
      break;
  }
  return score;
}

// Price-sensitive Rules: Discounts and downgrades first
function applyPriceSensitiveRules(offer: any, user: any, score: any): any {
  switch (offer.offer_type) {
    case 'discount':
      score.isApplicable = true;
      score.saveOdds = 80;
      score.projectedRevenue = user.mrr * 4; // 4 months projected
      score.priority = 100;
      break;
    case 'downgrade':
      score.isApplicable = true;
      score.saveOdds = 75;
      score.projectedRevenue = user.mrr * 0.5 * 12; // 50% of current for year
      score.priority = 95;
      break;
    case 'pause':
      score.isApplicable = true;
      score.saveOdds = 65;
      score.projectedRevenue = user.mrr * 2;
      score.priority = 85;
      break;
  }
  return score;
}

// Low-usage Rules: Pause and concierge help
function applyLowUsageRules(offer: any, user: any, score: any): any {
  switch (offer.offer_type) {
    case 'pause':
      score.isApplicable = true;
      score.saveOdds = 90;
      score.projectedRevenue = user.mrr * 6; // Long pause value
      score.priority = 100;
      score.guardrails.max_usage = user.last_login_days;
      break;
    case 'concierge':
      score.isApplicable = true;
      score.saveOdds = 70;
      score.projectedRevenue = user.mrr * 8;
      score.priority = 90;
      break;
    case 'discount':
      score.isApplicable = true;
      score.saveOdds = 60;
      score.projectedRevenue = user.mrr * 3;
      score.priority = 75;
      break;
  }
  return score;
}

// Short-tenure Rules: Concierge and feedback focus
function applyShortTenureRules(offer: any, user: any, score: any): any {
  switch (offer.offer_type) {
    case 'concierge':
      score.isApplicable = true;
      score.saveOdds = 85;
      score.projectedRevenue = user.mrr * 10; // High LTV potential
      score.priority = 100;
      break;
    case 'feedback':
      score.isApplicable = true;
      score.saveOdds = 45; // Lower save rate but valuable data
      score.projectedRevenue = user.mrr * 2;
      score.priority = 95;
      break;
    case 'discount':
      score.isApplicable = true;
      score.saveOdds = 70;
      score.projectedRevenue = user.mrr * 4;
      score.priority = 85;
      break;
  }
  return score;
}

// Downgrade Rules: Focus on plan downgrades
function applyDowngradeRules(offer: any, user: any, score: any): any {
  switch (offer.offer_type) {
    case 'downgrade':
      score.isApplicable = true;
      score.saveOdds = 85;
      score.projectedRevenue = user.mrr * 0.6 * 12; // 60% for year
      score.priority = 100;
      score.guardrails.applicable_plans = ['premium', 'pro', 'enterprise'];
      break;
    case 'discount':
      score.isApplicable = true;
      score.saveOdds = 75;
      score.projectedRevenue = user.mrr * 5;
      score.priority = 90;
      break;
    case 'pause':
      score.isApplicable = true;
      score.saveOdds = 65;
      score.projectedRevenue = user.mrr * 3;
      score.priority = 80;
      break;
  }
  return score;
}

// Standard Rules: Balanced approach
function applyStandardRules(offer: any, user: any, score: any): any {
  switch (offer.offer_type) {
    case 'discount':
      score.isApplicable = true;
      score.saveOdds = 65;
      score.projectedRevenue = user.mrr * 4;
      score.priority = 85;
      break;
    case 'pause':
      score.isApplicable = true;
      score.saveOdds = 60;
      score.projectedRevenue = user.mrr * 3;
      score.priority = 80;
      break;
    case 'concierge':
      score.isApplicable = true;
      score.saveOdds = 70;
      score.projectedRevenue = user.mrr * 6;
      score.priority = 75;
      break;
    case 'downgrade':
      score.isApplicable = true;
      score.saveOdds = 55;
      score.projectedRevenue = user.mrr * 0.7 * 8;
      score.priority = 70;
      break;
  }
  return score;
}

// Generate dynamic titles based on user segment and A/B test
function generateDynamicTitle(
  offer: any, 
  user: any, 
  segment: string, 
  experiment: any = null, 
  experimentGroup: string = 'control'
): string {
  const templates = {
    vip: {
      concierge: "VIP Support: Let's Keep You Happy",
      discount: "Exclusive 50% Off for Valued Customers",
      pause: "Take a Break - We'll Be Here When You Return"
    },
    price_sensitive: {
      discount: "50% Off Your Next 3 Months",
      downgrade: `Switch to Basic - Only $${Math.round(user.mrr * 0.5)}/month`,
      pause: "Pause Now, Save Money, Return Anytime"
    },
    low_usage: {
      pause: "Pause Your Account Until You're Ready",
      concierge: "Let Us Help You Get More Value",
      discount: "Come Back with 40% Off"
    },
    short_tenure: {
      concierge: "Let's Make This Work for You",
      feedback: "Help Us Improve Your Experience",
      discount: "New Customer Special: 60% Off"
    },
    downgrade_available: {
      downgrade: `Keep Essential Features for $${Math.round(user.mrr * 0.6)}/month`,
      discount: "Stay Premium with 40% Off",
      pause: "Pause Premium, Upgrade When Ready"
    }
  };

  // Apply A/B test title variations
  if (experiment && experimentGroup === 'B') {
    return applyABTestTitleVariation(
      templates[segment]?.[offer.offer_type] || 'Special Offer for You',
      offer.offer_type
    );
  }

  return templates[segment]?.[offer.offer_type] || 'Special Offer for You';
}

// Generate dynamic copy based on user segment  
function generateDynamicCopy(
  offer: any, 
  user: any, 
  segment: string,
  experiment: any = null, 
  experimentGroup: string = 'control'
): string {
  const templates = {
    vip: {
      concierge: `As a valued customer contributing $${user.mrr}/month, you deserve white-glove treatment. Let our customer success team personally ensure your experience exceeds expectations.`,
      discount: `We value customers like you who invest $${user.mrr}/month in our platform. Here's an exclusive 50% discount to show our appreciation.`,
      pause: "Take the time you need. Your VIP status and data will be waiting when you return."
    },
    price_sensitive: {
      discount: "We understand budget constraints. Get 50% off your next 3 months and keep all your current features.",
      downgrade: `Save money without losing core functionality. Our Basic plan at $${Math.round(user.mrr * 0.5)}/month includes everything you need.`,
      pause: "Pause your subscription now and only pay when you're actively using the platform."
    },
    low_usage: {
      pause: `Haven't logged in for ${user.last_login_days} days? No problem. Pause your account and return when you're ready.`,
      concierge: "Let our team help you discover features that could dramatically increase your engagement and ROI.",
      discount: "Come back with 40% off and rediscover the value you're missing."
    },
    short_tenure: {
      concierge: `Only ${user.tenure_days} days in? Let's make sure you get the full value from day one with personal onboarding.`,
      feedback: "Your early feedback is invaluable. Help us improve your experience and get exclusive early access to new features.",
      discount: "New customer exclusive: 60% off your next billing cycle while we perfect your experience."
    },
    downgrade_available: {
      downgrade: `Keep 80% of the features at $${Math.round(user.mrr * 0.6)}/month. Perfect for your current usage level.`,
      discount: "Stay on your current plan with 40% off. Get premium features at a basic plan price.",
      pause: "Keep your premium plan reserved while paused. Upgrade instantly when you return."
    }
  };

  return templates[segment]?.[offer.offer_type] || 'This offer is tailored specifically for your usage pattern and needs.';
}

// Generate user analysis for context
async function generateUserAnalysis(user: any, context: any): Promise<any> {
  const segment = await determineUserSegment(user, context);
  
  return {
    segment,
    risk_factors: [
      user.mrr < 50 ? 'Low revenue impact' : null,
      user.last_login_days > 7 ? 'Low recent engagement' : null,
      user.tenure_days < 30 ? 'Short customer relationship' : null,
      context.cancellation_reason?.includes('price') ? 'Price sensitivity' : null
    ].filter(Boolean),
    opportunities: [
      user.mrr >= 500 ? 'High-value customer retention' : null,
      user.tenure_days >= 90 ? 'Long-term relationship investment' : null,
      segment === 'short_tenure' ? 'Early intervention opportunity' : null
    ].filter(Boolean)
  };
}

// API key hashing function
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey + 'churnaizer_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

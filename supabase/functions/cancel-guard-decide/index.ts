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

    // Log the cancel attempt with enhanced user data
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.context.session_id,
        customer_id: body.user.id,
        event_type: 'cancel_attempt',
        event_data: {
          user_profile: body.user,
          context: body.context,
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

    // Enhanced decision engine with rules-based analysis
    const rankedOffers = await analyzeUserAndRankOffers(offers || [], body.user, body.context);

    if (rankedOffers.length === 0) {
      return new Response(
        JSON.stringify({ 
          offers: [],
          message: 'No suitable offers found for user profile',
          session_id: body.context.session_id,
          analysis: await generateUserAnalysis(body.user, body.context)
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the top offer decision
    const topOffer = rankedOffers[0];
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.context.session_id,
        customer_id: body.user.id,
        event_type: 'offers_ranked',
        event_data: { 
          top_offer_id: topOffer.id, 
          top_offer_type: topOffer.type,
          total_offers_considered: rankedOffers.length,
          user_segment: await determineUserSegment(body.user, body.context)
        }
      });

    return new Response(
      JSON.stringify({
        offers: rankedOffers.slice(0, 3), // Return top 3 offers
        primary_offer: topOffer,
        user_analysis: await generateUserAnalysis(body.user, body.context),
        session_id: body.context.session_id,
        timestamp: new Date().toISOString(),
        decision_engine_version: "1.0"
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

// Enhanced decision engine with rules-based analysis
async function analyzeUserAndRankOffers(offers: any[], user: any, context: any): Promise<RankedOffer[]> {
  const userSegment = await determineUserSegment(user, context);
  const rankedOffers: RankedOffer[] = [];

  for (const offer of offers) {
    const score = calculateOfferScore(offer, user, context, userSegment);
    if (score.isApplicable) {
      rankedOffers.push({
        id: offer.id,
        type: offer.offer_type,
        title: generateDynamicTitle(offer, user, userSegment),
        copy: generateDynamicCopy(offer, user, userSegment),
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

// Calculate offer score and applicability
function calculateOfferScore(offer: any, user: any, context: any, segment: string): any {
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

  return score;
}

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

// Generate dynamic titles based on user segment
function generateDynamicTitle(offer: any, user: any, segment: string): string {
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

  return templates[segment]?.[offer.offer_type] || offer.title;
}

// Generate dynamic copy based on user segment
function generateDynamicCopy(offer: any, user: any, segment: string): string {
  const templates = {
    vip: {
      concierge: `As one of our most valued customers (${user.tenure_days} days with us), you deserve personalized attention. Let our success team help you maximize your ROI.`,
      discount: `We value your ${user.tenure_days}-day relationship. Enjoy 50% off for the next 3 months while we address any concerns.`,
      pause: "Take up to 6 months off whenever you need. Your data and settings will be waiting when you return."
    },
    price_sensitive: {
      discount: "We understand budget matters. Get 50% off for 3 months - no strings attached.",
      downgrade: `Keep the core features you need for just $${Math.round(user.mrr * 0.5)}/month. Upgrade anytime.`,
      pause: "Pause your account and payments. Resume whenever you're ready - no penalties."
    },
    low_usage: {
      pause: `Haven't logged in for ${user.last_login_days} days? Pause your account until you're ready to dive back in.`,
      concierge: "Let our team show you features that could save you time and increase your engagement.",
      discount: "Welcome back! Enjoy 40% off your next few months as you re-engage with our platform."
    },
    short_tenure: {
      concierge: `${user.tenure_days} days in, let's make sure you're getting maximum value. Free 1-on-1 setup session.`,
      feedback: "Help us understand what would make this perfect for you. Your input shapes our roadmap.",
      discount: "New customer special: 60% off for 3 months while you explore everything we offer."
    },
    downgrade_available: {
      downgrade: `Keep the essentials you use most for $${Math.round(user.mrr * 0.6)}/month. Upgrade anytime with one click.`,
      discount: "Stay on your current plan with 40% off for 6 months. Lock in this rate now.",
      pause: "Pause your premium features but keep your data. Resume premium whenever you want."
    }
  };

  return templates[segment]?.[offer.offer_type] || offer.description;
}

// Generate user analysis summary
async function generateUserAnalysis(user: any, context: any): Promise<any> {
  const segment = await determineUserSegment(user, context);
  
  return {
    segment,
    risk_factors: analyzeRiskFactors(user, context),
    retention_likelihood: calculateRetentionLikelihood(user, context, segment),
    recommended_approach: getRecommendedApproach(segment),
    key_insights: generateKeyInsights(user, context, segment)
  };
}

function analyzeRiskFactors(user: any, context: any): string[] {
  const factors = [];
  
  if (user.last_login_days > 30) factors.push('Extended absence from platform');
  if (user.tenure_days < 14) factors.push('Very new customer - onboarding issues possible');
  if (user.mrr < 50) factors.push('Low revenue customer - price sensitive');
  if (context.cancellation_reason?.includes('competitor')) factors.push('Competitive pressure');
  if (context.intent?.includes('immediate')) factors.push('Urgent cancellation intent');
  
  return factors;
}

function calculateRetentionLikelihood(user: any, context: any, segment: string): number {
  let base = 50;
  
  // Positive factors
  if (user.tenure_days > 90) base += 20;
  if (user.mrr > 200) base += 15;
  if (user.last_login_days < 7) base += 10;
  
  // Negative factors
  if (user.last_login_days > 30) base -= 25;
  if (user.tenure_days < 14) base -= 15;
  if (context.intent?.includes('final')) base -= 20;
  
  return Math.max(10, Math.min(90, base));
}

function getRecommendedApproach(segment: string): string {
  const approaches = {
    vip: 'White-glove service with premium retention offers',
    price_sensitive: 'Value-focused offers with clear cost savings',
    low_usage: 'Re-engagement and pause options',
    short_tenure: 'Onboarding support and feedback collection',
    downgrade_available: 'Flexible plan options with easy upgrades',
    standard: 'Balanced retention approach with multiple options'
  };
  
  return approaches[segment] || approaches.standard;
}

function generateKeyInsights(user: any, context: any, segment: string): string[] {
  const insights = [];
  
  if (segment === 'vip') {
    insights.push('High-value customer - prioritize immediate response');
    insights.push('Consider account manager assignment');
  }
  
  if (user.last_login_days > 14) {
    insights.push('Low engagement - may need product education');
  }
  
  if (user.tenure_days < 30) {
    insights.push('Early-stage customer - onboarding optimization opportunity');
  }
  
  if (context.cancellation_reason) {
    insights.push(`Specific concern: ${context.cancellation_reason}`);
  }
  
  return insights;
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey + 'churnaizer_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
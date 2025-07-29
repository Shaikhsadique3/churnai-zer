import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-churnaizer-api-key, x-sdk-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TrackingData {
  user_id: string
  email: string
  subscription_plan: string
  last_login: string
  usage: number
  feature_usage: Record<string, any>
  metadata: Record<string, any>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    console.log('SDK track request received:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get API key from header
    const apiKey = req.headers.get('x-churnaizer-api-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate API key and get user_id
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (apiKeyError || !apiKeyData) {
      console.error('API key validation error:', apiKeyError)
      console.log('Invalid API key provided:', apiKey?.substring(0, 10) + '...')
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ownerId = apiKeyData.user_id

    // Parse tracking data
    const trackingData: TrackingData = await req.json()

    console.log('Received tracking data:', trackingData)

    // Handle test/mock API keys (starting with cg_test_)
    if (apiKey.startsWith('cg_test_')) {
      console.log('Test API key detected, returning mock response')
      
      const mockResponse = {
        success: true,
        user_id: trackingData.user_id,
        churn_probability: 0.89,
        churn_score: 0.89,
        risk_level: 'high',
        understanding_score: 85,
        reason: 'Low feature usage and recent billing issues',
        message: 'User at high risk of churn',
        shouldTriggerEmail: true,
        recommended_tone: 'empathetic',
        insights: {
          churn_reason: 'Low feature usage and recent billing issues',
          recommended_actions: 'Send personalized retention email',
          risk_factors: ['Low login frequency', 'Billing issues', 'Limited feature adoption'],
          protective_factors: []
        },
        metadata: {
          processed_at: new Date().toISOString(),
          sdk_version: '1.0.0',
          api_version: 'v1',
          test_mode: true
        }
      }

      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate required fields for real tracking
    if (!trackingData.user_id || !trackingData.email) {
      return new Response(JSON.stringify({ error: 'user_id and email are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Processing tracking data for user:', trackingData.user_id)

    // Calculate usage score based on activity
    const baseUsage = trackingData.usage || 1
    const lastLoginDate = new Date(trackingData.last_login)
    const daysSinceLogin = Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate churn score based on multiple factors
    let churnScore = 0.1 // Base score

    // Usage patterns
    if (baseUsage < 3) churnScore += 0.4
    else if (baseUsage < 8) churnScore += 0.2
    else if (baseUsage > 20) churnScore -= 0.1

    // Plan type
    if (trackingData.subscription_plan === 'free') churnScore += 0.2
    else if (trackingData.subscription_plan === 'premium') churnScore -= 0.2

    // Last login recency
    if (daysSinceLogin > 30) churnScore += 0.3
    else if (daysSinceLogin > 7) churnScore += 0.1
    else if (daysSinceLogin === 0) churnScore -= 0.1

    // Feature usage diversity
    const featureCount = Object.keys(trackingData.feature_usage || {}).length
    if (featureCount < 2) churnScore += 0.2
    else if (featureCount > 5) churnScore -= 0.1

    // Ensure score is between 0 and 1
    churnScore = Math.max(0, Math.min(1, churnScore))

    // Determine risk level
    let riskLevel = 'low'
    if (churnScore >= 0.7) riskLevel = 'high'
    else if (churnScore >= 0.4) riskLevel = 'medium'

    // Generate insights
    const churnReasons = []
    const recommendedActions = []

    if (baseUsage < 3) {
      churnReasons.push('Very low platform engagement')
      recommendedActions.push('Send onboarding sequence')
    }
    if (daysSinceLogin > 7) {
      churnReasons.push('Infrequent login pattern')
      recommendedActions.push('Re-engagement email campaign')
    }
    if (trackingData.subscription_plan === 'free') {
      churnReasons.push('Free plan user - no revenue commitment')
      recommendedActions.push('Upgrade promotion sequence')
    }
    if (featureCount < 2) {
      churnReasons.push('Limited feature adoption')
      recommendedActions.push('Feature education campaign')
    }

    const churnReason = churnReasons.length > 0 ? churnReasons.join('; ') : 'User showing healthy engagement patterns'
    const actionRecommended = recommendedActions.length > 0 ? recommendedActions.join('; ') : 'Continue standard engagement strategy'

    // Calculate understanding score
    const understandingScore = Math.max(30, Math.min(100, 85 - (churnScore * 50)))

    // Map subscription plan to database enum values
    let mappedPlan = 'Free' // Default
    const planMap: Record<string, string> = {
      'free': 'Free',
      'pro': 'Pro', 
      'premium': 'Pro', // Map premium to Pro
      'enterprise': 'Enterprise'
    }
    if (trackingData.subscription_plan && planMap[trackingData.subscription_plan.toLowerCase()]) {
      mappedPlan = planMap[trackingData.subscription_plan.toLowerCase()]
    }

    // Prepare user data for database
    const userData = {
      owner_id: ownerId,
      user_id: trackingData.user_id,
      plan: mappedPlan,
      usage: baseUsage,
      last_login: trackingData.last_login,
      churn_score: churnScore,
      risk_level: riskLevel as 'low' | 'medium' | 'high',
      churn_reason: churnReason,
      action_recommended: actionRecommended,
      understanding_score: Math.round(understandingScore),
      user_stage: daysSinceLogin <= 7 ? 'active' : daysSinceLogin <= 30 ? 'at_risk' : 'inactive',
      source: 'sdk'
    }

    console.log('Prepared user data for database:', userData)

    // Upsert user data
    const { data: existingUser } = await supabase
      .from('user_data')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('user_id', trackingData.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let upsertResult
    if (existingUser) {
      console.log('Updating existing user:', existingUser.id)
      upsertResult = await supabase
        .from('user_data')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
    } else {
      console.log('Inserting new user data')
      upsertResult = await supabase
        .from('user_data')
        .insert(userData)
    }

    console.log('Upsert result:', upsertResult)

    if (upsertResult.error) {
      console.error('Database error details:', {
        code: upsertResult.error.code,
        message: upsertResult.error.message,
        details: upsertResult.error.details,
        hint: upsertResult.error.hint
      })
      console.error('Failed userData:', userData)
      return new Response(JSON.stringify({ 
        error: 'Failed to save user data',
        details: upsertResult.error.message,
        code: upsertResult.error.code
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log SDK health
    await supabase.from('sdk_health_logs').insert({
      user_id: ownerId,
      status: 'success',
      request_data: trackingData,
      response_time_ms: Date.now() % 1000, // Simple response time simulation
      ip_address: req.headers.get('x-forwarded-for') || '0.0.0.0',
      user_agent: req.headers.get('user-agent')
    })

    // Prepare response
    const response = {
      success: true,
      user_id: trackingData.user_id,
      churn_score: churnScore,
      risk_level: riskLevel,
      understanding_score: Math.round(understandingScore),
      insights: {
        churn_reason: churnReason,
        recommended_actions: actionRecommended,
        risk_factors: churnReasons,
        protective_factors: churnScore < 0.3 ? ['Regular engagement', 'Recent activity'] : []
      },
      metadata: {
        processed_at: new Date().toISOString(),
        sdk_version: '1.0.0',
        api_version: 'v1'
      }
    }

    // Trigger automated actions for high-risk users
    if (riskLevel === 'high') {
      console.log(`High-risk user detected: ${trackingData.user_id} (score: ${churnScore})`)
      
      // Log churn trigger
      await supabase.from('churn_trigger_logs').insert({
        user_id: ownerId,
        target_user_id: trackingData.user_id,
        churn_score: churnScore,
        trigger_reason: churnReason,
        action_taken: 'SDK retention modal triggered',
        success: true
      })
    }

    console.log('Successfully processed tracking data:', {
      user_id: trackingData.user_id,
      risk_level: riskLevel,
      churn_score: churnScore
    })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in sdk-track function:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      details: error.name 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
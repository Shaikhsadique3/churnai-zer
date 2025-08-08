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
  trace_id?: string
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
      const temp_trace_id = crypto.randomUUID()
      console.error(`[TRACE ERROR | trace_id: ${temp_trace_id}] API key required`)
      return new Response(JSON.stringify({ 
        error: 'API key required',
        trace_id: temp_trace_id 
      }), {
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
      const trace_id = trackingData?.trace_id || crypto.randomUUID()
      console.error(`[TRACE ERROR | trace_id: ${trace_id}] API key validation error:`, apiKeyError)
      console.log(`[TRACE ERROR | trace_id: ${trace_id}] Invalid API key provided:`, apiKey?.substring(0, 10) + '...')
      return new Response(JSON.stringify({ 
        error: 'Invalid API key',
        trace_id: trace_id 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ownerId = apiKeyData.user_id

    // Parse tracking data
    const trackingData: TrackingData = await req.json()
    
    // Extract or generate trace_id
    const trace_id = trackingData.trace_id || crypto.randomUUID()
    
    if (!trackingData.trace_id) {
      console.warn(`[TRACE WARNING | trace_id: ${trace_id}] No trace_id provided in request, auto-generated`)
    }

    // *** TRACE LOG 2: BACKEND RECEIVED PAYLOAD ***
    console.log(`[TRACE 2 | trace_id: ${trace_id}] Backend Received Payload`, {
      received_payload: trackingData,
      payload_fields: Object.keys(trackingData),
      critical_fields_present: {
        user_id: !!trackingData.user_id,
        email: !!trackingData.email,
        monthly_revenue: trackingData.metadata?.monthly_revenue,
        subscription_plan: trackingData.subscription_plan,
        usage: trackingData.usage,
        last_login: trackingData.last_login
      },
      api_key_type: apiKey?.startsWith('cg_') ? 'test' : 'production'
    })

    console.log('Received tracking data:', trackingData)

    // Handle test/mock API keys (starting with cg_)
    if (apiKey.startsWith('cg_')) {
      console.log('Test API key detected, returning mock response')
      
      const mockResponse = {
        success: true,
        user_id: trackingData.user_id,
        churn_probability: 0.89,
        churn_score: 0.89,
        risk_level: 'high',
        understanding_score: 85,
        reason: 'Low feature usage and recent billing issues',
        churn_reason: 'Low feature usage and recent billing issues', // Required field
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
          test_mode: true,
          trace_id: trace_id
        }
      }

      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate required fields for real tracking
    if (!trackingData.user_id || !trackingData.email) {
      console.error(`[TRACE ERROR | trace_id: ${trace_id}] Missing required fields: user_id=${!!trackingData.user_id}, email=${!!trackingData.email}`)
      return new Response(JSON.stringify({ 
        error: 'user_id and email are required',
        trace_id: trace_id 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[TRACE INFO | trace_id: ${trace_id}] Processing tracking data for user:`, trackingData.user_id)

    // Call AI model for churn prediction
    const churnApiKey = Deno.env.get('CHURN_API_KEY')
    let churnScore = 0.5 // Fallback score
    let churnReason = 'Fallback prediction - external AI unavailable'
    let understandingScore = 50
    let shouldTriggerEmail = false
    let recommendedTone = 'friendly'

    if (churnApiKey) {
      try {
        // Transform tracking data to match AI model requirements
        const lastLoginDate = new Date(trackingData.last_login)
        const daysSinceLogin = Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
        
        const transformedData = {
          user_id: trackingData.user_id,
          email: trackingData.email,
          support_tickets: 0, // Default for SDK tracking
          usage_score: trackingData.usage || 1,
          monthly_revenue: trackingData.metadata?.monthly_revenue || 0,
          signup_date: trackingData.metadata?.signup_date || new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(),
          last_active_date: trackingData.last_login,
          plan: trackingData.subscription_plan || 'free',
          billing_status: trackingData.metadata?.billing_status || 'active',
          email_opens_last30days: trackingData.metadata?.email_opens || 5,
          number_of_logins_last30days: Math.max(1, 30 - daysSinceLogin)
        }

        // *** TRACE LOG 3: AI MODEL INPUT PAYLOAD ***
        console.log(`[TRACE 3 | trace_id: ${trace_id}] AI Model Input Payload`, {
          ai_model_url: 'https://ai-model-rumc.onrender.com/api/v1/predict',
          input_payload: transformedData,
          field_mapping: {
            original_user_id: trackingData.user_id,
            transformed_user_id: transformedData.user_id,
            original_email: trackingData.email,
            transformed_email: transformedData.email,
            original_usage: trackingData.usage,
            transformed_usage_score: transformedData.usage_score,
            original_monthly_revenue: trackingData.metadata?.monthly_revenue,
            transformed_monthly_revenue: transformedData.monthly_revenue,
            original_plan: trackingData.subscription_plan,
            transformed_plan: transformedData.plan,
            days_since_login: daysSinceLogin,
            billing_status: transformedData.billing_status
          },
          api_key_configured: !!churnApiKey
        })

        console.log(`[TRACE INFO | trace_id: ${trace_id}] 🤖 Calling AI model with data:`, transformedData)

        const response = await fetch('https://ai-model-rumc.onrender.com/api/v1/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${churnApiKey}`,
          },
          body: JSON.stringify({
            ...transformedData,
            trace_id: trace_id
          })
        })

        if (response.ok) {
          const result = await response.json()
          
          // *** TRACE LOG 4: AI MODEL RESPONSE ***
          console.log(`[TRACE 4 | trace_id: ${trace_id}] AI Model Response`, {
            raw_ai_response: result,
            response_status: response.status,
            response_fields: Object.keys(result),
            expected_fields_present: {
              churn_probability: !!result.churn_probability,
              churn_score: !!result.churn_score,
              reason: !!result.reason,
              churn_reason: !!result.churn_reason,
              understanding_score: !!result.understanding_score,
              risk_level: !!result.risk_level,
              shouldTriggerEmail: !!result.shouldTriggerEmail,
              recommended_tone: !!result.recommended_tone
            },
            ai_api_used: true,
            fallback_triggered: false
          })
          
          churnScore = result.churn_probability || result.churn_score || 0.5
          churnReason = result.reason || result.churn_reason || 'AI-powered prediction based on user behavior'
          understandingScore = result.understanding_score || Math.max(30, Math.min(100, 85 - (churnScore * 50)))
          shouldTriggerEmail = churnScore >= 0.7
          recommendedTone = churnScore >= 0.7 ? 'empathetic' : churnScore >= 0.4 ? 'supportive' : 'friendly'
          
          console.log(`[TRACE SUCCESS | trace_id: ${trace_id}] ✅ AI prediction successful:`, { churnScore, churnReason, shouldTriggerEmail })
        } else {
          console.warn(`[FALLBACK TRIGGERED | trace_id: ${trace_id}] AI API failed with status:`, response.status)
          console.log(`[TRACE 4 | trace_id: ${trace_id}] AI Model Response`, {
            raw_ai_response: null,
            response_status: response.status,
            ai_api_used: false,
            fallback_triggered: true,
            fallback_reason: `AI API returned status ${response.status}`
          })
        }
      } catch (error) {
        console.warn(`[FALLBACK TRIGGERED | trace_id: ${trace_id}] AI API error:`, error.message)
        console.log(`[TRACE 4 | trace_id: ${trace_id}] AI Model Response`, {
          raw_ai_response: null,
          response_status: 'error',
          ai_api_used: false,
          fallback_triggered: true,
          fallback_reason: `AI API error: ${error.message}`
        })
      }
    } else {
      console.warn(`[FALLBACK TRIGGERED | trace_id: ${trace_id}] CHURN_API_KEY not configured`)
      console.log(`[TRACE 4 | trace_id: ${trace_id}] AI Model Response`, {
        raw_ai_response: null,
        response_status: 'no_api_key',
        ai_api_used: false,
        fallback_triggered: true,
        fallback_reason: 'CHURN_API_KEY not configured'
      })
    }

    // Determine risk level
    let riskLevel = 'low'
    if (churnScore >= 0.7) riskLevel = 'high'
    else if (churnScore >= 0.4) riskLevel = 'medium'

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
      usage: trackingData.usage || 1,
      last_login: trackingData.last_login,
      churn_score: churnScore,
      risk_level: riskLevel as 'low' | 'medium' | 'high',
      churn_reason: churnReason,
      action_recommended: shouldTriggerEmail ? 'Send retention email immediately' : 'Continue monitoring',
      understanding_score: Math.round(understandingScore),
      user_stage: new Date(trackingData.last_login) > new Date(Date.now() - 7*24*60*60*1000) ? 'active' : 'at_risk',
      source: 'sdk'
    }

    console.log(`[TRACE INFO | trace_id: ${trace_id}] Prepared user data for database:`, userData)

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
      console.log(`[TRACE INFO | trace_id: ${trace_id}] Updating existing user:`, existingUser.id)
      upsertResult = await supabase
        .from('user_data')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
    } else {
      console.log(`[TRACE INFO | trace_id: ${trace_id}] Inserting new user data`)
      upsertResult = await supabase
        .from('user_data')
        .insert(userData)
    }

    console.log(`[TRACE INFO | trace_id: ${trace_id}] Upsert result:`, upsertResult)

    if (upsertResult.error) {
      console.error(`[TRACE ERROR | trace_id: ${trace_id}] Database error details:`, {
        code: upsertResult.error.code,
        message: upsertResult.error.message,
        details: upsertResult.error.details,
        hint: upsertResult.error.hint
      })
      console.error(`[TRACE ERROR | trace_id: ${trace_id}] Failed userData:`, userData)
      return new Response(JSON.stringify({ 
        error: 'Failed to save user data',
        details: upsertResult.error.message,
        code: upsertResult.error.code,
        trace_id: trace_id
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

    // Prepare response with all required SDK fields
    const response = {
      success: true,
      user_id: trackingData.user_id,
      churn_score: Number(churnScore.toFixed(3)),
      churn_probability: Number(churnScore.toFixed(3)), // Add for compatibility
      risk_level: riskLevel,
      understanding_score: Math.round(understandingScore),
      reason: churnReason,
      churn_reason: churnReason, // Add for compatibility  
      message: shouldTriggerEmail ? 'High risk user - immediate attention needed' : 'User engagement is stable',
      shouldTriggerEmail: shouldTriggerEmail, // Required SDK field
      recommended_tone: recommendedTone, // Required SDK field
      insights: {
        churn_reason: churnReason,
        recommended_actions: shouldTriggerEmail ? 'Send retention email immediately' : 'Continue monitoring',
        risk_factors: churnScore >= 0.4 ? ['Elevated churn risk detected'] : [],
        protective_factors: churnScore < 0.3 ? ['Regular engagement', 'Recent activity'] : []
      },
      metadata: {
        processed_at: new Date().toISOString(),
        sdk_version: '1.0.0',
        api_version: 'v1',
        ai_prediction: churnApiKey ? true : false,
        trace_id: trace_id
      }
    }

    console.log(`[TRACE SUCCESS | trace_id: ${trace_id}] Final response prepared:`, {
      response_fields: Object.keys(response),
      required_fields_present: {
        success: !!response.success,
        churn_score: response.churn_score != null,
        churn_reason: !!response.churn_reason,
        risk_level: !!response.risk_level
      },
      response_values: {
        churn_score: response.churn_score,
        churn_reason: response.churn_reason,
        risk_level: response.risk_level
      }
    })

    // Trigger automated actions for high-risk users
    if (riskLevel === 'high') {
      console.log(`[TRACE INFO | trace_id: ${trace_id}] High-risk user detected: ${trackingData.user_id} (score: ${churnScore})`)
      
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

    console.log(`[TRACE SUCCESS | trace_id: ${trace_id}] Successfully processed tracking data:`, {
      user_id: trackingData.user_id,
      risk_level: riskLevel,
      churn_score: churnScore
    })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const trace_id = crypto.randomUUID() // Generate fallback trace_id for errors
    console.error(`[TRACE ERROR | trace_id: ${trace_id}] Error in sdk-track function:`, error)
    console.error(`[TRACE ERROR | trace_id: ${trace_id}] Error details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      details: error.name,
      trace_id: trace_id
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
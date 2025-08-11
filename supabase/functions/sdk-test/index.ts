
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-sdk-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      code: 405,
      message: 'Method not allowed' 
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Enhanced API key extraction with trimming and multiple header support
    let apiKey = req.headers.get('x-api-key')?.trim()
    if (!apiKey) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7).trim()
      }
    }

    console.log('API Key extraction:', {
      xApiKey: req.headers.get('x-api-key')?.substring(0, 10) + '...',
      authHeader: req.headers.get('authorization')?.substring(0, 20) + '...',
      extractedKey: apiKey?.substring(0, 10) + '...',
      sdkVersion: req.headers.get('x-sdk-version')
    })

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        code: 401,
        message: 'Missing or invalid API key' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (error) {
      return new Response(JSON.stringify({ 
        code: 400,
        message: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { test, website, user_id } = requestBody

    if (!website || !user_id) {
      return new Response(JSON.stringify({ 
        code: 400,
        message: 'Missing required fields: website, user_id' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Enhanced API key validation with better error logging
    console.log('Validating API key:', apiKey.substring(0, 10) + '...')
    
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active, name')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single()

    if (apiKeyError) {
      console.log('API key query error:', {
        error: apiKeyError.message,
        code: apiKeyError.code,
        details: apiKeyError.details,
        hint: apiKeyError.hint
      })
    }

    if (apiKeyError || !apiKeyData) {
      console.log('API key validation failed:', { 
        apiKey: apiKey.substring(0, 10) + '...', 
        error: apiKeyError?.message,
        found: !!apiKeyData
      })
      
      return new Response(JSON.stringify({ 
        code: 401,
        message: 'Missing or invalid API key',
        debug: {
          keyPrefix: apiKey.substring(0, 10) + '...',
          errorMessage: apiKeyError?.message || 'Key not found'
        }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate trace ID for tracking
    const traceId = crypto.randomUUID()
    
    console.log('SDK integration confirmed:', {
      website,
      user_id,
      trace_id: traceId,
      founder_id: apiKeyData.user_id,
      api_key_name: apiKeyData.name
    })

    // Log integration to sdk_integrations table
    let logError = null
    try {
      const { error: insertError } = await supabase
        .from('sdk_integrations')
        .insert({
          website,
          user_id,
          trace_id: traceId,
          api_key_hash: apiKey.substring(0, 10) + '...' // Store partial key for security
        })

      if (insertError) {
        console.error('Failed to log SDK integration:', insertError)
        logError = 'Failed to log integration attempt'
      }
    } catch (error) {
      console.error('Error logging SDK integration:', error)
      logError = 'Database logging error'
    }

    // Prepare response - always return success to not block integration
    const responseData: any = {
      status: 'ok',
      message: 'Integration confirmed',
      trace_id: traceId,
      website,
      timestamp: new Date().toISOString(),
      founder_id: apiKeyData.user_id
    }

    // Include log error if logging failed, but don't block the integration
    if (logError) {
      responseData.log_error = logError
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('SDK test error:', error)
    return new Response(JSON.stringify({ 
      code: 500,
      message: 'Internal server error',
      debug: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-sdk-version, x-trace-id',
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

    // Extract API key from x-api-key header (preferred) or Authorization header (fallback)
    let apiKey = req.headers.get('x-api-key')?.trim()
    
    // Only use Authorization header if x-api-key is not present and it's not a JWT
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

    // Get trace ID for debugging
    const traceId = req.headers.get('x-trace-id') || crypto.randomUUID()
    const sdkVersion = req.headers.get('x-sdk-version') || 'unknown'

    console.log(`[TRACE ${traceId}] SDK Test Request - Version: ${sdkVersion}`)
    console.log(`[TRACE ${traceId}] API Key provided: ${apiKey ? 'Yes (' + apiKey.substring(0, 6) + '...)' : 'No'}`)

    if (!apiKey) {
      console.log(`[TRACE ${traceId}] ERROR: Missing API key`)
      return new Response(JSON.stringify({ 
        code: 401,
        message: 'Missing or invalid API key',
        trace_id: traceId
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
      console.log(`[TRACE ${traceId}] ERROR: Invalid JSON in request body`)
      return new Response(JSON.stringify({ 
        code: 400,
        message: 'Invalid JSON in request body',
        trace_id: traceId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { test, website, user_id } = requestBody

    if (!website || !user_id) {
      console.log(`[TRACE ${traceId}] ERROR: Missing required fields`)
      return new Response(JSON.stringify({ 
        code: 400,
        message: 'Missing required fields: website, user_id',
        trace_id: traceId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate API key against api_keys table directly (no JWT decoding)
    console.log(`[TRACE ${traceId}] Validating API key against database...`)
    
    const { data: apiKeyRecord, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, name, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single()

    if (apiKeyError || !apiKeyRecord) {
      console.log(`[TRACE ${traceId}] ERROR: API key validation failed:`, {
        error: apiKeyError?.message,
        found: !!apiKeyRecord
      })
      
      return new Response(JSON.stringify({ 
        code: 401,
        message: 'Missing or invalid API key',
        trace_id: traceId,
        debug: {
          keyPrefix: apiKey.substring(0, 6) + '...',
          errorMessage: apiKeyError?.message || 'Key not found or inactive'
        }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const founderId = apiKeyRecord.user_id
    
    console.log(`[TRACE ${traceId}] API key validation successful for founder: ${founderId}`)

    // Log integration to sdk_integrations table
    let logError = null
    try {
      const { error: insertError } = await supabase
        .from('sdk_integrations')
        .insert({
          website,
          user_id,
          trace_id: traceId,
          api_key_hash: apiKey.substring(0, 6) + '...' // Store partial key for security
        })

      if (insertError) {
        console.error(`[TRACE ${traceId}] Failed to log SDK integration:`, insertError)
        logError = 'Failed to log integration attempt'
      } else {
        console.log(`[TRACE ${traceId}] Integration logged successfully`)
      }
    } catch (error) {
      console.error(`[TRACE ${traceId}] Error logging SDK integration:`, error)
      logError = 'Database logging error'
    }

    // Prepare success response
    const responseData: any = {
      status: 'ok',
      message: 'Integration confirmed',
      trace_id: traceId,
      website,
      timestamp: new Date().toISOString(),
      founder_id: founderId,
      sdk_version: sdkVersion
    }

    // Include log error if logging failed, but don't block the integration
    if (logError) {
      responseData.log_warning = logError
    }

    console.log(`[TRACE ${traceId}] SUCCESS: Integration confirmed for ${website}`)

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const traceId = req.headers.get('x-trace-id') || crypto.randomUUID()
    console.error(`[TRACE ${traceId}] SDK test error:`, error)
    
    return new Response(JSON.stringify({ 
      code: 500,
      message: 'Internal server error',
      trace_id: traceId,
      debug: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

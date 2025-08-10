
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get API key from header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'API key required in x-api-key header' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { test, website, user_id } = await req.json()

    if (!test || !website || !user_id) {
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Missing required fields: test, website, user_id' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate API key and get founder
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single()

    if (apiKeyError || !apiKeyData) {
      // Log failed integration attempt
      await supabase.from('integrations').insert({
        website,
        user_id,
        api_key: apiKey.substring(0, 10) + '...', // Partial key for security
        founder_id: '00000000-0000-0000-0000-000000000000', // Unknown founder
        status: 'fail',
        error_message: 'Invalid API key'
      })

      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Invalid API key or website' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const founderId = apiKeyData.user_id
    const traceId = crypto.randomUUID()

    // Log successful integration check
    const { error: insertError } = await supabase.from('integrations').insert({
      website,
      user_id,
      api_key: apiKey.substring(0, 10) + '...', // Partial key for security
      founder_id: founderId,
      status: 'success',
      trace_id: traceId
    })

    if (insertError) {
      console.error('Failed to log integration:', insertError)
    }

    return new Response(JSON.stringify({ 
      status: 'ok',
      trace_id: traceId,
      message: 'Integration confirmed',
      website,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('SDK test error:', error)
    return new Response(JSON.stringify({ 
      status: 'error',
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

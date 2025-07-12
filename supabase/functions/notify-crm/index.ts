import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CRMNotificationRequest {
  type: 'churn_event' | 'ping'
  user?: {
    email: string
    churn_score: number
    risk_level: string
  }
  triggered_by?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')!,
          },
        },
      }
    )

    // Get the current user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing CRM notification for user:', user.id)

    // Parse request body
    const requestBody: CRMNotificationRequest = await req.json()
    console.log('Request payload:', requestBody)

    // Fetch user's CRM integration settings
    const { data: integrationSettings, error: settingsError } = await supabase
      .from('integration_settings')
      .select('crm_webhook_url, crm_api_key')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('Error fetching integration settings:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch integration settings' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!integrationSettings?.crm_webhook_url) {
      console.error('No CRM webhook URL configured for user:', user.id)
      return new Response(
        JSON.stringify({ error: 'No CRM webhook URL configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare webhook payload
    const webhookPayload = requestBody.type === 'ping' 
      ? { type: 'ping', timestamp: new Date().toISOString() }
      : {
          type: 'churn_event',
          user: requestBody.user,
          triggered_by: requestBody.triggered_by || 'playbook',
          timestamp: new Date().toISOString()
        }

    // Prepare headers for webhook request
    const webhookHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add API key to headers if available
    if (integrationSettings.crm_api_key) {
      webhookHeaders['Authorization'] = `Bearer ${integrationSettings.crm_api_key}`
    }

    console.log('Sending webhook to:', integrationSettings.crm_webhook_url)

    // Send webhook request
    let webhookResponse: Response
    let responseStatus: number
    let responseBody: string
    let logStatus: string

    try {
      webhookResponse = await fetch(integrationSettings.crm_webhook_url, {
        method: 'POST',
        headers: webhookHeaders,
        body: JSON.stringify(webhookPayload),
      })

      responseStatus = webhookResponse.status
      responseBody = await webhookResponse.text()
      logStatus = webhookResponse.ok ? 'success' : 'failed'

      console.log('Webhook response:', {
        status: responseStatus,
        body: responseBody.substring(0, 500) // Log first 500 chars
      })

    } catch (error) {
      console.error('Webhook request failed:', error)
      responseStatus = 0
      responseBody = error.message
      logStatus = 'failed'
    }

    // Log the webhook request
    const { error: logError } = await supabase
      .from('crm_logs')
      .insert({
        user_id: user.id,
        webhook_url: integrationSettings.crm_webhook_url,
        request_payload: webhookPayload,
        response_status: responseStatus,
        response_body: responseBody,
        status: logStatus,
        is_test: requestBody.type === 'ping'
      })

    if (logError) {
      console.error('Failed to log webhook request:', logError)
    }

    // Update is_crm_connected status if this was a successful ping
    if (requestBody.type === 'ping' && logStatus === 'success') {
      const { error: updateError } = await supabase
        .from('integration_settings')
        .upsert({
          user_id: user.id,
          is_crm_connected: true
        }, {
          onConflict: 'user_id'
        })

      if (updateError) {
        console.error('Failed to update CRM connection status:', updateError)
      }
    }

    // Return response
    const success = logStatus === 'success'
    const message = requestBody.type === 'ping' 
      ? (success ? 'CRM webhook test successful!' : 'CRM webhook test failed')
      : (success ? 'CRM notification sent successfully' : 'Failed to send CRM notification')

    return new Response(
      JSON.stringify({
        success,
        message,
        webhook_status: responseStatus,
        webhook_response: responseBody.substring(0, 200) // Return first 200 chars of response
      }),
      { 
        status: success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
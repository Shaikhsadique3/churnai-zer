import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const eventData = await req.json()
    
    console.log('Retention event received:', eventData)

    // Log the retention interaction
    // This is a simplified version - in production you'd want to identify the user properly
    const logEntry = {
      event_type: 'retention_modal_interaction',
      action: eventData.action,
      risk_data: eventData.risk_data,
      timestamp: eventData.timestamp,
      page_url: eventData.page_url,
      user_agent: req.headers.get('user-agent')
    }

    console.log('Logged retention event:', logEntry)

    // In a production system, you might want to:
    // 1. Update user engagement scores
    // 2. Trigger follow-up actions based on the user's choice
    // 3. Send data to analytics platforms
    // 4. Update CRM systems

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Retention event logged successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in retention-event function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface LogRequest {
  session_id: string;
  event_type: string;
  event_data?: any;
  customer_id?: string;
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
      .select('id, name, domain')
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

    const body: LogRequest = await req.json();
    
    if (!body.session_id || !body.event_type) {
      return new Response(
        JSON.stringify({ error: 'session_id and event_type are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate event type
    const allowedEventTypes = [
      'modal_shown',
      'modal_closed',
      'offer_viewed',
      'offer_clicked',
      'cancel_completed',
      'page_view',
      'button_click',
      'form_interaction',
      'custom_event'
    ];

    if (!allowedEventTypes.includes(body.event_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid event_type',
          allowed_types: allowedEventTypes 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the event
    const { data, error: logError } = await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.session_id,
        customer_id: body.customer_id,
        event_type: body.event_type,
        event_data: body.event_data || {}
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging event:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to log event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get project settings to check if we should forward to analytics
    const { data: settings } = await supabase
      .from('cancel_guard_settings')
      .select('analytics_config')
      .eq('project_id', project.id)
      .single();

    // Forward to external analytics if configured
    if (settings?.analytics_config?.send_to_analytics) {
      try {
        // This would integrate with external analytics platforms
        console.log('Forwarding to analytics:', {
          project: project.name,
          event: body.event_type,
          session: body.session_id
        });
      } catch (analyticsError) {
        console.error('Analytics forwarding failed:', analyticsError);
        // Don't fail the request if analytics fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: data.id,
        event_type: body.event_type,
        session_id: body.session_id,
        timestamp: data.created_at,
        project: {
          id: project.id,
          name: project.name,
          domain: project.domain
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cancel-guard-log:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey + 'churnaizer_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
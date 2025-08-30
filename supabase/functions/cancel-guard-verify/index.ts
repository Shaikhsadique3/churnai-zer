import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
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
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Invalid API key' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check domain validation
    const origin = req.headers.get('origin');
    let domainValid = true;
    let allowedDomains: string[] = [];

    const { data: settings } = await supabase
      .from('cancel_guard_settings')
      .select('domain_allowlist')
      .eq('project_id', project.id)
      .single();

    if (settings?.domain_allowlist?.length > 0) {
      allowedDomains = settings.domain_allowlist;
      if (origin) {
        const domain = new URL(origin).hostname;
        domainValid = allowedDomains.includes(domain);
      } else {
        domainValid = false;
      }
    }

    // Get project statistics
    const [
      { count: offersCount },
      { count: decisionsCount },
      { count: eventsCount }
    ] = await Promise.all([
      supabase
        .from('cancel_guard_offers')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('is_active', true),
      supabase
        .from('cancel_guard_decisions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id),
      supabase
        .from('cancel_guard_events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentActivity } = await supabase
      .from('cancel_guard_events')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)
      .gte('created_at', sevenDaysAgo);

    return new Response(
      JSON.stringify({
        valid: true,
        domain_valid: domainValid,
        project: {
          id: project.id,
          name: project.name,
          domain: project.domain,
          is_active: project.is_active,
          created_at: project.created_at
        },
        security: {
          domain_allowlist_enabled: allowedDomains.length > 0,
          allowed_domains: allowedDomains,
          requesting_domain: origin ? new URL(origin).hostname : null
        },
        statistics: {
          active_offers: offersCount || 0,
          total_decisions: decisionsCount || 0,
          total_events: eventsCount || 0,
          recent_activity_7d: recentActivity || 0
        },
        endpoints: {
          decide: '/functions/v1/cancel-guard-decide',
          execute: '/functions/v1/cancel-guard-execute',
          log: '/functions/v1/cancel-guard-log',
          verify: '/functions/v1/cancel-guard-verify'
        },
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cancel-guard-verify:', error);
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: 'Internal server error' 
      }),
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
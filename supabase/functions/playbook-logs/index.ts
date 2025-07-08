import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const playbookId = url.searchParams.get('playbook_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('playbook_logs')
      .select(`
        log_id,
        playbook_id,
        action_taken,
        triggered_at,
        playbooks(name)
      `)
      .eq('user_id', user.id)
      .order('triggered_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by playbook if specified
    if (playbookId) {
      query = query.eq('playbook_id', playbookId);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching playbook logs:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch playbook logs' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('playbook_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const formattedLogs = logs?.map(log => ({
      id: log.log_id,
      playbook_id: log.playbook_id,
      playbook_name: log.playbooks?.name || 'Unknown Playbook',
      action_taken: log.action_taken,
      triggered_at: log.triggered_at,
      status: 'success' // For now, all logs are successful
    })) || [];

    return new Response(
      JSON.stringify({ 
        success: true,
        logs: formattedLogs,
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: (count || 0) > offset + limit
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in playbook-logs function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
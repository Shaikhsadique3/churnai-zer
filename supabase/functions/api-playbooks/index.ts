import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface CreatePlaybookRequest {
  title: string;
  description?: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    value: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')!,
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

    if (req.method === 'GET') {
      // GET /api/playbooks - List all playbooks for current user
      const { data: playbooks, error } = await supabase
        .from('playbooks')
        .select(`
          id,
          name,
          description,
          is_active,
          conditions,
          actions,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching playbooks:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch playbooks' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Get logs count for each playbook
      const playbooksWithStats = await Promise.all(
        (playbooks || []).map(async (playbook) => {
          const { count: logCount } = await supabase
            .from('playbook_logs')
            .select('*', { count: 'exact', head: true })
            .eq('playbook_id', playbook.id);

          const { data: lastLog } = await supabase
            .from('playbook_logs')
            .select('triggered_at')
            .eq('playbook_id', playbook.id)
            .order('triggered_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...playbook,
            stats: {
              triggers_count: logCount || 0,
              last_triggered: lastLog?.triggered_at || null
            }
          };
        })
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          playbooks: playbooksWithStats 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'POST') {
      // POST /api/playbooks - Create new playbook
      const playbook: CreatePlaybookRequest = await req.json();

      // Validate required fields
      if (!playbook.title || !playbook.conditions || !playbook.actions) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: title, conditions, actions' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Save playbook to database
      const { data, error } = await supabase
        .from('playbooks')
        .insert({
          user_id: user.id,
          name: playbook.title,
          description: playbook.description,
          conditions: playbook.conditions,
          actions: playbook.actions,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving playbook:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save playbook' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Playbook created successfully:', data.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          playbook: data,
          message: 'Playbook created successfully' 
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in api-playbooks function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
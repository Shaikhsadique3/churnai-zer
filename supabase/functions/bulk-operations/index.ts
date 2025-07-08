import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { operation, userIds, format = 'csv' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (operation) {
      case 'delete':
        // Soft delete users
        const { error: deleteError } = await supabase
          .from('user_data')
          .update({ is_deleted: true })
          .eq('owner_id', user.id)
          .in('user_id', userIds);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, deleted: userIds.length }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'export':
        // Get user data for export
        const { data: userData, error: fetchError } = await supabase
          .from('user_data')
          .select('*')
          .eq('owner_id', user.id)
          .eq('is_deleted', false)
          .in('user_id', userIds);

        if (fetchError) throw fetchError;

        let exportData: string;
        let contentType: string;

        if (format === 'json') {
          exportData = JSON.stringify(userData, null, 2);
          contentType = 'application/json';
        } else {
          // CSV format (default)
          if (userData.length === 0) {
            exportData = '';
          } else {
            const headers = Object.keys(userData[0]).join(',');
            const rows = userData.map(row => 
              Object.values(row).map(val => 
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
              ).join(',')
            );
            exportData = [headers, ...rows].join('\n');
          }
          contentType = 'text/csv';
        }

        return new Response(exportData, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="churn-data.${format}"`
          }
        });

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Bulk operation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
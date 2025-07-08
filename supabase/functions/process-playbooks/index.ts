import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PlaybookCondition {
  field: string;
  operator: string;
  value: string;
}

interface PlaybookAction {
  type: string;
  value: string;
}

interface UserData {
  user_id: string;
  owner_id: string;
  churn_score: number;
  risk_level: string;
  plan: string;
  last_login: string;
  usage: number;
  user_stage: string;
}

function evaluateConditions(userData: UserData, conditions: PlaybookCondition[]): boolean {
  return conditions.every(condition => {
    const fieldValue = userData[condition.field as keyof UserData];
    const targetValue = condition.value;
    
    switch (condition.operator) {
      case "==":
        return String(fieldValue) === targetValue;
      case ">":
        return Number(fieldValue) > Number(targetValue);
      case "<":
        return Number(fieldValue) < Number(targetValue);
      case ">=":
        return Number(fieldValue) >= Number(targetValue);
      case "<=":
        return Number(fieldValue) <= Number(targetValue);
      case "contains":
        return String(fieldValue).toLowerCase().includes(targetValue.toLowerCase());
      default:
        return false;
    }
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting playbook processing...');

    // Get all active playbooks
    const { data: playbooks, error: playbooksError } = await supabase
      .from('playbooks')
      .select('*')
      .eq('is_active', true);

    if (playbooksError) {
      console.error('Error fetching playbooks:', playbooksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch playbooks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${playbooks?.length || 0} active playbooks`);

    // Get all user data for processing
    const { data: userData, error: userDataError } = await supabase
      .from('user_data')
      .select('*')
      .eq('is_deleted', false);

    if (userDataError) {
      console.error('Error fetching user data:', userDataError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${userData?.length || 0} users`);

    let totalMatches = 0;
    let totalActionsQueued = 0;

    // Process each playbook
    for (const playbook of playbooks || []) {
      console.log(`Processing playbook: ${playbook.name}`);
      
      // Process each user against this playbook
      for (const user of userData || []) {
        // Check if user matches playbook conditions
        if (evaluateConditions(user, playbook.conditions)) {
          console.log(`User ${user.user_id} matches playbook ${playbook.name}`);
          totalMatches++;

          // Queue actions for this user
          for (let i = 0; i < playbook.actions.length; i++) {
            const action = playbook.actions[i];
            
            // Calculate execution time (immediate for most actions, delayed for wait actions)
            let executeAt = new Date();
            if (action.type === 'wait') {
              const waitDays = parseInt(action.value) || 0;
              executeAt.setDate(executeAt.getDate() + waitDays);
            }

            // Check if this action is already queued for this user
            const { data: existingAction } = await supabase
              .from('playbook_actions_queue')
              .select('id')
              .eq('user_id', playbook.user_id)
              .eq('target_user_id', user.user_id)
              .eq('playbook_id', playbook.id)
              .eq('step_index', i)
              .eq('status', 'pending')
              .single();

            if (!existingAction) {
              // Queue the action
              const { error: queueError } = await supabase
                .from('playbook_actions_queue')
                .insert({
                  user_id: playbook.user_id,
                  target_user_id: user.user_id,
                  playbook_id: playbook.id,
                  step_index: i,
                  action_type: action.type,
                  action_data: { value: action.value },
                  execute_at: executeAt.toISOString(),
                  status: 'pending'
                });

              if (queueError) {
                console.error('Error queuing action:', queueError);
              } else {
                totalActionsQueued++;
                console.log(`Queued ${action.type} action for user ${user.user_id}`);
              }
            }
          }
        }
      }
    }

    console.log(`Playbook processing complete. ${totalMatches} matches, ${totalActionsQueued} actions queued.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        matches: totalMatches,
        actions_queued: totalActionsQueued,
        message: 'Playbooks processed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-playbooks function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
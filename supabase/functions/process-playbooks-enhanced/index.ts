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

    // Parse request body for manual runs
    let requestBody: any = {};
    try {
      if (req.method === 'POST') {
        requestBody = await req.json();
      }
    } catch (e) {
      // Ignore JSON parse errors for cron calls
    }

    const isManualRun = requestBody.manual_run;
    const specificPlaybookId = requestBody.playbook_id;

    console.log('Starting enhanced playbook processing...', { isManualRun, specificPlaybookId });

    // Get playbooks from database (not localStorage)
    let playbooksQuery = supabase
      .from('playbooks')
      .select('*');
    
    if (specificPlaybookId) {
      playbooksQuery = playbooksQuery.eq('id', specificPlaybookId);
    } else {
      playbooksQuery = playbooksQuery.eq('is_active', true);
    }

    const { data: playbooks, error: playbooksError } = await playbooksQuery;

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
    let emailsSent = 0;

    // Process each playbook
    for (const playbook of playbooks || []) {
      console.log(`Processing playbook: ${playbook.name}`);
      
      // Process each user against this playbook
      for (const user of userData || []) {
        // Check if user matches playbook conditions
        if (evaluateConditions(user, playbook.conditions)) {
          console.log(`User ${user.user_id} matches playbook ${playbook.name}`);
          totalMatches++;

          // Log the match
          await supabase
            .from('playbook_logs')
            .insert({
              playbook_id: playbook.id,
              user_id: playbook.user_id,
              action_taken: `Matched conditions for user ${user.user_id}`
            });

          // Process actions for this user
          for (let i = 0; i < playbook.actions.length; i++) {
            const action = playbook.actions[i];
            
            if (action.type === 'send_email' && action.value) {
              // Send email immediately for email actions
              try {
                console.log(`Sending email for user ${user.user_id} using template ${action.value}`);
                
                const emailResponse = await supabase.functions.invoke('send-email', {
                  body: {
                    templateId: action.value,
                    targetEmail: `user-${user.user_id}@example.com`, // Replace with actual user email
                    targetUserId: user.user_id,
                    playbookId: playbook.id,
                    variables: {
                      name: user.user_id,
                      churn_score: user.churn_score?.toString() || '0',
                      risk_level: user.risk_level || 'low',
                      user_stage: user.user_stage || 'unknown',
                      plan: user.plan || 'Free'
                    }
                  },
                  headers: {
                    Authorization: `Bearer ${supabaseKey}`
                  }
                });

                if (emailResponse.error) {
                  console.error('Failed to send email:', emailResponse.error);
                } else {
                  emailsSent++;
                  console.log(`Email sent successfully for user ${user.user_id}`);
                }
              } catch (emailError) {
                console.error('Error sending email:', emailError);
              }
            } else {
              // Queue other action types
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
    }

    console.log(`Enhanced playbook processing complete. ${totalMatches} matches, ${totalActionsQueued} actions queued, ${emailsSent} emails sent.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        matches: totalMatches,
        actions_queued: totalActionsQueued,
        emails_sent: emailsSent,
        message: 'Enhanced playbooks processed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in enhanced process-playbooks function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
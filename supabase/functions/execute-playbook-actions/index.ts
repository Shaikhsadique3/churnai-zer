import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting action execution...');

    // Get all pending actions that are ready to execute
    const now = new Date().toISOString();
    const { data: pendingActions, error: actionsError } = await supabase
      .from('playbook_actions_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('execute_at', now)
      .order('execute_at', { ascending: true });

    if (actionsError) {
      console.error('Error fetching pending actions:', actionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending actions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingActions?.length || 0} pending actions to execute`);

    let executedCount = 0;
    let failedCount = 0;

    // Process each pending action
    for (const action of pendingActions || []) {
      try {
        console.log(`Executing ${action.action_type} action for user ${action.target_user_id}`);
        
        let actionResult = { success: true, message: '' };

        // Execute different action types
        switch (action.action_type) {
          case 'send_email':
            actionResult = await executeSendEmailAction(action, supabase);
            break;
          
          case 'add_tag':
            actionResult = await executeAddTagAction(action, supabase);
            break;
          
          case 'add_to_crm':
            actionResult = await executeAddToCrmAction(action, supabase);
            break;
          
          case 'wait':
            // Wait actions don't need execution, just mark as completed
            actionResult = { success: true, message: `Waited ${action.action_data.value} days` };
            break;
          
          default:
            actionResult = { success: false, message: `Unknown action type: ${action.action_type}` };
        }

        // Update action status
        const updateData = {
          status: actionResult.success ? 'completed' : 'failed',
          executed_at: new Date().toISOString(),
          error_message: actionResult.success ? null : actionResult.message
        };

        await supabase
          .from('playbook_actions_queue')
          .update(updateData)
          .eq('id', action.id);

        // Log to audit trail
        await supabase
          .from('playbook_audit_log')
          .insert({
            user_id: action.user_id,
            target_user_id: action.target_user_id,
            playbook_id: action.playbook_id,
            action_type: action.action_type,
            action_data: action.action_data,
            status: actionResult.success ? 'success' : 'failed',
            error_message: actionResult.success ? null : actionResult.message
          });

        if (actionResult.success) {
          executedCount++;
        } else {
          failedCount++;
          console.error(`Action failed: ${actionResult.message}`);
        }

      } catch (error) {
        console.error(`Error executing action ${action.id}:`, error);
        
        // Mark action as failed
        await supabase
          .from('playbook_actions_queue')
          .update({
            status: 'failed',
            executed_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('id', action.id);

        failedCount++;
      }
    }

    console.log(`Action execution complete. ${executedCount} succeeded, ${failedCount} failed.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        executed: executedCount,
        failed: failedCount,
        total: pendingActions?.length || 0,
        message: 'Actions executed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in execute-playbook-actions function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Action execution functions
async function executeSendEmailAction(action: any, supabase: any) {
  try {
    // Get user data for email personalization
    const { data: userData } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', action.target_user_id)
      .eq('owner_id', action.user_id)
      .single();

    // In a real implementation, you would:
    // 1. Get the email template by action.action_data.value
    // 2. Personalize the email with user data
    // 3. Send via your email provider (Resend, SendGrid, etc.)
    
    console.log(`Would send email template "${action.action_data.value}" to user ${action.target_user_id}`);
    
    // For now, just simulate success
    return { success: true, message: `Email "${action.action_data.value}" sent successfully` };
    
  } catch (error) {
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
}

async function executeAddTagAction(action: any, supabase: any) {
  try {
    // In a real implementation, you would add the tag to your CRM or user system
    console.log(`Would add tag "${action.action_data.value}" to user ${action.target_user_id}`);
    
    return { success: true, message: `Tag "${action.action_data.value}" added successfully` };
    
  } catch (error) {
    return { success: false, message: `Failed to add tag: ${error.message}` };
  }
}

async function executeAddToCrmAction(action: any, supabase: any) {
  try {
    // In a real implementation, you would integrate with your CRM API
    console.log(`Would add user ${action.target_user_id} to CRM with data: ${action.action_data.value}`);
    
    return { success: true, message: `User added to CRM successfully` };
    
  } catch (error) {
    return { success: false, message: `Failed to add to CRM: ${error.message}` };
  }
}
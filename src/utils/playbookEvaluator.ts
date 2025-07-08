// Local playbook evaluation utilities
export interface PlaybookTrigger {
  field: string;
  operator: string;
  value: string | number;
}

export interface PlaybookAction {
  type: string;
  template_id?: string;
  url?: string;
  payload?: Record<string, any>;
  value?: string;
}

export interface JsonPlaybook {
  title: string;
  description?: string;
  trigger: PlaybookTrigger;
  actions: PlaybookAction[];
}

export interface UserData {
  user_id: string;
  churn_score?: number;
  risk_level?: string;
  plan?: string;
  last_login?: string;
  usage?: number;
  user_stage?: string;
  days_until_mature?: number;
}

/**
 * Evaluates if a user matches the playbook trigger condition
 */
export function evaluateTrigger(user: UserData, playbook: JsonPlaybook): boolean {
  const { trigger } = playbook;
  const userValue = user[trigger.field as keyof UserData];
  const targetValue = trigger.value;

  if (userValue === undefined || userValue === null) {
    return false;
  }

  switch (trigger.operator) {
    case "==":
    case "equals":
      return String(userValue) === String(targetValue);
    case ">":
      return Number(userValue) > Number(targetValue);
    case "<":
      return Number(userValue) < Number(targetValue);
    case ">=":
      return Number(userValue) >= Number(targetValue);
    case "<=":
      return Number(userValue) <= Number(targetValue);
    case "contains":
      return String(userValue).toLowerCase().includes(String(targetValue).toLowerCase());
    default:
      return false;
  }
}

/**
 * Processes playbook actions for a matched user
 */
export async function processPlaybookActions(
  user: UserData, 
  playbook: JsonPlaybook,
  dryRun: boolean = false
): Promise<{ success: boolean; results: any[] }> {
  const results = [];

  for (const action of playbook.actions) {
    try {
      const result = await processAction(user, action, dryRun);
      results.push({
        action: action.type,
        success: true,
        result,
        dryRun
      });
    } catch (error) {
      results.push({
        action: action.type,
        success: false,
        error: error.message,
        dryRun
      });
    }
  }

  return {
    success: results.every(r => r.success),
    results
  };
}

/**
 * Processes individual action
 */
async function processAction(user: UserData, action: PlaybookAction, dryRun: boolean): Promise<any> {
  if (dryRun) {
    return { message: `Would execute ${action.type} for user ${user.user_id}`, preview: true };
  }

  switch (action.type) {
    case 'send_email':
      return await sendEmail(user, action);
    case 'webhook':
      return await sendWebhook(user, action);
    case 'add_tag':
    case 'add_to_crm':
    case 'wait':
      return { message: `${action.type} executed for user ${user.user_id}` };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Sends email action (simulated for now)
 */
async function sendEmail(user: UserData, action: PlaybookAction): Promise<any> {
  console.log(`Sending email template ${action.template_id} to user ${user.user_id}`);
  return { 
    message: `Email sent successfully`,
    template: action.template_id,
    recipient: user.user_id
  };
}

/**
 * Sends webhook action
 */
async function sendWebhook(user: UserData, action: PlaybookAction): Promise<any> {
  if (!action.url) {
    throw new Error('Webhook URL is required');
  }

  // Replace template variables in payload
  const payload = replaceTemplateVariables(action.payload || {}, user);

  console.log(`Sending webhook to ${action.url} for user ${user.user_id}`, payload);

  try {
    const response = await fetch(action.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    return {
      message: 'Webhook sent successfully',
      status: response.status,
      url: action.url
    };
  } catch (error) {
    throw new Error(`Webhook error: ${error.message}`);
  }
}

/**
 * Replaces template variables like {{user.churn_score}} with actual values
 */
function replaceTemplateVariables(payload: any, user: UserData): any {
  const payloadStr = JSON.stringify(payload);
  const replacedStr = payloadStr.replace(/\{\{user\.(\w+)\}\}/g, (match, field) => {
    const value = user[field as keyof UserData];
    return value !== undefined ? String(value) : match;
  });
  return JSON.parse(replacedStr);
}

/**
 * Converts legacy playbook format to JSON format
 */
export function convertLegacyToJson(legacyPlaybook: {
  name: string;
  description?: string;
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ type: string; value: string }>;
}): JsonPlaybook {
  // Use first condition as trigger (could be enhanced to support multiple conditions)
  const trigger = legacyPlaybook.conditions[0] || { field: '', operator: '', value: '' };
  
  const actions = legacyPlaybook.actions.map(action => {
    if (action.type === 'send_email') {
      return {
        type: action.type,
        template_id: action.value
      };
    }
    return {
      type: action.type,
      value: action.value
    };
  });

  return {
    title: legacyPlaybook.name,
    description: legacyPlaybook.description,
    trigger,
    actions
  };
}
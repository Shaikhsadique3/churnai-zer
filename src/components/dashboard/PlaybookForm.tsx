import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, TestTube, Webhook, ExternalLink } from "lucide-react";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface Action {
  id: string;
  type: string;
  value: string;
}

interface PlaybookFormProps {
  playbookName: string;
  description: string;
  webhook_enabled: boolean;
  webhook_url: string;
  webhook_trigger_conditions: {
    churn_score_threshold: number;
  };
  conditions: Condition[];
  actions: Action[];
  onPlaybookNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onWebhookEnabledChange: (enabled: boolean) => void;
  onWebhookUrlChange: (url: string) => void;
  onWebhookTriggerConditionsChange: (conditions: { churn_score_threshold: number }) => void;
  onConditionsChange: (conditions: Condition[]) => void;
  onActionsChange: (actions: Action[]) => void;
  onSave: () => void;
  onTestLogic: () => void;
}

const FIELD_OPTIONS = [
  { value: "churn_score", label: "Churn Score" },
  { value: "risk_level", label: "Risk Level" },
  { value: "plan", label: "Subscription Plan" },
  { value: "last_login", label: "Last Login (days ago)" },
  { value: "usage", label: "Usage Score" },
  { value: "user_stage", label: "User Stage" },
  { value: "days_until_mature", label: "Days Until Mature" }
];

const OPERATOR_OPTIONS = [
  { value: "==", label: "equals" },
  { value: ">", label: "greater than" },
  { value: "<", label: "less than" },
  { value: ">=", label: "greater than or equal" },
  { value: "<=", label: "less than or equal" },
  { value: "contains", label: "contains" }
];

const ACTION_OPTIONS = [
  { value: "send_email", label: "Send Email" },
  { value: "webhook", label: "Send Webhook" },
  { value: "add_tag", label: "Add Tag" },
  { value: "add_to_crm", label: "Add to CRM" },
  { value: "wait", label: "Wait (days)" }
];

const EMAIL_TEMPLATES = [
  { value: "discount_20_pro", label: "20% Discount - Pro Plan" },
  { value: "feature_guide", label: "Feature Guide & Tips" },
  { value: "retention_call", label: "Retention Call Invite" },
  { value: "win_back_offer", label: "Win-Back Special Offer" }
];

export const PlaybookForm: React.FC<PlaybookFormProps> = ({
  playbookName,
  description,
  webhook_enabled,
  webhook_url,
  webhook_trigger_conditions,
  conditions,
  actions,
  onPlaybookNameChange,
  onDescriptionChange,
  onConditionsChange,
  onActionsChange,
  onSave,
  onTestLogic,
  onWebhookEnabledChange,
  onWebhookUrlChange,
  onWebhookTriggerConditionsChange
}) => {

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: "",
      operator: "",
      value: ""
    };
    onConditionsChange([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      onConditionsChange(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    onConditionsChange(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      type: "",
      value: ""
    };
    onActionsChange([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    if (actions.length > 1) {
      onActionsChange(actions.filter(a => a.id !== id));
    }
  };

  const updateAction = (id: string, field: keyof Action, value: string) => {
    onActionsChange(actions.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  return (
    <>
      {/* Playbook Info */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Playbook Information</CardTitle>
          <CardDescription>Give your playbook a name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="playbook-name">Playbook Title *</Label>
            <Input
              id="playbook-name"
              placeholder="e.g., Rescue Pro Plan Users"
              value={playbookName}
              onChange={(e) => onPlaybookNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this playbook does..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conditions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📊 Trigger Conditions</CardTitle>
              <CardDescription>Define when this playbook should run</CardDescription>
            </div>
            <Button onClick={addCondition} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <Badge variant="outline" className="shrink-0">
                  {index === 0 ? "IF" : "AND"}
                </Badge>
                
                <Select value={condition.field} onValueChange={(value) => updateCondition(condition.id, "field", value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={condition.operator} onValueChange={(value) => updateCondition(condition.id, "operator", value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                  className="flex-1"
                />

                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(condition.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>⚡ Actions</CardTitle>
              <CardDescription>What should happen when conditions are met?</CardDescription>
            </div>
            <Button onClick={addAction} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={action.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <Badge variant="outline" className="shrink-0">
                  {index + 1}
                </Badge>
                
                <Select value={action.type} onValueChange={(value) => updateAction(action.id, "type", value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {action.type === "send_email" ? (
                  <div className="flex gap-2 flex-1">
                    <Select value={action.value} onValueChange={(value) => updateAction(action.id, "value", value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choose email template" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TEMPLATES.map(template => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Input
                    placeholder={
                      action.type === "add_tag" ? "Tag name" :
                      action.type === "wait" ? "Number of days" :
                      "Value"
                    }
                    value={action.value}
                    onChange={(e) => updateAction(action.id, "value", e.target.value)}
                    className="flex-1"
                  />
                )}


                {actions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(action.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <div>
              <CardTitle>🔗 Webhook Integration</CardTitle>
              <CardDescription>Send churn data to external tools (CRM, Slack, etc.)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="webhook-toggle">Auto-send churn insights via webhook</Label>
              <p className="text-sm text-muted-foreground">
                Automatically notify your CRM, Slack, or other tools when churn risk is detected
              </p>
            </div>
            <Switch
              id="webhook-toggle"
              checked={webhook_enabled}
              onCheckedChange={onWebhookEnabledChange}
            />
          </div>

          {webhook_enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="webhook-url">Webhook URL *</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/catch/... or your custom webhook URL"
                  value={webhook_url}
                  onChange={(e) => onWebhookUrlChange(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use Zapier, Make, or your own endpoint to receive churn data
                </p>
              </div>

              <div>
                <Label htmlFor="churn-threshold">Churn Score Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="churn-threshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={webhook_trigger_conditions.churn_score_threshold}
                    onChange={(e) => onWebhookTriggerConditionsChange({
                      churn_score_threshold: parseFloat(e.target.value) || 0.75
                    })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    Trigger webhook when churn score ≥ {webhook_trigger_conditions.churn_score_threshold}
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Example Webhook Payload
                </h4>
                <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "user_id": "user_123",
  "email": "jane@example.com",
  "customer_name": "Jane Smith",
  "churn_score": 0.84,
  "churn_reason": "Low feature usage",
  "insight": "User hasn't used key features in last 30 days",
  "risk_level": "high",
  "subscription_plan": "Pro",
  "monthly_revenue": 49.99,
  "triggered_at": "2025-07-23T12:00:00Z",
  "playbook_id": "uuid",
  "playbook_name": "Rescue Pro Plan Users"
}`}
                </pre>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Popular integrations:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Zapier → Send to Slack, Gmail, HubSpot, Salesforce, etc.</li>
                  <li>Make.com → Connect to 1000+ apps and services</li>
                  <li>Your custom API → Update your CRM or notification system</li>
                  <li>Notion → Add churn alerts to your database</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={onSave} className="flex-1 sm:flex-initial">
          <Save className="h-4 w-4 mr-2" />
          Save Playbook
        </Button>
        <Button onClick={onTestLogic} variant="outline">
          <TestTube className="h-4 w-4 mr-2" />
          Test Logic
        </Button>
      </div>
    </>
  );
};
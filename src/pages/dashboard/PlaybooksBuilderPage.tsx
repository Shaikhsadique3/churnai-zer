import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, TestTube, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

export const PlaybooksBuilderPage = () => {
  const { toast } = useToast();
  const [playbookName, setPlaybookName] = useState("");
  const [description, setDescription] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([
    { id: "1", field: "", operator: "", value: "" }
  ]);
  const [actions, setActions] = useState<Action[]>([
    { id: "1", type: "", value: "" }
  ]);

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: "",
      operator: "",
      value: ""
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      type: "",
      value: ""
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    if (actions.length > 1) {
      setActions(actions.filter(a => a.id !== id));
    }
  };

  const updateAction = (id: string, field: keyof Action, value: string) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleSave = async () => {
    if (!playbookName) {
      toast({
        title: "Error",
        description: "Please enter a playbook name",
        variant: "destructive",
      });
      return;
    }

    const validConditions = conditions.filter(c => c.field && c.operator && c.value);
    const validActions = actions.filter(a => a.type && a.value);

    if (validConditions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid condition",
        variant: "destructive",
      });
      return;
    }

    if (validActions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid action",
        variant: "destructive",
      });
      return;
    }

    const playbook = {
      name: playbookName,
      description,
      conditions: validConditions.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value
      })),
      actions: validActions.map(a => ({
        type: a.type,
        value: a.value
      }))
    };

    console.log("Saving playbook:", playbook);

    // TODO: Implement API call to save playbook
    // await supabase.functions.invoke('save-playbook', { body: playbook });

    toast({
      title: "Success!",
      description: "Playbook saved successfully",
    });
  };

  const handleTestLogic = () => {
    toast({
      title: "Test Logic",
      description: "Testing playbook logic... (Feature coming soon)",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/dashboard/automations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Automations
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-foreground">🔧 Playbook Builder</h1>
        <p className="text-muted-foreground">Create automated rules to save at-risk customers</p>
      </div>

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
              onChange={(e) => setPlaybookName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this playbook does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="flex-1 sm:flex-initial">
          <Save className="h-4 w-4 mr-2" />
          Save Playbook
        </Button>
        <Button onClick={handleTestLogic} variant="outline">
          <TestTube className="h-4 w-4 mr-2" />
          Test Logic
        </Button>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, TestTube, Eye, Code, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonPlaybook, PlaybookAction, evaluateTrigger, processPlaybookActions, UserData } from "@/utils/playbookEvaluator";
import { useToast } from "@/hooks/use-toast";

interface JsonPlaybookBuilderProps {
  onSave: (playbook: JsonPlaybook) => void;
  testUsers?: UserData[];
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
  { value: "warn_user_template", label: "High-Risk Warning" },
  { value: "discount_20_pro", label: "20% Discount - Pro Plan" },
  { value: "feature_guide", label: "Feature Guide & Tips" },
  { value: "retention_call", label: "Retention Call Invite" },
  { value: "win_back_offer", label: "Win-Back Special Offer" }
];

export const JsonPlaybookBuilder: React.FC<JsonPlaybookBuilderProps> = ({ onSave, testUsers = [] }) => {
  const { toast } = useToast();
  const [playbook, setPlaybook] = useState<JsonPlaybook>({
    title: "",
    description: "",
    trigger: { field: "", operator: "", value: "" },
    actions: [{ type: "", template_id: "" }]
  });

  const [testResults, setTestResults] = useState<any[]>([]);
  const [jsonView, setJsonView] = useState("");

  React.useEffect(() => {
    setJsonView(JSON.stringify(playbook, null, 2));
  }, [playbook]);

  const updatePlaybook = (updates: Partial<JsonPlaybook>) => {
    setPlaybook(prev => ({ ...prev, ...updates }));
  };

  const updateTrigger = (field: string, value: any) => {
    setPlaybook(prev => ({
      ...prev,
      trigger: { ...prev.trigger, [field]: value }
    }));
  };

  const addAction = () => {
    setPlaybook(prev => ({
      ...prev,
      actions: [...prev.actions, { type: "", template_id: "" }]
    }));
  };

  const removeAction = (index: number) => {
    if (playbook.actions.length > 1) {
      setPlaybook(prev => ({
        ...prev,
        actions: prev.actions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateAction = (index: number, updates: Partial<PlaybookAction>) => {
    setPlaybook(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      )
    }));
  };

  const testPlaybook = async () => {
    if (!playbook.title || !playbook.trigger.field) {
      toast({
        title: "Invalid Playbook",
        description: "Please fill in title and trigger condition",
        variant: "destructive"
      });
      return;
    }

    const results = [];
    
    for (const user of testUsers) {
      const matches = evaluateTrigger(user, playbook);
      if (matches) {
        const actionResults = await processPlaybookActions(user, playbook, true);
        results.push({
          user: user.user_id,
          matches: true,
          actions: actionResults.results
        });
      } else {
        results.push({
          user: user.user_id,
          matches: false,
          reason: `User doesn't match trigger: ${playbook.trigger.field} ${playbook.trigger.operator} ${playbook.trigger.value}`
        });
      }
    }

    setTestResults(results);
    toast({
      title: "Test Complete",
      description: `Tested against ${testUsers.length} users. ${results.filter(r => r.matches).length} matches found.`
    });
  };

  const handleSave = () => {
    if (!playbook.title || !playbook.trigger.field) {
      toast({
        title: "Invalid Playbook",
        description: "Please fill in title and trigger condition",
        variant: "destructive"
      });
      return;
    }

    onSave(playbook);
  };

  const parseJsonView = () => {
    try {
      const parsed = JSON.parse(jsonView);
      setPlaybook(parsed);
      toast({
        title: "JSON Imported",
        description: "Playbook updated from JSON"
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Visual Builder</TabsTrigger>
          <TabsTrigger value="json">JSON Editor</TabsTrigger>
          <TabsTrigger value="test">Test & Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Playbook Info */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Playbook Information</CardTitle>
              <CardDescription>Configure your playbook details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., High-Risk Churn Alert"
                  value={playbook.title}
                  onChange={(e) => updatePlaybook({ title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this playbook does..."
                  value={playbook.description}
                  onChange={(e) => updatePlaybook({ description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trigger Condition */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Trigger Condition</CardTitle>
              <CardDescription>Define when this playbook should run</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Badge variant="outline">IF</Badge>
                
                <Select value={playbook.trigger.field} onValueChange={(value) => updateTrigger("field", value)}>
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

                <Select value={playbook.trigger.operator} onValueChange={(value) => updateTrigger("operator", value)}>
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
                  value={playbook.trigger.value}
                  onChange={(e) => updateTrigger("value", e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
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
                {playbook.actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Badge variant="outline" className="shrink-0 mt-1">
                      {index + 1}
                    </Badge>
                    
                    <div className="flex-1 space-y-3">
                      <Select value={action.type} onValueChange={(value) => updateAction(index, { type: value })}>
                        <SelectTrigger>
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

                      {action.type === "send_email" && (
                        <Select value={action.template_id} onValueChange={(value) => updateAction(index, { template_id: value })}>
                          <SelectTrigger>
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
                      )}

                      {action.type === "webhook" && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Webhook URL (e.g., https://hook.make.com/xyz123)"
                            value={action.url || ""}
                            onChange={(e) => updateAction(index, { url: e.target.value })}
                          />
                          <Textarea
                            placeholder='Payload (JSON): {"user_id": "{{user.user_id}}", "churn_score": "{{user.churn_score}}"}'
                            value={action.payload ? JSON.stringify(action.payload, null, 2) : ""}
                            onChange={(e) => {
                              try {
                                const payload = e.target.value ? JSON.parse(e.target.value) : undefined;
                                updateAction(index, { payload });
                              } catch {}
                            }}
                            rows={3}
                          />
                        </div>
                      )}

                      {!["send_email", "webhook"].includes(action.type) && action.type && (
                        <Input
                          placeholder={
                            action.type === "add_tag" ? "Tag name" :
                            action.type === "wait" ? "Number of days" :
                            "Value"
                          }
                          value={action.value || ""}
                          onChange={(e) => updateAction(index, { value: e.target.value })}
                        />
                      )}
                    </div>

                    {playbook.actions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                        className="text-destructive hover:text-destructive mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Editor</CardTitle>
              <CardDescription>Edit your playbook in JSON format</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jsonView}
                onChange={(e) => setJsonView(e.target.value)}
                rows={20}
                className="font-mono"
                placeholder="Edit JSON here..."
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={parseJsonView} variant="outline">
                  <Code className="h-4 w-4 mr-2" />
                  Import JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test & Preview</CardTitle>
              <CardDescription>Test your playbook against sample users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testPlaybook} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Test Playbook ({testUsers.length} users)
                </Button>

                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Test Results:</h4>
                    {testResults.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">User: {result.user}</span>
                          <Badge variant={result.matches ? "default" : "secondary"}>
                            {result.matches ? "Match" : "No Match"}
                          </Badge>
                        </div>
                        {result.matches ? (
                          <div className="text-sm space-y-1">
                            {result.actions.map((action: any, actionIndex: number) => (
                              <div key={actionIndex} className="text-muted-foreground">
                                ✓ {action.action}: {action.result.message}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">{result.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="flex-1 sm:flex-initial">
          <Save className="h-4 w-4 mr-2" />
          Save Playbook
        </Button>
        <Button onClick={testPlaybook} variant="outline" disabled={testUsers.length === 0}>
          <TestTube className="h-4 w-4 mr-2" />
          Test Logic
        </Button>
      </div>
    </div>
  );
};
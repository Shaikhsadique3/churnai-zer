import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlaybookForm } from "@/components/dashboard/PlaybookForm";
import { JsonPlaybookBuilder } from "@/components/dashboard/JsonPlaybookBuilder";
import { AutomationBanner } from "@/components/dashboard/AutomationBanner";
import { EnhancedPlaybooksList } from "@/components/dashboard/EnhancedPlaybooksList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonPlaybook, convertLegacyToJson, UserData } from "@/utils/playbookEvaluator";

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

interface Playbook {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  conditions: any[];
  actions: any[];
  created_at: string;
  stats: {
    triggers_count: number;
    last_triggered: string | null;
  };
}

export const PlaybooksBuilderPage = () => {
  const { toast } = useToast();
  const [playbookName, setPlaybookName] = useState("");
  const [description, setDescription] = useState("");
  const [savedPlaybooks, setSavedPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([
    { id: "1", field: "", operator: "", value: "" }
  ]);
  const [actions, setActions] = useState<Action[]>([
    { id: "1", type: "", value: "" }
  ]);
  const [testUsers, setTestUsers] = useState<UserData[]>([]);

  // Load saved playbooks and test users on component mount
  useEffect(() => {
    loadPlaybooks();
    loadTestUsers();
  }, []);

  const loadTestUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_data')
        .select('user_id, churn_score, risk_level, plan, usage, user_stage, days_until_mature')
        .eq('owner_id', session.user.id)
        .limit(10);

      if (!error && data) {
        setTestUsers(data.map(user => ({
          user_id: user.user_id,
          churn_score: user.churn_score || 0,
          risk_level: user.risk_level || 'low',
          plan: user.plan || 'Free',
          usage: user.usage || 0,
          user_stage: user.user_stage || 'unknown',
          days_until_mature: user.days_until_mature || 0
        })));
      }
    } catch (error) {
      console.error('Error loading test users:', error);
    }
  };

  const loadPlaybooks = async () => {
    try {
      setIsLoading(true);
      
      // Load playbooks from localStorage
      const savedPlaybooksData = localStorage.getItem('saved_playbooks');
      if (savedPlaybooksData) {
        const playbooks = JSON.parse(savedPlaybooksData);
        setSavedPlaybooks(playbooks);
      } else {
        setSavedPlaybooks([]);
      }
    } catch (error) {
      console.error('Error loading playbooks:', error);
      toast({
        title: "Error",
        description: "Failed to load playbooks from local storage.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlaybookStatus = async (playbookId: string, newStatus: boolean) => {
    try {
      const existingPlaybooks = JSON.parse(localStorage.getItem('saved_playbooks') || '[]');
      const updatedPlaybooks = existingPlaybooks.map((playbook: any) => 
        playbook.id === playbookId ? { ...playbook, is_active: newStatus } : playbook
      );
      localStorage.setItem('saved_playbooks', JSON.stringify(updatedPlaybooks));

      // Reload playbooks to reflect changes
      loadPlaybooks();
      
      toast({
        title: "Success",
        description: `Playbook ${newStatus ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      console.error('Error updating playbook status:', error);
    }
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

    try {
      // Save playbook to localStorage
      const newPlaybook = {
        id: Date.now().toString(),
        name: playbook.name,
        description: playbook.description,
        conditions: playbook.conditions,
        actions: playbook.actions,
        is_active: true,
        created_at: new Date().toISOString(),
        stats: {
          triggers_count: 0,
          last_triggered: null
        }
      };

      const existingPlaybooks = JSON.parse(localStorage.getItem('saved_playbooks') || '[]');
      const updatedPlaybooks = [...existingPlaybooks, newPlaybook];
      localStorage.setItem('saved_playbooks', JSON.stringify(updatedPlaybooks));

      console.log('Playbook saved locally:', newPlaybook);
      
      toast({
        title: "Success!",
        description: "Playbook saved successfully",
      });

      // Reset form and reload playbooks
      setPlaybookName("");
      setDescription("");
      setConditions([{ id: "1", field: "", operator: "", value: "" }]);
      setActions([{ id: "1", type: "", value: "" }]);
      
      // Reload playbooks to show the new one
      loadPlaybooks();
      
    } catch (error) {
      console.error('Error saving playbook:', error);
      toast({
        title: "Error",
        description: "Failed to save playbook. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJsonSave = async (jsonPlaybook: JsonPlaybook) => {
    try {
      // Convert JsonPlaybook to local storage format
      const newPlaybook = {
        id: Date.now().toString(),
        name: jsonPlaybook.title,
        description: jsonPlaybook.description,
        conditions: [jsonPlaybook.trigger],
        actions: jsonPlaybook.actions.map(action => ({
          type: action.type,
          value: action.template_id || action.url || action.value || JSON.stringify(action.payload || {})
        })),
        is_active: true,
        created_at: new Date().toISOString(),
        stats: {
          triggers_count: 0,
          last_triggered: null
        }
      };

      const existingPlaybooks = JSON.parse(localStorage.getItem('saved_playbooks') || '[]');
      const updatedPlaybooks = [...existingPlaybooks, newPlaybook];
      localStorage.setItem('saved_playbooks', JSON.stringify(updatedPlaybooks));

      toast({
        title: "Success!",
        description: "JSON Playbook saved successfully",
      });

      loadPlaybooks();
    } catch (error) {
      console.error('Error saving JSON playbook:', error);
      toast({
        title: "Error",
        description: "Failed to save playbook. Please try again.",
        variant: "destructive",
      });
    }
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

      {/* Playbook Builder Tabs */}
      <Tabs defaultValue="legacy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="legacy">Legacy Builder</TabsTrigger>
          <TabsTrigger value="json">JSON Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="legacy">
          <PlaybookForm
            playbookName={playbookName}
            description={description}
            conditions={conditions}
            actions={actions}
            onPlaybookNameChange={setPlaybookName}
            onDescriptionChange={setDescription}
            onConditionsChange={setConditions}
            onActionsChange={setActions}
            onSave={handleSave}
            onTestLogic={handleTestLogic}
          />
        </TabsContent>

        <TabsContent value="json">
          <JsonPlaybookBuilder
            onSave={handleJsonSave}
            testUsers={testUsers}
          />
        </TabsContent>
      </Tabs>

      {/* Automation Status Banner */}
      <AutomationBanner />

      {/* Enhanced Playbooks List */}
      <EnhancedPlaybooksList
        playbooks={savedPlaybooks}
        isLoading={isLoading}
        onToggleStatus={togglePlaybookStatus}
        onReload={loadPlaybooks}
      />
    </div>
  );
};
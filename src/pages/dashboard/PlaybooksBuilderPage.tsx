import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlaybookForm } from "@/components/dashboard/PlaybookForm";
import { AutomationBanner } from "@/components/dashboard/AutomationBanner";
import { SavedPlaybooksList } from "@/components/dashboard/SavedPlaybooksList";

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

  // Load saved playbooks on component mount
  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('api-playbooks');
      
      if (error) {
        console.error('Error loading playbooks:', error);
        return;
      }

      if (data?.success) {
        setSavedPlaybooks(data.playbooks || []);
      }
    } catch (error) {
      console.error('Error loading playbooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlaybookStatus = async (playbookId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('playbooks')
        .update({ is_active: newStatus })
        .eq('id', playbookId);

      if (error) {
        console.error('Error updating playbook status:', error);
        toast({
          title: "Error",
          description: "Failed to update playbook status",
          variant: "destructive",
        });
        return;
      }

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
      // Save playbook via Supabase function
      const { data, error } = await supabase.functions.invoke('save-playbook', { 
        body: playbook 
      });

      if (error) {
        console.error('Error saving playbook:', error);
        toast({
          title: "Error",
          description: "Failed to save playbook. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Playbook saved:', data);
      
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

      {/* Playbook Form */}
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

      {/* Automation Status Banner */}
      <AutomationBanner />

      {/* Saved Playbooks */}
      <SavedPlaybooksList
        playbooks={savedPlaybooks}
        isLoading={isLoading}
        onToggleStatus={togglePlaybookStatus}
      />
    </div>
  );
};
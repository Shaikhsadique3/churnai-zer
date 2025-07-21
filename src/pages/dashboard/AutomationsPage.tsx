import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { EnhancedPlaybooksList } from "@/components/dashboard/EnhancedPlaybooksList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const AutomationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaybooks = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('playbooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add stats to each playbook
      const playbooksWithStats = data?.map(playbook => ({
        ...playbook,
        stats: {
          triggers_count: 0,
          last_triggered: null
        }
      })) || [];
      
      setPlaybooks(playbooksWithStats);
    } catch (error: any) {
      console.error('Error fetching playbooks:', error);
      toast({
        title: "Error",
        description: "Failed to load playbooks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (playbookId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('playbooks')
        .update({ is_active: newStatus })
        .eq('id', playbookId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Playbook ${newStatus ? 'activated' : 'deactivated'}`,
      });
      
      await fetchPlaybooks();
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to update playbook status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPlaybooks();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">🤖 Smart Retention Playbooks</h1>
            <p className="text-muted-foreground">Automate customer retention with intelligent playbooks triggered by churn predictions</p>
          </div>
          <Link to="/dashboard/automations/playbooks-builder">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Playbook
            </Button>
          </Link>
        </div>
      </div>

      {/* Production-Ready Playbook Management */}
      <EnhancedPlaybooksList 
        playbooks={playbooks}
        isLoading={isLoading}
        onToggleStatus={handleToggleStatus}
        onReload={fetchPlaybooks}
      />
    </div>
  );
};
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Play, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutoTriggerSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  churn_threshold: number;
  target_playbook: string;
  last_run: string | null;
  total_triggered: number;
}

interface HighRiskUser {
  id: string;
  user_id: string;
  churn_score: number;
  risk_level: string;
  last_login: string | null;
}

export const AutomatedPlaybookTrigger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRunningTrigger, setIsRunningTrigger] = useState(false);

  // Fetch auto-trigger settings
  const { data: triggerSettings } = useQuery({
    queryKey: ['auto-trigger-settings', user?.id],
    queryFn: async (): Promise<AutoTriggerSettings | null> => {
      // This would be stored in a settings table, but for now we'll use a default
      return {
        id: 'default',
        user_id: user?.id || '',
        is_enabled: true,
        churn_threshold: 0.7,
        target_playbook: 'Winback Sequence',
        last_run: null,
        total_triggered: 0,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch high-risk users that need intervention
  const { data: highRiskUsers, isLoading } = useQuery({
    queryKey: ['high-risk-users', user?.id],
    queryFn: async (): Promise<HighRiskUser[]> => {
      const { data, error } = await supabase
        .from('user_data')
        .select('id, user_id, churn_score, risk_level, last_login')
        .eq('owner_id', user?.id)
        .gte('churn_score', 0.7)
        .not('is_deleted', 'eq', true)
        .order('churn_score', { ascending: false });

      if (error) throw error;
      return data as HighRiskUser[];
    },
    enabled: !!user?.id,
  });

  // Manual trigger mutation
  const triggerPlaybookMutation = useMutation({
    mutationFn: async (targetUsers: HighRiskUser[]) => {
      // In a real implementation, this would:
      // 1. Create playbook action entries in playbook_actions_queue
      // 2. Log the trigger event
      // 3. Send emails via the send-email function

      const results = [];
      
      for (const targetUser of targetUsers) {
        // Log the playbook trigger
        const { error: logError } = await supabase
          .from('playbook_logs')
          .insert({
            user_id: user?.id,
            action_taken: `Auto-triggered Winback Sequence for user ${targetUser.user_id} (churn score: ${Math.round((targetUser.churn_score || 0) * 100)}%)`,
          });

        if (logError) {
          console.error('Error logging playbook trigger:', logError);
        }

        // Queue the playbook action
        const { error: queueError } = await supabase
          .from('playbook_actions_queue')
          .insert({
            user_id: user?.id,
            target_user_id: targetUser.user_id,
            action_type: 'send_email',
            action_data: {
              template: 'winback',
              subject: 'We miss you! Come back and save 20%',
              churn_score: targetUser.churn_score,
            },
          });

        if (queueError) {
          console.error('Error queuing playbook action:', queueError);
          results.push({ user: targetUser.user_id, success: false, error: queueError.message });
        } else {
          results.push({ user: targetUser.user_id, success: true });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      toast({
        title: "Playbook Triggered",
        description: `Successfully triggered for ${successCount} users${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['high-risk-users'] });
      queryClient.invalidateQueries({ queryKey: ['risk-summary'] });
    },
    onError: (error) => {
      toast({
        title: "Trigger Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualTrigger = async () => {
    if (!highRiskUsers || highRiskUsers.length === 0) {
      toast({
        title: "No Users to Target",
        description: "No high-risk users found for intervention",
      });
      return;
    }

    setIsRunningTrigger(true);
    try {
      await triggerPlaybookMutation.mutateAsync(highRiskUsers);
    } finally {
      setIsRunningTrigger(false);
    }
  };

  const eligibleUsers = highRiskUsers?.filter(user => (user.churn_score || 0) >= 0.7) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Automated Playbook Trigger
        </CardTitle>
        <CardDescription>
          Automatically trigger intervention playbooks for high-risk users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Auto-Trigger</p>
              <p className="text-xs text-muted-foreground">Enabled for churn ≥ 70%</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={triggerSettings?.is_enabled} disabled />
              {triggerSettings?.is_enabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Target Playbook</p>
              <p className="text-xs text-muted-foreground">
                {triggerSettings?.target_playbook || 'Winback Sequence'}
              </p>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Eligible Users</p>
              <p className="text-xs text-muted-foreground">Ready for intervention</p>
            </div>
            <Badge variant={eligibleUsers.length > 0 ? "destructive" : "default"}>
              {eligibleUsers.length}
            </Badge>
          </div>
        </div>

        {/* Current Status */}
        {eligibleUsers.length > 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{eligibleUsers.length} high-risk users</strong> (churn score ≥ 70%) are eligible for automated intervention.
              The Winback Sequence playbook will be triggered for these users.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No users currently meet the high-risk criteria for automated playbook triggers.
            </AlertDescription>
          </Alert>
        )}

        {/* Eligible Users List */}
        {eligibleUsers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Eligible Users for Intervention:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {eligibleUsers.map((riskUser) => (
                <div key={riskUser.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{riskUser.user_id}</p>
                    <p className="text-xs text-muted-foreground">
                      Last login: {riskUser.last_login ? new Date(riskUser.last_login).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {Math.round((riskUser.churn_score || 0) * 100)}% risk
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Trigger */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm font-medium">Manual Trigger</p>
            <p className="text-xs text-muted-foreground">
              Immediately run playbook for all eligible users
            </p>
          </div>
          <Button
            onClick={handleManualTrigger}
            disabled={eligibleUsers.length === 0 || isRunningTrigger}
            size="sm"
          >
            {isRunningTrigger ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Trigger Now ({eligibleUsers.length})
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
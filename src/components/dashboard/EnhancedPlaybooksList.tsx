import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, FileText, AlertCircle, CheckCircle, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlaybookLog {
  id: string;
  playbook_id: string;
  playbook_name: string;
  action_taken: string;
  triggered_at: string;
  status: string;
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

interface EnhancedPlaybooksListProps {
  playbooks: Playbook[];
  isLoading: boolean;
  onToggleStatus: (playbookId: string, newStatus: boolean) => void;
  onReload: () => void;
}

export const EnhancedPlaybooksList: React.FC<EnhancedPlaybooksListProps> = ({
  playbooks,
  isLoading,
  onToggleStatus,
  onReload
}) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<PlaybookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [runningPlaybooks, setRunningPlaybooks] = useState<Set<string>>(new Set());

  const loadLogs = async (playbookId?: string) => {
    try {
      setLoadingLogs(true);
      
      // Get current session for auth header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view logs",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('playbook-logs', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error loading logs:', error);
        return;
      }

      if (data?.success) {
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const runPlaybookNow = async (playbookId: string) => {
    try {
      setRunningPlaybooks(prev => new Set([...prev, playbookId]));
      
      // Get current session for auth header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to run playbooks",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('run-playbook', {
        body: { playbook_id: playbookId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error running playbook:', error);
        toast({
          title: "Error",
          description: "Failed to run playbook",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: `Playbook executed successfully. ${data?.results?.matches || 0} users matched.`,
      });

      // Reload playbooks and logs
      onReload();
      loadLogs();
      
    } catch (error) {
      console.error('Error running playbook:', error);
      toast({
        title: "Error",
        description: "Failed to run playbook",
        variant: "destructive",
      });
    } finally {
      setRunningPlaybooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(playbookId);
        return newSet;
      });
    }
  };

  const clonePlaybook = async (playbook: Playbook) => {
    try {
      // Get current session for auth header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to clone playbooks",
          variant: "destructive",
        });
        return;
      }

      const clonedPlaybook = {
        name: `${playbook.name} (Copy)`,
        description: playbook.description,
        conditions: playbook.conditions,
        actions: playbook.actions
      };

      const { data, error } = await supabase.functions.invoke('api-playbooks', {
        body: clonedPlaybook,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error cloning playbook:', error);
        toast({
          title: "Error",
          description: "Failed to clone playbook",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Playbook cloned successfully",
      });

      onReload();
    } catch (error) {
      console.error('Error cloning playbook:', error);
      toast({
        title: "Error",
        description: "Failed to clone playbook", 
        variant: "destructive",
      });
    }
  };

  const deletePlaybook = async (playbookId: string) => {
    try {
      const { error } = await supabase
        .from('playbooks')
        .delete()
        .eq('id', playbookId);

      if (error) {
        console.error('Error deleting playbook:', error);
        toast({
          title: "Error",
          description: "Failed to delete playbook",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Playbook deleted successfully",
      });

      onReload();
    } catch (error) {
      console.error('Error deleting playbook:', error);
    }
  };

  const getNextRunTime = () => {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(nextRun.getHours() + 6 - (nextRun.getHours() % 6), 0, 0, 0);
    return nextRun.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading playbooks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (playbooks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📚 Saved Playbooks</CardTitle>
          <CardDescription>Manage your automation rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No playbooks created yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first playbook above to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Playbooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📚 Saved Playbooks</CardTitle>
              <CardDescription>
                Manage your automation rules • Next run: {getNextRunTime()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {playbooks.map((playbook) => (
              <div key={playbook.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{playbook.name}</h3>
                      <Badge variant={playbook.is_active ? "default" : "secondary"}>
                        {playbook.is_active ? "ACTIVE" : "PAUSED"}
                      </Badge>
                    </div>
                    
                    {playbook.description && (
                      <p className="text-sm text-muted-foreground mb-3">{playbook.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Conditions:</span> {playbook.conditions.length}
                      </div>
                      <div>
                        <span className="font-medium">Actions:</span> {playbook.actions.length}
                      </div>
                      <div>
                        <span className="font-medium">Triggered:</span> {playbook.stats.triggers_count} times
                      </div>
                      <div>
                        <span className="font-medium">Last run:</span>{' '}
                        {playbook.stats.last_triggered 
                          ? new Date(playbook.stats.last_triggered).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runPlaybookNow(playbook.id)}
                      disabled={runningPlaybooks.has(playbook.id)}
                    >
                      {runningPlaybooks.has(playbook.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Run Now
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(playbook.id, !playbook.is_active)}
                    >
                      {playbook.is_active ? "Pause" : "Activate"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clonePlaybook(playbook)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePlaybook(playbook.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlaybook(selectedPlaybook === playbook.id ? null : playbook.id);
                        if (selectedPlaybook !== playbook.id) {
                          loadLogs(playbook.id);
                        }
                      }}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Logs
                    </Button>
                  </div>
                </div>

                {/* Logs Section */}
                {selectedPlaybook === playbook.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" />
                      <h4 className="font-medium">Execution Logs</h4>
                    </div>
                    
                    {loadingLogs ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                        Loading logs...
                      </div>
                    ) : logs.filter(log => log.playbook_id === playbook.id).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No execution logs yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {logs
                          .filter(log => log.playbook_id === playbook.id)
                          .map((log) => (
                            <div key={log.id} className="flex items-center gap-3 p-2 bg-muted rounded text-sm">
                              {log.status === 'success' ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-red-600" />
                              )}
                              <span className="flex-1">{log.action_taken}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.triggered_at).toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Recent Activity</CardTitle>
          <CardDescription>All playbook executions across your automation rules</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
              Loading activity...
            </div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No activity yet. Run a playbook to see logs here.</p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{log.playbook_name}</p>
                    <p className="text-sm text-muted-foreground">{log.action_taken}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(log.triggered_at).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, Play } from "lucide-react";

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

interface SavedPlaybooksListProps {
  playbooks: Playbook[];
  isLoading: boolean;
  onToggleStatus: (playbookId: string, newStatus: boolean) => void;
}

export const SavedPlaybooksList: React.FC<SavedPlaybooksListProps> = ({
  playbooks,
  isLoading,
  onToggleStatus
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>📚 Saved Playbooks</CardTitle>
            <CardDescription>Manage your automation rules</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading playbooks...</p>
          </div>
        ) : playbooks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No playbooks created yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first playbook above to get started.</p>
          </div>
        ) : (
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
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
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
                      onClick={() => onToggleStatus(playbook.id, !playbook.is_active)}
                    >
                      {playbook.is_active ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
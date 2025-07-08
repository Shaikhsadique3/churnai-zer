import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workflow, Mail, Zap, Plus, Settings, Play, Pause } from "lucide-react";

const mockPlaybooks = [
  {
    id: 1,
    name: "High-Risk User Intervention",
    description: "Automatically send retention emails to users with churn score > 70%",
    status: "active",
    trigger: "Churn Score > 70%",
    actions: ["Send Email", "Notify Sales Team"],
    lastRun: "2 hours ago",
    triggered: 12
  },
  {
    id: 2,
    name: "New User Onboarding",
    description: "Welcome sequence for users in their first 7 days",
    status: "paused", 
    trigger: "Days Since Signup < 7",
    actions: ["Send Welcome Email", "Schedule Follow-up"],
    lastRun: "1 day ago",
    triggered: 8
  },
  {
    id: 3,
    name: "Feature Adoption Push",
    description: "Encourage low-usage customers to explore key features",
    status: "draft",
    trigger: "Usage Score < 30%",
    actions: ["Send Feature Guide", "Create Support Ticket"],
    lastRun: "Never",
    triggered: 0
  }
];

export const AutomationsPage = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">🔁 Automations</h1>
            <p className="text-muted-foreground">Set up automated playbooks to reduce churn</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Playbook
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Playbooks</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Reached</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">Engagement rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Prevented</CardTitle>
            <Badge className="h-4 w-fit text-xs">Est.</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Customers retained</p>
          </CardContent>
        </Card>
      </div>

      {/* Playbooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Playbooks</CardTitle>
          <CardDescription>Automated workflows to engage at-risk customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlaybooks.map((playbook) => (
              <div key={playbook.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{playbook.name}</h3>
                    <Badge variant={getStatusColor(playbook.status)} className="flex items-center gap-1">
                      {getStatusIcon(playbook.status)}
                      {playbook.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{playbook.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span><strong>Trigger:</strong> {playbook.trigger}</span>
                    <span><strong>Actions:</strong> {playbook.actions.join(', ')}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>Last run: {playbook.lastRun}</div>
                  <div>Triggered: {playbook.triggered} times</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Templates */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Quick Start Templates</CardTitle>
          <CardDescription>Pre-built playbooks you can customize and deploy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">🚨 Emergency Retention</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Immediate intervention for users about to churn
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">📚 Feature Education</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Guide users to discover unused valuable features
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">🎉 Success Milestones</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Celebrate user achievements and encourage continued usage
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Settings, Activity, Send } from "lucide-react";

export const EmailAutomationDashboard = () => {
  const { user } = useAuth();

  // Fetch email stats
  const { data: emailStats } = useQuery({
    queryKey: ['email-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('email_logs')
        .select('status, created_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        sent: data.filter(email => email.status === 'sent').length,
        pending: data.filter(email => email.status === 'pending').length,
        failed: data.filter(email => email.status === 'failed').length,
        today: data.filter(email => {
          const today = new Date().toDateString();
          return new Date(email.created_at).toDateString() === today;
        }).length
      };
      
      return stats;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <p className="text-2xl font-bold">{emailStats?.total || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-green-600">{emailStats?.sent || 0}</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-blue-600">{emailStats?.today || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{emailStats?.failed || 0}</p>
              </div>
              <Settings className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure how AI emails are automatically triggered for high-risk users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-trigger for high-risk users</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Risk threshold</span>
                <Badge variant="outline">≥ 75%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cool-off period</span>
                <Badge variant="outline">24 hours</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Model</span>
                <Badge variant="outline">Mistral 7B + GPT-4o</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email sender</span>
                <Badge variant="outline">nexa@churnaizer.com</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Psychology style</span>
                <Badge variant="outline">Urgency + Loss Aversion</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, TrendingUp, AlertTriangle, Shield, Upload, Calendar, Bell, Code, ExternalLink, Puzzle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalUsers: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  lowRiskUsers: number;
  newUsers: number;
  activeAutomations: number;
}

interface LatestUpload {
  filename: string;
  created_at: string;
  rows_processed: number;
  status: string;
}

export const DashboardOverview = () => {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: userData, error } = await supabase
        .from('user_data')
        .select('risk_level, days_until_mature')
        .eq('owner_id', user?.id);
      
      if (error) throw error;

      const totalUsers = userData?.length || 0;
      const highRiskUsers = userData?.filter(u => u.risk_level === 'high').length || 0;
      const mediumRiskUsers = userData?.filter(u => u.risk_level === 'medium').length || 0;
      const lowRiskUsers = userData?.filter(u => u.risk_level === 'low').length || 0;
      const newUsers = userData?.filter(u => u.days_until_mature > 0 && u.days_until_mature <= 7).length || 0;

      // TODO: Fetch actual automation count from integration_settings
      const activeAutomations = 0;

      return {
        totalUsers,
        highRiskUsers,
        mediumRiskUsers,
        lowRiskUsers,
        newUsers,
        activeAutomations
      };
    },
    enabled: !!user?.id,
  });

  // Fetch latest CSV upload
  const { data: latestUpload } = useQuery({
    queryKey: ['latest-upload', user?.id],
    queryFn: async (): Promise<LatestUpload | null> => {
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('filename, created_at, rows_processed, status')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if user has API keys (Website Integration status)
  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">
            👋 Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </CardTitle>
          <CardDescription className="text-base">
            Here's your churn prevention dashboard overview
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users Tracked</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active customer base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Risk Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.highRiskUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.mediumRiskUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Monitor closely
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAutomations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Running playbooks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Upload Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Recent Upload Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestUpload ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last CSV:</span>
                  <Badge variant="outline">{latestUpload.filename}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uploaded:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(latestUpload.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Users Processed:</span>
                  <span className="text-sm font-bold text-primary">
                    {latestUpload.rows_processed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={latestUpload.status === 'completed' ? 'default' : 'secondary'}>
                    {latestUpload.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No CSV uploads yet</p>
                <p className="text-sm text-muted-foreground">Upload your first customer data file to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Website Integration Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Website Integration
            </CardTitle>
            <CardDescription>
              Connect ChurnGuard to your website via SDK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={apiKeys && apiKeys.length > 0 ? "default" : "secondary"}>
                {apiKeys && apiKeys.length > 0 ? "Connected" : "Pending Setup"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Keys:</span>
              <span className="text-sm font-medium">
                {apiKeys?.length || 0} active
              </span>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/integration">
                  Go to Setup
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="https://churnaizer-sdk.netlify.app/test.html" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Test SDK
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications/Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.newUsers && stats.newUsers > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{stats.newUsers}</strong> new users detected (less than 7 days old).
                  Churn predictions may be less confident for new users.
                </AlertDescription>
              </Alert>
            )}
            
            {stats?.highRiskUsers && stats.highRiskUsers > 0 && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-400">
                  <strong>{stats.highRiskUsers}</strong> users are at high risk of churning.
                  Consider setting up retention campaigns.
                </AlertDescription>
              </Alert>
            )}

            {(!stats?.activeAutomations || stats.activeAutomations === 0) && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <Bell className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-400">
                  No active automations. Set up email campaigns to improve retention.
                </AlertDescription>
              </Alert>
            )}

            {(!latestUpload) && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-400">
                  Upload your customer data to start tracking churn risk.
                </AlertDescription>
              </Alert>
            )}

            {(!apiKeys || apiKeys.length === 0) && (
              <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
                <Code className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 dark:text-purple-400">
                  Set up Website Integration to start tracking users automatically.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>Your connection overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Website SDK</p>
                  <p className="text-xs text-muted-foreground">JavaScript integration</p>
                </div>
              </div>
              <Badge variant={apiKeys && apiKeys.length > 0 ? "default" : "outline"}>
                {apiKeys && apiKeys.length > 0 ? "Active" : "Setup Required"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Puzzle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">CRM Integration</p>
                  <p className="text-xs text-muted-foreground">Email & automation tools</p>
                </div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Churn Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Distribution</CardTitle>
          <CardDescription>Overview of your customer risk levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats?.highRiskUsers || 0}
              </div>
              <div className="text-sm text-red-600 dark:text-red-500">High Risk</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.totalUsers ? ((stats.highRiskUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats?.mediumRiskUsers || 0}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-500">Medium Risk</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.totalUsers ? ((stats.mediumRiskUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats?.lowRiskUsers || 0}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">Low Risk</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats?.totalUsers ? ((stats.lowRiskUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
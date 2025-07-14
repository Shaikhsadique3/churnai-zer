import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmailService } from "@/hooks/useEmailService";
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

export const EmailAnalyticsDashboard = () => {
  const { getEmailAnalytics, getEmailLogs } = useEmailService();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, logsData] = await Promise.all([
        getEmailAnalytics(30),
        getEmailLogs(10)
      ]);
      
      setAnalytics(analyticsData);
      setRecentLogs(logsData);
    } catch (error) {
      console.error('Error loading email analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📊 Email Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 Email Analytics</h2>
          <p className="text-muted-foreground">Monitor your email delivery performance</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.totalSent}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.totalFailed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.totalPending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold flex items-center">
                    {analytics.successRate.toFixed(1)}%
                    {analytics.successRate >= 95 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 ml-2" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 ml-2" />
                    )}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Stats */}
        {analytics && Object.keys(analytics.providerStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Email Providers</span>
              </CardTitle>
              <CardDescription>
                Emails sent by provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.providerStats).map(([provider, count]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="capitalize">{provider}</span>
                    </div>
                    <Badge variant="secondary">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Email Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Recent Emails</span>
            </CardTitle>
            <CardDescription>
              Latest email delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent emails</p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="text-sm font-medium">{log.target_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.email_data?.subject || 'No subject'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Chart - Simplified representation */}
      {analytics && Object.keys(analytics.dailyStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Email Activity (Last 30 Days)</CardTitle>
            <CardDescription>
              Track your email sending patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.dailyStats)
                .slice(-7) // Show last 7 days
                .map(([date, stats]) => {
                  const dailyStats = stats as { sent: number; failed: number; pending: number };
                  return (
                    <div key={date} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">
                        {new Date(date).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600">✓ {dailyStats.sent}</span>
                        <span className="text-red-600">✗ {dailyStats.failed}</span>
                        <span className="text-yellow-600">⏳ {dailyStats.pending}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
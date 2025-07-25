import { useState, useEffect } from "react";
import { Activity, Clock, Users, Download, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface HealthStats {
  lastPing: Date | null;
  usersTracked: number;
  status: 'good' | 'inactive' | 'down';
  activeSessions24h: number;
  errorRate: number;
}

export const SDKHealthMonitor = () => {
  const { user } = useAuth();
  const [healthStats, setHealthStats] = useState<HealthStats>({
    lastPing: null,
    usersTracked: 0,
    status: 'down',
    activeSessions24h: 0,
    errorRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchHealthData = async () => {
    if (!user?.id) return;

    try {
      // Get SDK health logs for the last 24 hours
      const { data: healthLogs, error: logsError } = await supabase
        .from('sdk_health_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('ping_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('ping_timestamp', { ascending: false });

      if (logsError) throw logsError;

      // Get users tracked via SDK
      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, created_at, source')
        .eq('owner_id', user.id)
        .eq('source', 'sdk');

      if (userError) throw userError;

      // Calculate stats
      const now = new Date();
      const recentLogs = healthLogs || [];
      const lastPing = recentLogs.length > 0 ? new Date(recentLogs[0].ping_timestamp) : null;
      const usersTracked = userData?.length || 0;
      const activeSessions24h = recentLogs.length;
      const errorLogs = recentLogs.filter(log => log.status === 'error');
      const errorRate = recentLogs.length > 0 ? (errorLogs.length / recentLogs.length) * 100 : 0;

      // Determine status
      let status: 'good' | 'inactive' | 'down' = 'down';
      if (lastPing) {
        const timeSincePing = now.getTime() - lastPing.getTime();
        const hoursSincePing = timeSincePing / (1000 * 60 * 60);
        
        if (hoursSincePing < 1 && errorRate < 10) {
          status = 'good';
        } else if (hoursSincePing < 3) {
          status = 'inactive';
        } else {
          status = 'down';
        }
      }

      setHealthStats({
        lastPing,
        usersTracked,
        status,
        activeSessions24h,
        errorRate: Math.round(errorRate)
      });

      setLogs(recentLogs.slice(0, 10)); // Keep last 10 logs for export

    } catch (error: any) {
      console.error('Failed to fetch health data:', error);
      toast({
        title: "Failed to fetch SDK health data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchHealthData, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const getStatusColor = () => {
    switch (healthStats.status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = () => {
    switch (healthStats.status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const exportLogs = () => {
    if (logs.length === 0) {
      toast({
        title: "No logs to export",
        description: "No SDK activity logs found for the last 24 hours",
        variant: "destructive"
      });
      return;
    }

    const csvHeaders = [
      'Timestamp',
      'Status',
      'Response Time (ms)',
      'Error Message',
      'User Agent'
    ];

    const csvData = logs.map(log => [
      new Date(log.ping_timestamp).toISOString(),
      log.status,
      log.response_time_ms || 'N/A',
      log.error_message || 'N/A',
      log.user_agent || 'N/A'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sdk-health-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Logs exported",
      description: "SDK health logs have been downloaded as CSV"
    });
  };

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-500" />
            SDK Health Monitor
          </CardTitle>
          <CardDescription>Real-time monitoring of your SDK integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-500" />
              SDK Health Monitor
            </CardTitle>
            <CardDescription>Real-time monitoring of your SDK integration</CardDescription>
          </div>
          <Badge className={`${getStatusColor()} gap-1`}>
            {getStatusIcon()}
            {healthStats.status.charAt(0).toUpperCase() + healthStats.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Last API Ping</p>
              <p className="text-xs text-muted-foreground">
                {healthStats.lastPing 
                  ? healthStats.lastPing.toLocaleString()
                  : 'No pings recorded'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium"># Users Tracked (SDK)</p>
              <p className="text-xs text-muted-foreground">
                {healthStats.usersTracked} users via SDK
              </p>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Activity className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Active Sessions (24h)</p>
              <p className="text-xs text-muted-foreground">
                {healthStats.activeSessions24h} API calls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Error Rate</p>
              <p className="text-xs text-muted-foreground">
                {healthStats.errorRate}% failed requests
              </p>
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {healthStats.status === 'down' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">SDK Not Active</p>
                <p className="text-sm text-red-700">
                  No API calls detected in the last 3+ hours. Check your integration.
                </p>
              </div>
            </div>
          </div>
        )}

        {healthStats.status === 'inactive' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Reduced Activity</p>
                <p className="text-sm text-yellow-700">
                  Limited SDK activity detected. Consider checking your implementation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export Logs */}
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportLogs}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            Export Logs (CSV)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Share2, ExternalLink, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface SDKStats {
  isConnected: boolean;
  lastPing: string | null;
  totalUsers: number;
  recentUsers: any[];
}

export const SimplifiedSDKIntegration = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>('');
  const [stats, setStats] = useState<SDKStats>({
    isConnected: false,
    lastPing: null,
    totalUsers: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch API key and stats
  const fetchData = async () => {
    if (!user) return;

    try {
      // Get API key
      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (apiKeys && apiKeys.length > 0) {
        setApiKey(apiKeys[0].key);
      }

      // Get SDK stats
      const { data: sdkUsers } = await supabase
        .from('user_data')
        .select('user_id, created_at, source')
        .eq('owner_id', user.id)
        .eq('source', 'sdk')
        .order('created_at', { ascending: false });

      const { data: healthLogs } = await supabase
        .from('sdk_health_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('ping_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('ping_timestamp', { ascending: false })
        .limit(1);

      setStats({
        isConnected: healthLogs && healthLogs.length > 0,
        lastPing: healthLogs && healthLogs.length > 0 ? healthLogs[0].ping_timestamp : null,
        totalUsers: sdkUsers?.length || 0,
        recentUsers: sdkUsers?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching SDK data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  // Generate the SDK snippet
  const generateSDKSnippet = () => {
    const sampleUserData = stats.recentUsers.length > 0 ? {
      user_id: "{{user.id}}",
      customer_name: "{{user.name}}",
      customer_email: "{{user.email}}",
      days_since_signup: "{{daysSinceSignup}}",
      monthly_revenue: "{{user.subscription.amount}}",
      subscription_plan: "{{user.plan}}",
      number_of_logins_last30days: "{{user.loginCount}}",
      active_features_used: "{{user.featureUsage}}",
      support_tickets_opened: "{{user.supportTickets}}",
      last_payment_status: "{{user.paymentStatus}}",
      email_opens_last30days: "{{user.emailEngagement}}",
      last_login_days_ago: 0,
      billing_issue_count: "{{user.billingIssues}}"
    } : {
      user_id: "user_123",
      customer_name: "John Doe",
      customer_email: "john@company.com",
      days_since_signup: 30,
      monthly_revenue: 99,
      subscription_plan: "Pro",
      number_of_logins_last30days: 15,
      active_features_used: 5,
      support_tickets_opened: 1,
      last_payment_status: "active",
      email_opens_last30days: 8,
      last_login_days_ago: 0,
      billing_issue_count: 0
    };

    return `<!-- Churnaizer SDK Integration -->
<script src="https://19bbb304-3471-4d58-96e0-3f17ce42bb31.lovableproject.com/churnaizer-sdk.js"></script>
<script>
// Initialize Churnaizer when user logs in or performs key actions
if (window.Churnaizer && currentUser) {
  window.Churnaizer.track(${JSON.stringify(sampleUserData, null, 4)}, "${apiKey}", function(result, error) {
    if (error) {
      console.error('Churnaizer tracking failed:', error);
      return;
    }
    console.log('✅ Churn prediction:', result);
    
    // Optional: Act on high-risk users
    if (result.risk_level === 'high') {
      // Trigger retention campaign, show special offer, etc.
      console.log('⚠️ High churn risk detected for user');
    }
  });
}
</script>`;
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(generateSDKSnippet());
    toast.success('SDK snippet copied to clipboard!');
  };

  const downloadSnippet = () => {
    const blob = new Blob([generateSDKSnippet()], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'churnaizer-integration.js';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SDK file downloaded!');
  };

  const shareSnippet = () => {
    const subject = 'Churnaizer SDK Integration Code';
    const body = `Hi,\n\nHere's the Churnaizer SDK integration code for our app:\n\n${generateSDKSnippet()}\n\nPaste this code in your app after user authentication.\n\nBest regards`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">SDK Integration</h1>
        <p className="text-muted-foreground">
          Copy and paste this code snippet to start tracking churn in your SaaS app
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={stats.isConnected ? "default" : "secondary"}>
                {stats.isConnected ? "Connected" : "Not Connected"}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {stats.lastPing ? (
                  <>Last ping: {new Date(stats.lastPing).toLocaleString()}</>
                ) : (
                  'No recent activity'
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Users Tracked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDK Snippet Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Integration Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{generateSDKSnippet()}</pre>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={copySnippet} className="flex-1 sm:flex-none">
              <Copy className="h-4 w-4 mr-2" />
              Copy Snippet
            </Button>
            <Button variant="outline" onClick={downloadSnippet}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={shareSnippet}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Installation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Paste the code snippet</p>
                <p className="text-sm text-muted-foreground">Add it to your app&apos;s HTML, ideally in the head section or before body closing tag</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Replace placeholder values</p>
                <p className="text-sm text-muted-foreground">Update user.id, user.email, etc. with your actual user data variables</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Call after user authentication</p>
                <p className="text-sm text-muted-foreground">Ensure the tracking runs only when users are logged in</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="text-amber-600 text-sm">⚠️</div>
            <div>
              <p className="font-medium text-amber-800">Security Note</p>
              <p className="text-sm text-amber-700">
                Your API key is visible in the code above. For production apps, consider proxying requests through your backend to keep the API key secure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      {stats.recentUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent SDK Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentUsers.map((user, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-mono text-sm">{user.user_id}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card>
        <CardContent className="pt-6 text-center">
          <Button asChild size="lg">
            <Link to="/dashboard">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Dashboard
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Monitor your churn predictions and user insights
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
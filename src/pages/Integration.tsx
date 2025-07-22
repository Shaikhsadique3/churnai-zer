
import { ArrowLeft, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { APIKeysSection } from "@/components/integration/APIKeysSection";

const Integration = () => {
  const { user, signOut } = useAuth();
  const [newKeyName, setNewKeyName] = useState('');
  const queryClient = useQueryClient();

  // Show loading or redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the Integration page.</p>
        </div>
      </div>
    );
  }

  // Fetch API keys
  const { data: apiKeys, isLoading, error: apiKeysError } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Create new API key
  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.rpc('generate_api_key');
      if (error) throw error;
      
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user?.id,
          key: data,
          name: name || 'API Key',
        });
      
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewKeyName('');
      toast({
        title: "API key created",
        description: "Your new API key has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };

  const handleRegenerateKey = () => {
    if (confirm("Are you sure you want to regenerate your API key? This will invalidate your current key.")) {
      createKeyMutation.mutate('New API Key');
    }
  };

  const primaryApiKey = apiKeys?.[0]?.key || 'your_api_key_here';

  const handleLogout = async () => {
    await signOut();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (apiKeysError) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Integration</h2>
            <p className="text-muted-foreground mb-4">{apiKeysError.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        userEmail={user?.email || ''}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">🔗 Website Integration</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Connect ChurnGuard to your website via SDK and API
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${apiKeys && apiKeys.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-muted-foreground">
                {apiKeys && apiKeys.length > 0 ? 'Connected' : 'Setup Required'}
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://churnaizer-sdk.netlify.app/test.html" target="_blank" rel="noopener noreferrer">
                🧪 Test SDK
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* SDK Documentation Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                📦 Churnaizer SDK Integration Guide
              </CardTitle>
              <CardDescription className="text-lg">
                🎯 Predict and prevent churn in your SaaS by just adding a few lines of code.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Step 1: Install SDK */}
          <Card>
            <CardHeader>
              <CardTitle>✅ 1. Install or Add the SDK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Option A: Include via &lt;script&gt; (Recommended for simplicity)</h4>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<script src="https://churnaizer.com/churnaizer-sdk.js"></script>`}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`<script src="https://churnaizer.com/churnaizer-sdk.js"></script>`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Option B: npm (Coming soon)</h4>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>npm install churnaizer-sdk</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Track Users */}
          <Card>
            <CardHeader>
              <CardTitle>🧠 2. Call Churnaizer.track() with Your User Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`window.Churnaizer.track({
  user_id: "user_123",
  name: "Jane Doe",
  email: "jane@example.com",
  plan: "Pro",
  signup_date: "2024-12-01",
  usage_last_30_days: 12,
  support_tickets_last_month: 3
}, "${primaryApiKey}", function(result, error) {
  if (error) {
    console.error("❌ Churnaizer failed:", error);
  } else {
    console.log("✅ Churn Risk:", result.churn_score);
    console.log("📌 Reason:", result.churn_reason);
    console.log("💡 Insight:", result.insight);
  }
});`}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`window.Churnaizer.track({
  user_id: "user_123",
  name: "Jane Doe",
  email: "jane@example.com",
  plan: "Pro",
  signup_date: "2024-12-01",
  usage_last_30_days: 12,
  support_tickets_last_month: 3
}, "${primaryApiKey}", function(result, error) {
  if (error) {
    console.error("❌ Churnaizer failed:", error);
  } else {
    console.log("✅ Churn Risk:", result.churn_score);
    console.log("📌 Reason:", result.churn_reason);
    console.log("💡 Insight:", result.insight);
  }
});`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-blue-800 text-sm">
                  🧩 You can call this function right after a user logs in, finishes onboarding, or performs any key activity.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Live Demo */}
          <Card>
            <CardHeader>
              <CardTitle>🎬 3. Live Demo: What Happens When You Track a User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Sends real-time user data to AI model</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Gets churn score & insights instantly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Automatically logs data to your dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Enables playbook automation if user is at risk</span>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">🎬 SDK Demo GIF</p>
                  <p className="text-xs text-gray-500 mt-2">Visual demonstration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>📊 4. See It in Your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Once users are tracked:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Go to Dashboard → User Insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">See risk level (Low / Medium / High)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Review reasons & recommended actions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Trigger retention playbooks automatically</span>
                </div>
              </div>
              <Button className="mt-4" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Step 5: Security */}
          <Card>
            <CardHeader>
              <CardTitle>🛡 5. Security Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Your API key is unique per project</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Limit usage per domain (ask us if you need help)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Use server-side proxy if you need more security</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 6: Full Example */}
          <Card>
            <CardHeader>
              <CardTitle>📄 6. Full Example Code in HTML</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`<!DOCTYPE html>
<html>
<head>
  <title>Churnaizer SDK Test</title>
  <script src="https://churnaizer.com/churnaizer-sdk.js"></script>
</head>
<body>
  <button onclick="trackUser()">Track User</button>
  <script>
    function trackUser() {
      window.Churnaizer.track({
        user_id: "user_123",
        email: "jane@example.com",
        plan: "Pro",
        signup_date: "2024-12-01",
        usage_last_30_days: 12
      }, "${primaryApiKey}", function(result, error) {
        if (error) alert("❌ Tracking failed!");
        else alert("✅ Churn Risk: " + result.churn_score);
      });
    }
  </script>
</body>
</html>`}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`<!DOCTYPE html>
<html>
<head>
  <title>Churnaizer SDK Test</title>
  <script src="https://churnaizer.com/churnaizer-sdk.js"></script>
</head>
<body>
  <button onclick="trackUser()">Track User</button>
  <script>
    function trackUser() {
      window.Churnaizer.track({
        user_id: "user_123",
        email: "jane@example.com",
        plan: "Pro",
        signup_date: "2024-12-01",
        usage_last_30_days: 12
      }, "${primaryApiKey}", function(result, error) {
        if (error) alert("❌ Tracking failed!");
        else alert("✅ Churn Risk: " + result.churn_score);
      });
    }
  </script>
</body>
</html>`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <APIKeysSection
            apiKeys={apiKeys}
            isLoading={isLoading}
            newKeyName={newKeyName}
            setNewKeyName={setNewKeyName}
            onCreateKey={(name) => createKeyMutation.mutate(name)}
            onCopyKey={copyToClipboard}
            isCreating={createKeyMutation.isPending}
          />
        </div>
      </main>
    </div>
  );
};

export default Integration;

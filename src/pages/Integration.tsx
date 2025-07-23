
import { ArrowLeft, Copy, Code, Shield, CheckCircle } from "lucide-react";
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
import { ApiTestComponent } from "@/components/dashboard/ApiTestComponent";

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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with clean navigation */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 group transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">SDK Integration</h1>
              <p className="text-muted-foreground text-lg">
                Integrate Churnaizer with your SaaS in 3 simple steps
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-1.5 rounded-full">
                <div className={`w-2 h-2 rounded-full ${apiKeys && apiKeys.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>{apiKeys && apiKeys.length > 0 ? 'Connected' : 'Setup Required'}</span>
              </div>
              <Button variant="outline" asChild>
                <a href="https://churnaizer-sdk.netlify.app/test.html" target="_blank" rel="noopener noreferrer">
                  Test SDK
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <span className="text-sm font-medium">Install SDK</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span className="text-sm font-medium">Track Users</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <span className="text-sm font-medium">View Dashboard</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: Install SDK */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-primary" />
                  Step 1: Install SDK
                </CardTitle>
                <CardDescription>Add one line to your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <pre className="bg-muted/50 text-foreground p-4 rounded-lg overflow-x-auto text-sm border">
                    <code>{`<script src="https://churnaizer.com/churnaizer-sdk.js"></script>`}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(`<script src="https://churnaizer.com/churnaizer-sdk.js"></script>`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                  <strong>npm install</strong> coming soon
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Track Users */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Step 2: Track Your Users
                </CardTitle>
                <CardDescription>Call this function when users perform key actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <pre className="bg-muted/50 text-foreground p-4 rounded-lg overflow-x-auto text-sm border">
                    <code>{`// Track user activity
window.Churnaizer.track({
  user_id: "user_123",
  email: "jane@example.com",
  plan: "Pro",
  signup_date: "2024-12-01",
  usage_last_30_days: 12
}, "${primaryApiKey}", function(result, error) {
  if (result) {
    console.log("Churn Risk:", result.churn_score);
  }
});`}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(`window.Churnaizer.track({
  user_id: "user_123",
  email: "jane@example.com",
  plan: "Pro",
  signup_date: "2024-12-01",
  usage_last_30_days: 12
}, "${primaryApiKey}", function(result, error) {
  if (result) {
    console.log("Churn Risk:", result.churn_score);
  }
});`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Complete Example */}
            <Card>
              <CardHeader>
                <CardTitle>Complete HTML Example</CardTitle>
                <CardDescription>Ready-to-use implementation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <pre className="bg-muted/50 text-foreground p-4 rounded-lg overflow-x-auto text-sm border max-h-64">
                    <code>{`<!DOCTYPE html>
<html>
<head>
  <title>Churnaizer Integration</title>
  <script src="https://churnaizer.com/churnaizer-sdk.js"></script>
</head>
<body>
  <button onclick="trackUser()">Track User Activity</button>
  
  <script>
    function trackUser() {
      window.Churnaizer.track({
        user_id: "user_123",
        email: "jane@example.com",
        plan: "Pro",
        signup_date: "2024-12-01",
        usage_last_30_days: 12
      }, "${primaryApiKey}", function(result, error) {
        if (error) {
          console.error("Tracking failed:", error);
        } else {
          console.log("Churn Risk:", result.churn_score);
          console.log("Risk Level:", result.risk_level);
        }
      });
    }
  </script>
</body>
</html>`}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(`<!DOCTYPE html>
<html>
<head>
  <title>Churnaizer Integration</title>
  <script src="https://churnaizer.com/churnaizer-sdk.js"></script>
</head>
<body>
  <button onclick="trackUser()">Track User Activity</button>
  
  <script>
    function trackUser() {
      window.Churnaizer.track({
        user_id: "user_123",
        email: "jane@example.com",
        plan: "Pro",
        signup_date: "2024-12-01",
        usage_last_30_days: 12
      }, "${primaryApiKey}", function(result, error) {
        if (error) {
          console.error("Tracking failed:", error);
        } else {
          console.log("Churn Risk:", result.churn_score);
          console.log("Risk Level:", result.risk_level);
        }
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Test Component */}
            <ApiTestComponent />

            {/* API Key Section */}
            <APIKeysSection
              apiKeys={apiKeys}
              isLoading={isLoading}
              newKeyName={newKeyName}
              setNewKeyName={setNewKeyName}
              onCreateKey={(name) => createKeyMutation.mutate(name)}
              onCopyKey={copyToClipboard}
              isCreating={createKeyMutation.isPending}
            />

            {/* Security Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">API keys are unique per project</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Use server-side proxy for enhanced security</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Rate limiting automatically applied</span>
                </div>
              </CardContent>
            </Card>

            {/* What happens next */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time churn prediction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automatic risk scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Dashboard insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automated playbook triggers</span>
                </div>
                <Button className="w-full mt-4" asChild>
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Integration;

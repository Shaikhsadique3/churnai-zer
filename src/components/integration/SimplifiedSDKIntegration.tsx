import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, ExternalLink, Play, CheckCircle, AlertTriangle, Code, Shield, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export function SimplifiedSDKIntegration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, [user]);

  const fetchApiKey = async () => {
    if (!user) {
      console.log('No user found, skipping API key fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching API key for user:', user.id);
      console.log('User email:', user.email);
      console.log('User object:', user);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching API key:', error);
        throw error;
      }
      
      if (data) {
        setApiKey(data.key);
        console.log('API key fetched successfully');
      } else {
        console.log('No API key found, creating one...');
        // Try to create a new API key if none exists
        await createApiKey();
      }
    } catch (error) {
      console.error('Error fetching API key:', error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Error fetching API key",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!user) {
      console.log('No user found, cannot create API key');
      return;
    }
    
    try {
      console.log('Creating API key for user:', user.id);
      
      // Use the database function to generate API key
      const { data: generatedKey, error: rpcError } = await supabase.rpc('generate_api_key');
      
      if (rpcError) {
        console.error('RPC error:', JSON.stringify(rpcError, null, 2));
        throw rpcError;
      }
      
      console.log('Generated key:', generatedKey);
      
      // Insert the new API key
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key: generatedKey,
          name: 'Default API Key'
        });

      if (insertError) {
        console.error('Insert error:', JSON.stringify(insertError, null, 2));
        throw insertError;
      }
      
      setApiKey(generatedKey);
      console.log('API key created successfully:', generatedKey);
      
      toast({
        title: "API Key Created",
        description: "Your API key has been generated successfully",
      });
    } catch (error) {
      console.error('Error creating API key - type:', typeof error);
      console.error('Error creating API key - stringified:', JSON.stringify(error, null, 2));
      console.error('Error creating API key - message:', error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Error creating API key",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
      duration: 2000,
    });
  };

  const testSDK = () => {
    setTestLoading(true);
    setTestResult(null);

    const existingIframe = document.getElementById("sdk-test-iframe");
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.src = "/test.html";
    iframe.style.display = "none";
    iframe.id = "sdk-test-iframe";
    iframe.allow = "scripts";
    iframe.title = "SDK Test";
    document.body.appendChild(iframe);

    // Timeout if no response received
    const timeout = setTimeout(() => {
      setTestLoading(false);
      setTestResult({ error: 'Test timeout' });
      toast({
        title: "⚠️ Test Timeout",
        description: "No response from the test. Please check your SDK setup.",
        variant: "destructive",
      });
      window.removeEventListener("message", listener);
    }, 6000);

    // Listen for test result from iframe
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      clearTimeout(timeout); // Clear timeout on response
      setTestLoading(false);

      const { status, result, error } = event.data;

      if (status === "passed") {
        setTestResult(result);
        toast({
          title: "✅ Test Passed",
          description: "SDK is working correctly!",
        });
      } else if (status === "failed") {
        setTestResult({ error: error || 'Test failed' });
        toast({
          title: "❌ Test Failed",
          description: error || "Something went wrong.",
          variant: "destructive",
        });
      }

      window.removeEventListener("message", listener); // Clean up
    };

    window.addEventListener("message", listener);
  };

  const sdkImplementationCode = `<!-- 1. Add Churnaizer SDK to your website -->
<script src="${window.location.origin}/churnaizer-sdk.js"></script>

<script>
// 2. Initialize retention monitoring (optional)
window.ChurnaizerConfig = {
  modalEnabled: true,
  checkInterval: 5000,
  autoTrigger: true
};

// 3. Track user activity (call this on login or page load)
function trackUserActivity(userData) {
  window.Churnaizer.track({
    user_id: userData.id,
    email: userData.email,
    customer_name: userData.name || userData.full_name,
    customer_email: userData.email,
    subscription_plan: userData.plan || 'free',
    monthly_revenue: userData.monthlyRevenue || 0,
    loginCount: userData.loginCount || 1,
    dashboardViews: userData.dashboardViews || 0,
    feature_usage: {
      dashboard: userData.dashboardViews || 0,
      reports: userData.reportsGenerated || 0,
      settings: userData.settingsAccessed || 0
    }
  }, '${apiKey}', function(error, result) {
    if (error) {
      console.error('Churnaizer tracking failed:', error);
      return;
    }
    
    console.log('Churnaizer tracking successful:', result);
    
    // Handle high-risk users
    if (result.risk_level === 'high') {
      console.log('High-risk user detected!');
      // Modal will automatically show if enabled
      // You can also trigger custom retention actions here
    }
  });
}

// 4. Example: Track user on login
document.addEventListener('DOMContentLoaded', function() {
  // Get user data from your app's state/API
  const currentUser = getCurrentUser(); // Your function to get user data
  
  if (currentUser) {
    trackUserActivity(currentUser);
  }
});
</script>`;

  const reactImplementationCode = `// React/Vue/Angular Integration Example
import { useEffect } from 'react';

function useChurnaizerTracking(user) {
  useEffect(() => {
    if (!user || !window.Churnaizer) return;
    
    const trackUserActivity = () => {
      window.Churnaizer.track({
        user_id: user.id,
        email: user.email,
        customer_name: user.name || user.full_name,
        customer_email: user.email,
        subscription_plan: user.plan || 'free',
        monthly_revenue: user.monthlyRevenue || 0,
        loginCount: user.loginCount || 1,
        dashboardViews: user.dashboardViews || 0,
        feature_usage: {
          dashboard: user.dashboardViews || 0,
          reports: user.reportsGenerated || 0,
          settings: user.settingsAccessed || 0
        }
      }, '${apiKey}', (error, result) => {
        if (error) {
          console.error('Churnaizer tracking failed:', error);
          return;
        }
        
        console.log('Churnaizer result:', result);
        
        // Handle different risk levels
        switch(result.risk_level) {
          case 'high':
            // Trigger retention campaigns
            showRetentionOffer();
            break;
          case 'medium':
            // Send engagement emails
            scheduleFollowUp();
            break;
          default:
            // Continue normal flow
            break;
        }
      });
    };

    // Track immediately and then periodically
    trackUserActivity();
    
    // Optional: Track on specific user actions
    const trackOnActivity = () => trackUserActivity();
    window.addEventListener('focus', trackOnActivity);
    
    return () => {
      window.removeEventListener('focus', trackOnActivity);
    };
  }, [user]);
}

// Usage in your component
function App() {
  const user = useCurrentUser();
  useChurnaizerTracking(user);
  
  return <YourAppContent />;
}`;

  const advancedConfigCode = `// Advanced Configuration Options
window.ChurnaizerConfig = {
  // Retention modal settings
  modalEnabled: true,
  checkInterval: 5000, // Check for inactivity every 5 seconds
  autoTrigger: true,   // Automatically show retention modal for high-risk users
  
  // Custom retention modal callback
  customModalCallback: function(riskData) {
    // Your custom retention modal logic
    showCustomRetentionModal(riskData);
  }
};

// Initialize retention monitoring
window.Churnaizer.initRetentionMonitoring(window.ChurnaizerConfig);

// Custom retention modal example
function showCustomRetentionModal(riskData) {
  const modal = document.createElement('div');
  modal.innerHTML = \`
    <div class="custom-retention-modal">
      <h3>We're here to help! 👋</h3>
      <p>Risk Level: \${riskData.risk_level}</p>
      <p>Score: \${Math.round(riskData.churn_score * 100)}%</p>
      <button onclick="requestHelp()">Get Support</button>
      <button onclick="dismissModal()">Continue</button>
    </div>
  \`;
  document.body.appendChild(modal);
}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Production SDK Integration</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Implement Churnaizer's production-ready SDK to track user behavior and prevent churn automatically.
          </p>
        </div>
        
        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => copyToClipboard(sdkImplementationCode)}
            disabled={!apiKey}
            className="w-full sm:w-auto"
          >
            <Code className="h-4 w-4 mr-2" />
            Get SDK Code
          </Button>
        </div>
        
        {/* Debug info - collapsed on mobile */}
        {isMobile ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="debug-info">
              <AccordionTrigger className="text-sm py-2">Debug Information</AccordionTrigger>
              <AccordionContent>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs">
                    <strong>Debug Info:</strong><br/>
                    User ID: {user?.id || 'Not logged in'}<br/>
                    Email: {user?.email || 'No email'}<br/>
                    API Key: {apiKey ? 'Present' : 'Missing'}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Debug Info:</strong> User ID: {user?.id || 'Not logged in'} | 
              Email: {user?.email || 'No email'} | 
              API Key: {apiKey ? 'Present' : 'Missing'}
            </p>
          </div>
        )}
      </div>

      {/* API Key Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Your API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
              {apiKey || "Loading..."}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(apiKey)}
              disabled={!apiKey}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            🔒 Keep this key secure. Never expose it in client-side code in production.
          </p>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {testResult.error ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <span className="font-medium text-sm md:text-base">
                {testResult.error ? "Test Failed" : "Test Successful"}
              </span>
            </div>
            <pre className="text-xs md:text-sm overflow-auto max-h-40">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Implementation Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs md:text-sm">
              <TabsTrigger value="basic" className="text-xs md:text-sm">Basic Setup</TabsTrigger>
              <TabsTrigger value="react" className="text-xs md:text-sm">React/Vue/Angular</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs md:text-sm">Advanced Config</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic HTML/JavaScript Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add this code to your website to start tracking user behavior and preventing churn.
                </p>
                <div className="relative">
                  <pre className="p-3 md:p-4 bg-muted rounded-lg text-xs md:text-sm overflow-auto max-h-60 md:max-h-96">
                    <code>{sdkImplementationCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(sdkImplementationCode)}
                  >
                    <Copy className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="react" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Modern Framework Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Integration example for React, Vue, Angular, and other modern frameworks.
                </p>
                <div className="relative">
                  <pre className="p-3 md:p-4 bg-muted rounded-lg text-xs md:text-sm overflow-auto max-h-60 md:max-h-96">
                    <code>{reactImplementationCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(reactImplementationCode)}
                  >
                    <Copy className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Advanced Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize retention monitoring and modal behavior for your specific needs.
                </p>
                <div className="relative">
                  <pre className="p-3 md:p-4 bg-muted rounded-lg text-xs md:text-sm overflow-auto max-h-60 md:max-h-96">
                    <code>{advancedConfigCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(advancedConfigCode)}
                  >
                    <Copy className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>SDK Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Real-time Churn Scoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Calculates churn risk based on user behavior patterns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Automated Retention Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    Triggers retention modals for high-risk users automatically
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure API Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Server-side API key validation and rate limiting
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Behavior Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Tracks user engagement patterns and activity levels
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Custom Retention Modals</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurable retention modals with custom callbacks
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Analytics Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time insights sync to your Churnaizer dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Production Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <div className="space-y-2 text-sm">
            <p>🔒 <strong>Never expose API keys in client-side code in production</strong></p>
            <p>✅ <strong>Recommended:</strong> Use a server proxy to validate requests and forward to Churnaizer API</p>
            <p>🔐 <strong>Alternative:</strong> Implement signed tokens with short expiration times</p>
            <p>📊 <strong>Monitoring:</strong> Enable rate limiting and monitoring for your API endpoints</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
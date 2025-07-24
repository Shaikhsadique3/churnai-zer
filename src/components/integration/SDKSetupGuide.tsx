import { useState } from "react";
import { ArrowLeft, Copy, Code, CheckCircle, AlertTriangle, ExternalLink, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SDKSetupGuideProps {
  primaryApiKey: string;
  onCopyCode: (code: string) => void;
}

export const SDKSetupGuide = ({ primaryApiKey, onCopyCode }: SDKSetupGuideProps) => {
  const [testData, setTestData] = useState({
    user_id: "user_123",
    customer_name: "Jane Smith",
    customer_email: "jane@example.com",
    days_since_signup: "30",
    monthly_revenue: "99",
    subscription_plan: "Pro",
    number_of_logins_last30days: "15",
    active_features_used: "8",
    support_tickets_opened: "1",
    last_payment_status: "active",
    email_opens_last30days: "12",
    last_login_days_ago: "2",
    billing_issue_count: "0"
  });
  
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestPrediction = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('track', {
        headers: { 'X-API-Key': primaryApiKey },
        body: {
          user_id: testData.user_id,
          customer_name: testData.customer_name,
          customer_email: testData.customer_email,
          days_since_signup: parseInt(testData.days_since_signup),
          monthly_revenue: parseFloat(testData.monthly_revenue),
          subscription_plan: testData.subscription_plan,
          number_of_logins_last30days: parseInt(testData.number_of_logins_last30days),
          active_features_used: parseInt(testData.active_features_used),
          support_tickets_opened: parseInt(testData.support_tickets_opened),
          last_payment_status: testData.last_payment_status,
          email_opens_last30days: parseInt(testData.email_opens_last30days),
          last_login_days_ago: parseInt(testData.last_login_days_ago),
          billing_issue_count: parseInt(testData.billing_issue_count)
        }
      });

      if (error) throw error;
      setTestResult(data);
      toast({
        title: "Test successful!",
        description: "Churn prediction completed successfully."
      });
    } catch (error: any) {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const basicScript = `<script src="https://churnaizer.com/churnaizer-sdk.js"></script>`;
  
  const trackingScript = `<script>
window.Churnaizer.track({
  user_id: "{{user_id}}",
  customer_name: "{{customer_name}}",
  customer_email: "{{customer_email}}",
  days_since_signup: {{days_since_signup}},
  monthly_revenue: {{monthly_revenue}},
  subscription_plan: "{{subscription_plan}}",
  number_of_logins_last30days: {{login_count}},
  active_features_used: {{feature_count}},
  support_tickets_opened: {{ticket_count}},
  last_payment_status: "{{payment_status}}",
  email_opens_last30days: {{email_opens}},
  last_login_days_ago: {{last_login}},
  billing_issue_count: {{billing_issues}}
}, "${primaryApiKey}", function(result, error) {
  if (error) return console.error("❌ Churn prediction failed:", error);
  console.log("✅ Churn prediction:", result);
});
</script>`;

  const completeExample = `<!DOCTYPE html>
<html>
<head>
  <title>Churnaizer Integration</title>
  <script src="https://churnaizer.com/churnaizer-sdk.js"></script>
</head>
<body>
  <h1>Your SaaS Dashboard</h1>
  <button onclick="trackUserActivity()">Track Current User</button>
  
  <script>
    function trackUserActivity() {
      // Get current user data from your app
      const userData = {
        user_id: getCurrentUserId(),
        customer_name: getCurrentUserName(),
        customer_email: getCurrentUserEmail(),
        days_since_signup: getDaysSinceSignup(),
        monthly_revenue: getMonthlyRevenue(),
        subscription_plan: getSubscriptionPlan(),
        number_of_logins_last30days: getLoginCount(),
        active_features_used: getActiveFeatures(),
        support_tickets_opened: getSupportTickets(),
        last_payment_status: getPaymentStatus(),
        email_opens_last30days: getEmailOpens(),
        last_login_days_ago: getLastLoginDays(),
        billing_issue_count: getBillingIssues()
      };
      
      window.Churnaizer.track(userData, "${primaryApiKey}", function(result, error) {
        if (error) {
          console.error("❌ Tracking failed:", error);
          return;
        }
        
        console.log("✅ Churn Score:", result.churn_score);
        console.log("📊 Risk Level:", result.risk_level);
        console.log("💡 Insights:", result.churn_reason);
        
        // Optional: Show risk badge in UI
        showRiskBadge(result.risk_level, result.churn_score);
      });
    }
    
    function showRiskBadge(riskLevel, score) {
      const badge = document.createElement('div');
      badge.innerHTML = \`Risk: \${riskLevel} (\${Math.round(score * 100)}%)\`;
      badge.className = \`risk-badge risk-\${riskLevel}\`;
      document.body.appendChild(badge);
    }
  </script>
</body>
</html>`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/integration">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Link>
        </Button>
      </div>

      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          SDK Setup Guide
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Follow these steps to integrate Churnaizer into your SaaS application
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <span className="text-sm font-medium">Install SDK</span>
        </div>
        <div className="flex-1 max-w-20 h-px bg-border"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <span className="text-sm font-medium">Track Users</span>
        </div>
        <div className="flex-1 max-w-20 h-px bg-border"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <span className="text-sm font-medium">Test & Launch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Step 1: Install SDK */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                Install the SDK
              </CardTitle>
              <CardDescription>Add the Churnaizer script to your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Add to your HTML &lt;head&gt; section:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopyCode(basicScript)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code>{basicScript}</code>
                </pre>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Best Practice</p>
                    <p className="text-sm text-blue-700">Place the script in your &lt;head&gt; section for optimal loading performance.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Track Users */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                Track User Activity
              </CardTitle>
              <CardDescription>Call this function when users perform key actions or login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Tracking</TabsTrigger>
                  <TabsTrigger value="complete">Complete Example</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Replace {`{{placeholders}}`} with real user data:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopyCode(trackingScript)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="text-sm overflow-x-auto max-h-64">
                      <code>{trackingScript}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="complete" className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Complete HTML example:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopyCode(completeExample)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="text-sm overflow-x-auto max-h-80">
                      <code>{completeExample}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Required Fields</p>
                    <p className="text-sm text-amber-700">user_id, customer_email, and subscription_plan are required for accurate predictions.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Test Your Integration */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                Test Your Integration
              </CardTitle>
              <CardDescription>Test the SDK with sample data to ensure everything works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    value={testData.user_id}
                    onChange={(e) => setTestData(prev => ({ ...prev, user_id: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={testData.customer_email}
                    onChange={(e) => setTestData(prev => ({ ...prev, customer_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="subscription_plan">Plan</Label>
                  <Input
                    id="subscription_plan"
                    value={testData.subscription_plan}
                    onChange={(e) => setTestData(prev => ({ ...prev, subscription_plan: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="monthly_revenue">Monthly Revenue ($)</Label>
                  <Input
                    id="monthly_revenue"
                    type="number"
                    value={testData.monthly_revenue}
                    onChange={(e) => setTestData(prev => ({ ...prev, monthly_revenue: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="number_of_logins_last30days">Logins (30 days)</Label>
                  <Input
                    id="number_of_logins_last30days"
                    type="number"
                    value={testData.number_of_logins_last30days}
                    onChange={(e) => setTestData(prev => ({ ...prev, number_of_logins_last30days: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="days_since_signup">Days Since Signup</Label>
                  <Input
                    id="days_since_signup"
                    type="number"
                    value={testData.days_since_signup}
                    onChange={(e) => setTestData(prev => ({ ...prev, days_since_signup: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleTestPrediction} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Prediction Test
              </Button>

              {testResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">✅ Test Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Churn Score:</span>
                      <Badge variant={testResult.churn_score > 0.7 ? "destructive" : testResult.churn_score > 0.4 ? "default" : "secondary"}>
                        {Math.round(testResult.churn_score * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <Badge variant={testResult.risk_level === 'high' ? "destructive" : testResult.risk_level === 'medium' ? "default" : "secondary"}>
                        {testResult.risk_level}
                      </Badge>
                    </div>
                    {testResult.churn_reason && (
                      <div className="pt-2">
                        <span className="font-medium">Insights:</span>
                        <p className="text-muted-foreground">{testResult.churn_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security & Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Security Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>API keys are unique per project</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Use server-side proxy for enhanced security</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Rate limiting automatically applied</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>HTTPS required for production</span>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Links */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://churnaizer-sdk.netlify.app/test.html" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Live SDK Demo
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/privacy">
                  Privacy Policy
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard/users">
                  View Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Real-time churn predictions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Automatic risk scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Dashboard insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Retention analytics</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
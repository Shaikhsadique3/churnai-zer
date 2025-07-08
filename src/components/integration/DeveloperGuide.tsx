import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Copy, ExternalLink, Shield, Zap, Code, TestTube } from "lucide-react";
import { useState } from "react";

interface DeveloperGuideProps {
  primaryApiKey: string;
  onCopyCode: (code: string) => void;
}

export const DeveloperGuide = ({ primaryApiKey, onCopyCode }: DeveloperGuideProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const basicIntegration = `<!-- Step 1: Include the Churnaizer SDK -->
<script src="${window.location.origin}/churnaizer-sdk.js"></script>

<!-- Step 2: Track user churn prediction -->
<script>
  Churnaizer.track({
    user_id: "user_001",
    days_since_signup: 60,
    monthly_revenue: 99.99,
    subscription_plan: "Pro",
    number_of_logins_last30days: 20,
    active_features_used: 4,
    support_tickets_opened: 0,
    last_payment_status: "Success",
    email_opens_last30days: 8,
    last_login_days_ago: 1,
    billing_issue_count: 0
  }, "${primaryApiKey}", function (result) {
    console.log("✅ Churn Score:", result.churn_score);
    console.log("📌 Reason:", result.churn_reason);
    
    // Optional: Display in your UI
    document.getElementById("churn-info").innerText = 
      "Risk: " + (result.churn_score * 100).toFixed(2) + "% | Reason: " + result.churn_reason;
  });
</script>`;

  const reactIntegration = `// React/Next.js Integration Example
import { useEffect } from 'react';

const ChurnTracker = ({ user }) => {
  useEffect(() => {
    // Load SDK dynamically
    const script = document.createElement('script');
    script.src = '${window.location.origin}/churnaizer-sdk.js';
    script.onload = () => {
      window.Churnaizer.track({
        user_id: user.id,
        days_since_signup: user.daysSinceSignup,
        monthly_revenue: user.monthlyRevenue,
        subscription_plan: user.plan,
        number_of_logins_last30days: user.loginsLast30Days,
        active_features_used: user.activeFeatures,
        support_tickets_opened: user.supportTickets,
        last_payment_status: user.lastPaymentStatus,
        email_opens_last30days: user.emailOpens,
        last_login_days_ago: user.lastLoginDaysAgo,
        billing_issue_count: user.billingIssues
      }, "${primaryApiKey}", (result) => {
        setChurnData(result);
      });
    };
    document.head.appendChild(script);
  }, [user]);

  return <div id="churn-info">Loading churn data...</div>;
};`;

  const batchIntegration = `// Batch Processing for Multiple Users
const users = [
  { user_id: "user_001", days_since_signup: 60, /* ... other fields */ },
  { user_id: "user_002", days_since_signup: 90, /* ... other fields */ },
  // ... more users
];

Churnaizer.trackBatch(users, "${primaryApiKey}", function(results, error) {
  if (error) {
    console.error("❌ Batch tracking failed:", error);
    return;
  }
  
  results.forEach(result => {
    if (result.status === 'ok') {
      console.log(\`✅ User \${result.user_id}: \${result.churn_score}\`);
    }
  });
});`;

  const checklistItems = [
    "SDK script included in your app",
    "API key added securely (not in public repos)",
    "All 10 required user data fields provided",
    "Callback function implemented to handle results",
    "Error handling added for failed predictions",
    "UI updated to display churn risk to users",
    "Testing completed with sample data"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Code className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Developer Integration Guide</CardTitle>
          </div>
          <CardDescription className="text-base">
            Integrate Churnaizer SDK into your SaaS product for real-time churn predictions
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">🚀 Production Ready</Badge>
            <Badge variant="secondary">⚡ Real-time</Badge>
            <Badge variant="secondary">🛡️ Secure</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            What Churnaizer SDK Does
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold">Predict Churn Risk</h4>
              <p className="text-sm text-muted-foreground">Get 0-100% churn probability for any user</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold">Real-time Analysis</h4>
              <p className="text-sm text-muted-foreground">Instant predictions using AI model v5</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="font-semibold">AI-Powered Insights</h4>
              <p className="text-sm text-muted-foreground">Get reasons behind churn predictions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Integration Examples
          </CardTitle>
          <CardDescription>
            Choose the integration method that works best for your tech stack
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">🌐 Basic HTML/JS</TabsTrigger>
              <TabsTrigger value="react">⚛️ React/Next.js</TabsTrigger>
              <TabsTrigger value="batch">📊 Batch Processing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{basicIntegration}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onCopyCode(basicIntegration)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Perfect for:</strong> Simple websites, landing pages, or vanilla JavaScript apps.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="react" className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{reactIntegration}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onCopyCode(reactIntegration)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <p className="text-purple-800 text-sm">
                  <strong>⚛️ Perfect for:</strong> React, Next.js, or other modern frontend frameworks.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="batch" className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{batchIntegration}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onCopyCode(batchIntegration)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-orange-800 text-sm">
                  <strong>📊 Perfect for:</strong> Processing multiple users at once, analytics dashboards, or batch jobs.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API Key Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">❌ DON'T</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Commit API keys to public repositories</li>
                <li>• Share keys in team chat or emails</li>
                <li>• Use production keys in development</li>
                <li>• Hardcode keys in client-side code</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ DO</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Use environment variables or secrets</li>
                <li>• Regenerate compromised keys immediately</li>
                <li>• Monitor API usage regularly</li>
                <li>• Use separate keys for different environments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Best Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                <div>
                  <h4 className="font-semibold">User Login Events</h4>
                  <p className="text-sm text-muted-foreground">Track churn risk every time a user logs in</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">2</div>
                <div>
                  <h4 className="font-semibold">Checkout Process</h4>
                  <p className="text-sm text-muted-foreground">Predict if users will complete payments</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">3</div>
                <div>
                  <h4 className="font-semibold">Inactivity Detection</h4>
                  <p className="text-sm text-muted-foreground">Trigger predictions when users go quiet</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">4</div>
                <div>
                  <h4 className="font-semibold">Support Interactions</h4>
                  <p className="text-sm text-muted-foreground">Check churn risk after support tickets</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testing Your Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🧪 Test with Sample Data</h4>
            <p className="text-yellow-700 text-sm mb-3">
              Use these test values to verify your integration works correctly:
            </p>
            <div className="bg-white rounded p-3 font-mono text-xs">
              user_id: "test_user_001"<br/>
              days_since_signup: 30<br/>
              monthly_revenue: 49.99<br/>
              subscription_plan: "Pro"<br/>
              ... (other required fields)
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Live SDK Test Page
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>🎁 Integration Checklist</CardTitle>
          <CardDescription>
            Complete all items to ensure your integration is production-ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <button
                  onClick={() => toggleCheck(index)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    checkedItems.has(index)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  {checkedItems.has(index) && <CheckCircle className="h-3 w-3" />}
                </button>
                <span className={`${checkedItems.has(index) ? 'line-through text-muted-foreground' : ''}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="text-center">
            <Badge variant={checkedItems.size === checklistItems.length ? "default" : "secondary"}>
              {checkedItems.size}/{checklistItems.length} Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle>📞 Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Our team is here to help you integrate successfully
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Discord
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Docs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
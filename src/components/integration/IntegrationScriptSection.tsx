import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";

interface IntegrationScriptSectionProps {
  primaryApiKey: string;
  onCopyCode: (code: string) => void;
  onRegenerateKey: () => void;
}

export const IntegrationScriptSection = ({
  primaryApiKey,
  onCopyCode,
  onRegenerateKey
}: IntegrationScriptSectionProps) => {
  const sdkScript = `<!-- Churnaizer SDK v1.0.0 - Production Ready -->
<script src="${window.location.origin}/churnaizer-sdk.js"></script>
<script>
  // Track user churn prediction
  Churnaizer.track({
    user_id: "USER123",
    days_since_signup: 90,
    monthly_revenue: 49.99,
    subscription_plan: "Pro",
    number_of_logins_last30days: 15,
    active_features_used: 8,
    support_tickets_opened: 2,
    last_payment_status: "Success",
    email_opens_last30days: 12,
    last_login_days_ago: 2,
    billing_issue_count: 0
  }, "${primaryApiKey}", function(result, error) {
    if (error) {
      console.error("❌ Churn prediction failed:", error);
      return;
    }
    
    console.log("✅ Churn prediction:", result);
    alert("🧠 Churn Risk: " + (result.churn_score * 100).toFixed(1) + "%\\nReason: " + result.churn_reason);
    
    // Optional: Show badge on user element
    Churnaizer.showBadge('.user-profile', result);
  });
</script>`;

  const rawScript = `<!-- Raw Implementation - Manual -->
<script>
  (function() {
    const userInfo = {
      user_id: "USER123",
      days_since_signup: 90,
      monthly_revenue: 49.99,
      subscription_plan: "Pro",
      number_of_logins_last30days: 15,
      active_features_used: 8,
      support_tickets_opened: 2,
      last_payment_status: "Success",
      email_opens_last30days: 12,
      last_login_days_ago: 2,
      billing_issue_count: 0
    };

    fetch("${window.location.origin}/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "${primaryApiKey}"
      },
      body: JSON.stringify(userInfo)
    })
    .then(res => res.json())
    .then(data => console.log("🔁 Churn score:", data.churn_score, "Reason:", data.churn_reason))
    .catch(err => console.error("Churnaizer tracking failed:", err));
  })();
</script>`;

  const htmlDataScript = `<!-- Auto-Track with HTML Data Attributes -->
<script src="${window.location.origin}/churnaizer-sdk.js"></script>

<!-- User elements with data attributes - automatic tracking -->
<div class="user-profile" 
     data-churnaizer-track="USER123"
     data-churnaizer-api-key="${primaryApiKey}"
     data-churnaizer-user-id="USER123"
     data-churnaizer-days-since-signup="90"
     data-churnaizer-monthly-revenue="49.99"
     data-churnaizer-subscription-plan="Pro"
     data-churnaizer-number-of-logins-last30days="15"
     data-churnaizer-active-features-used="8"
     data-churnaizer-support-tickets-opened="2"
     data-churnaizer-last-payment-status="Success"
     data-churnaizer-email-opens-last30days="12"
     data-churnaizer-last-login-days-ago="2"
     data-churnaizer-billing-issue-count="0">
  <!-- Churn badge will automatically appear -->
  <h3>John Doe</h3>
  <p>Premium User</p>
</div>`;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          🔧 Integration Script
        </CardTitle>
        <CardDescription>
          Track churn with AI model v5 using 10 key features. Paste this script before closing &lt;/body&gt; tag. 
          <strong>Required:</strong> days_since_signup, monthly_revenue, subscription_plan, number_of_logins_last30days, active_features_used, support_tickets_opened, last_payment_status, email_opens_last30days, last_login_days_ago, billing_issue_count
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800 font-medium">Integration Status</span>
            </div>
            <span className="text-green-600 text-sm">Ready to receive data</span>
          </div>
          
          <Tabs defaultValue="sdk" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sdk">🚀 SDK (Recommended)</TabsTrigger>
              <TabsTrigger value="raw">⚡ Raw Script</TabsTrigger>
              <TabsTrigger value="html">🏷️ Auto-Track</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sdk" className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{sdkScript}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onCopyCode(sdkScript)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-blue-800 text-sm">
                  <strong>✅ Production Ready:</strong> Error handling, callbacks, badges, batch support, and auto-tracking features included.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="raw" className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{rawScript}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onCopyCode(rawScript)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Basic:</strong> Manual implementation without SDK features. Use for simple tracking only.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="html" className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{htmlDataScript}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onCopyCode(htmlDataScript)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <p className="text-purple-800 text-sm">
                  <strong>🏷️ Auto-Magic:</strong> Add data attributes to any element - churn badges appear automatically!
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              📘 View Installation Guide
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRegenerateKey}
            >
              🔁 Regenerate API Key
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
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
<script src="https://churnaizer.com/churnaizer-sdk.js"></script>
<script>
  Churnaizer.track({
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
    billing_issue_count: {{billing_issue_count}}
  }, "${primaryApiKey}", function(result, error) {
    if (error) return console.error("❌ Churn prediction failed:", error);
    console.log("✅ Churn prediction:", result);
    Churnaizer.showBadge('.user-profile', result);
  });
</script>`;



  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          🔧 Integration Script
        </CardTitle>
          <CardDescription>
          Official Churnaizer SDK v1.0.0 - Replace placeholders with your app's user data and paste before closing &lt;/body&gt; tag.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800 font-medium">Official Churnaizer SDK v1.0.0</span>
            </div>
            <span className="text-green-600 text-sm">Production Ready</span>
          </div>
          
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
              <strong>✅ Official SDK:</strong> Replace {`{{placeholders}}`} with real user data from your app. The SDK handles error handling, badges, and logging automatically.
            </p>
          </div>
          
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy } from "lucide-react";

interface APIDocumentationSectionProps {
  primaryApiKey: string;
  onCopyCode: (code: string) => void;
}

export const APIDocumentationSection = ({
  primaryApiKey,
  onCopyCode
}: APIDocumentationSectionProps) => {
  const jsCode = `// Official Churnaizer SDK v1.0.0 - Use This Only
<script src="https://churnaizer.com/churnaizer-sdk.js"></script>
<script>
  Churnaizer.track({
    user_id: "user_123",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    days_since_signup: 90,
    monthly_revenue: 99.99,
    subscription_plan: "Pro",
    number_of_logins_last30days: 25,
    active_features_used: 8,
    support_tickets_opened: 1,
    last_payment_status: "Success",
    email_opens_last30days: 15,
    last_login_days_ago: 1,
    billing_issue_count: 0
  }, "${primaryApiKey}", function(result, error) {
    if (error) return console.error("❌ Error:", error);
    console.log("✅ Churn Score:", result.churn_score, "Reason:", result.churn_reason);
    Churnaizer.showBadge('.user-profile', result);
  });
</script>`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Official Churnaizer SDK Integration
        </CardTitle>
        <CardDescription>
          Use only the official Churnaizer SDK v1.0.0 for production integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{jsCode}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onCopyCode(jsCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-800 text-sm">
              <strong>✅ Official SDK Only:</strong> This is the only supported integration method. Replace example values with real user data from your application.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
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
  const jsCode = `// JavaScript/TypeScript Example - AI Model v5
fetch("${window.location.origin}/api/track", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "${primaryApiKey}"
  },
  body: JSON.stringify({
    user_id: "user_123",
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
  })
})
.then(response => response.json())
.then(data => console.log('Churn Score:', data.churn_score, 'Reason:', data.churn_reason))
.catch(error => console.error('Error:', error));`;

  const curlCode = `# cURL Example - AI Model v5
curl -X POST "${window.location.origin}/api/track" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${primaryApiKey}" \\
  -d '{
    "user_id": "user_123",
    "days_since_signup": 90,
    "monthly_revenue": 99.99,
    "subscription_plan": "Pro",
    "number_of_logins_last30days": 25,
    "active_features_used": 8,
    "support_tickets_opened": 1,
    "last_payment_status": "Success",
    "email_opens_last30days": 15,
    "last_login_days_ago": 1,
    "billing_issue_count": 0
  }'`;

  const pythonCode = `# Python Example - AI Model v5
import requests
import json

url = "${window.location.origin}/api/track"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${primaryApiKey}"
}
data = {
    "user_id": "user_123",
    "days_since_signup": 90,
    "monthly_revenue": 99.99,
    "subscription_plan": "Pro",
    "number_of_logins_last30days": 25,
    "active_features_used": 8,
    "support_tickets_opened": 1,
    "last_payment_status": "Success",
    "email_opens_last30days": 15,
    "last_login_days_ago": 1,
    "billing_issue_count": 0
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(f"Churn Score: {result['churn_score']}, Reason: {result['churn_reason']}")`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Advanced Integration Examples
        </CardTitle>
        <CardDescription>
          AI Model v5 integration examples with 10 key features for enhanced churn prediction accuracy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="javascript" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>
          
          <TabsContent value="javascript" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="curl" className="space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{curlCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onCopyCode(curlCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="python" className="space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{pythonCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onCopyCode(pythonCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
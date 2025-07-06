import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const trackingScript = `<!-- Churnaizer Churn Tracker -->
<script>
  (function() {
    const userInfo = {
      user_id: "USER123",
      plan: "Pro", 
      usage_score: 95,
      last_login: "2024-07-06"
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
    .then(data => console.log("🔁 Churn score:", data.churn_score))
    .catch(err => console.error("Churnaizer tracking failed:", err));
  })();
</script>`;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          🔧 Integration Script
        </CardTitle>
        <CardDescription>
          To track churn signals from your own app or site, copy and paste this script into your website before the closing &lt;/body&gt; tag.
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
          
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{trackingScript}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onCopyCode(trackingScript)}
            >
              <Copy className="h-4 w-4" />
            </Button>
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
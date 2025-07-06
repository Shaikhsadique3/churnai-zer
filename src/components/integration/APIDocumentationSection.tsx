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
  const jsCode = `// JavaScript/TypeScript Example
fetch("${window.location.origin}/api/track", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "${primaryApiKey}"
  },
  body: JSON.stringify({
    user_id: "user_123",
    plan: "Pro",
    usage: 99,
    last_login: "2025-06-25T10:00:00Z"
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));`;

  const curlCode = `# cURL Example
curl -X POST "${window.location.origin}/api/track" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${primaryApiKey}" \\
  -d '{
    "user_id": "user_123",
    "plan": "Pro", 
    "usage": 99,
    "last_login": "2025-06-25T10:00:00Z"
  }'`;

  const pythonCode = `# Python Example
import requests
import json

url = "${window.location.origin}/api/track"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${primaryApiKey}"
}
data = {
    "user_id": "user_123",
    "plan": "Pro",
    "usage": 99,
    "last_login": "2025-06-25T10:00:00Z"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Advanced Integration Examples
        </CardTitle>
        <CardDescription>
          Use these code examples for more advanced integrations
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
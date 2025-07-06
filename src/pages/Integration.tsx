
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Key, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const Integration = () => {
  const { user, signOut } = useAuth();
  const [newKeyName, setNewKeyName] = useState('');
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
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

  const primaryApiKey = apiKeys?.[0]?.key || 'your_api_key_here';

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

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        userEmail={user?.email || ''}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">API Integration</h1>
          <p className="text-gray-600 mt-2">
            Integrate ChurnGuard with your application using our REST API
          </p>
        </div>

        {/* API Keys Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage your API keys for authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Key name (optional)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <Button 
                  onClick={() => createKeyMutation.mutate(newKeyName)}
                  disabled={createKeyMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${createKeyMutation.isPending ? 'animate-spin' : ''}`} />
                  Generate Key
                </Button>
              </div>
              
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
              ) : (
                <div className="space-y-2">
                  {apiKeys?.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="font-mono text-sm text-gray-600">
                          {key.key.substring(0, 12)}...{key.key.slice(-4)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integration Script */}
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
                  <code>{`<!-- Churnaizer Churn Tracker -->
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
</script>`}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`<!-- Churnaizer Churn Tracker -->
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
</script>`)}
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
                  onClick={() => {
                    if (confirm("Are you sure you want to regenerate your API key? This will invalidate your current key.")) {
                      createKeyMutation.mutate('New API Key');
                    }
                  }}
                >
                  🔁 Regenerate API Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
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
                    onClick={() => copyToClipboard(jsCode)}
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
                    onClick={() => copyToClipboard(curlCode)}
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
                    onClick={() => copyToClipboard(pythonCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* API Parameters */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Request Parameters</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Parameter</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Required</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">user_id</td>
                      <td className="border border-gray-300 px-4 py-2">string</td>
                      <td className="border border-gray-300 px-4 py-2">Yes</td>
                      <td className="border border-gray-300 px-4 py-2">Unique identifier for the user</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">plan</td>
                      <td className="border border-gray-300 px-4 py-2">string</td>
                      <td className="border border-gray-300 px-4 py-2">No</td>
                      <td className="border border-gray-300 px-4 py-2">User's subscription plan (Free, Pro, Enterprise)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">usage</td>
                      <td className="border border-gray-300 px-4 py-2">integer</td>
                      <td className="border border-gray-300 px-4 py-2">No</td>
                      <td className="border border-gray-300 px-4 py-2">Usage metric (e.g., API calls, features used)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">last_login</td>
                      <td className="border border-gray-300 px-4 py-2">string</td>
                      <td className="border border-gray-300 px-4 py-2">No</td>
                      <td className="border border-gray-300 px-4 py-2">ISO 8601 timestamp of last login</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Integration;

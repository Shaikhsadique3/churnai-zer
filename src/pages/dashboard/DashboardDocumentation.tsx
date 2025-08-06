import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Book, Users, Lightbulb, ExternalLink, Copy, CheckCircle, ArrowRight } from 'lucide-react';

const DashboardDocumentation = () => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Book className="h-4 w-4" />
          Developer Documentation
        </div>
        <h1 className="text-4xl font-bold">Quick Start Guide</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get up and running with Churnaizer SDK in minutes. Track user behavior and prevent churn automatically.
        </p>
      </div>

      <Tabs defaultValue="quickstart" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Quick Start Tab */}
        <TabsContent value="quickstart" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  1. Install the SDK
                </CardTitle>
                <CardDescription>
                  Add our lightweight SDK to your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`<script src="https://ntbkydpgjaswmwruegyl.supabase.co/storage/v1/object/public/assets/churnaizer-sdk.js"></script>`}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`<script src="https://ntbkydpgjaswmwruegyl.supabase.co/storage/v1/object/public/assets/churnaizer-sdk.js"></script>`, 'install')}
                  >
                    {copiedCode === 'install' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  2. Initialize Tracking
                </CardTitle>
                <CardDescription>
                  Start tracking user behavior with your API key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`ChurnaizerSDK.init({
  apiKey: 'your_api_key',
  userId: 'user123',
  email: 'user@example.com'
});`}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`ChurnaizerSDK.init({\n  apiKey: 'your_api_key',\n  userId: 'user123',\n  email: 'user@example.com'\n});`, 'init')}
                  >
                    {copiedCode === 'init' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  3. Track Events
                </CardTitle>
                <CardDescription>
                  Monitor user engagement and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`// Track page views
ChurnaizerSDK.track('page_view', {
  page: '/dashboard',
  timestamp: Date.now()
});

// Track feature usage
ChurnaizerSDK.track('feature_used', {
  feature: 'export_data',
  value: 150
});`}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`// Track page views\nChurnaizerSDK.track('page_view', {\n  page: '/dashboard',\n  timestamp: Date.now()\n});\n\n// Track feature usage\nChurnaizerSDK.track('feature_used', {\n  feature: 'export_data',\n  value: 150\n});`, 'track')}
                  >
                    {copiedCode === 'track' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  4. Monitor Results
                </CardTitle>
                <CardDescription>
                  View predictions and insights in your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Once implemented, you'll see:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time churn predictions</li>
                    <li>• User behavior analytics</li>
                    <li>• Automated email campaigns</li>
                    <li>• Recovery success metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Complete Setup Example</CardTitle>
              <CardDescription>
                Full implementation example for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted p-6 rounded-lg text-sm overflow-x-auto">
                  <code>{`<!DOCTYPE html>
<html>
<head>
  <title>Your SaaS App</title>
  <script src="https://ntbkydpgjaswmwruegyl.supabase.co/storage/v1/object/public/assets/churnaizer-sdk.js"></script>
</head>
<body>
  <script>
    // Initialize when user logs in
    ChurnaizerSDK.init({
      apiKey: 'your_api_key_here',
      userId: getCurrentUserId(),
      email: getCurrentUserEmail(),
      properties: {
        plan: 'pro',
        signupDate: '2024-01-15'
      }
    });

    // Track important events
    ChurnaizerSDK.track('login', {
      timestamp: Date.now(),
      loginMethod: 'email'
    });

    // Track feature usage
    document.getElementById('export-btn').addEventListener('click', () => {
      ChurnaizerSDK.track('feature_used', {
        feature: 'data_export',
        timestamp: Date.now()
      });
    });
  </script>
</body>
</html>`}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-4 right-4"
                  onClick={() => copyToClipboard(`<!DOCTYPE html>\n<html>\n<head>\n  <title>Your SaaS App</title>\n  <script src="https://ntbkydpgjaswmwruegyl.supabase.co/storage/v1/object/public/assets/churnaizer-sdk.js"></script>\n</head>\n<body>\n  <script>\n    // Initialize when user logs in\n    ChurnaizerSDK.init({\n      apiKey: 'your_api_key_here',\n      userId: getCurrentUserId(),\n      email: getCurrentUserEmail(),\n      properties: {\n        plan: 'pro',\n        signupDate: '2024-01-15'\n      }\n    });\n\n    // Track important events\n    ChurnaizerSDK.track('login', {\n      timestamp: Date.now(),\n      loginMethod: 'email'\n    });\n\n    // Track feature usage\n    document.getElementById('export-btn').addEventListener('click', () => {\n      ChurnaizerSDK.track('feature_used', {\n        feature: 'data_export',\n        timestamp: Date.now()\n      });\n    });\n  </script>\n</body>\n</html>`, 'complete')}
                >
                  {copiedCode === 'complete' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>React Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`import { useEffect } from 'react';

function App() {
  useEffect(() => {
    if (window.ChurnaizerSDK) {
      window.ChurnaizerSDK.init({
        apiKey: process.env.REACT_APP_CHURNAIZER_KEY,
        userId: user.id,
        email: user.email
      });
    }
  }, [user]);

  return <div>Your App</div>;
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vue.js Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`// In your Vue component
export default {
  mounted() {
    if (window.ChurnaizerSDK) {
      window.ChurnaizerSDK.init({
        apiKey: process.env.VUE_APP_CHURNAIZER_KEY,
        userId: this.user.id,
        email: this.user.email
      });
    }
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SDK Methods</CardTitle>
              <CardDescription>
                Complete reference for all available SDK methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">ChurnaizerSDK.init(config)</h4>
                <p className="text-sm text-muted-foreground mb-3">Initialize the SDK with your configuration</p>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">{`{
  apiKey: string,        // Your API key
  userId: string,        // Unique user identifier
  email?: string,        // User email
  properties?: object    // Additional user properties
}`}</code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">ChurnaizerSDK.track(event, data)</h4>
                <p className="text-sm text-muted-foreground mb-3">Track user events and behavior</p>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">{`// event: string - Event name
// data: object - Event properties
ChurnaizerSDK.track('feature_used', {
  feature: 'export_data',
  timestamp: Date.now(),
  value: 100
});`}</code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">ChurnaizerSDK.identify(userId, properties)</h4>
                <p className="text-sm text-muted-foreground mb-3">Update user information</p>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">{`ChurnaizerSDK.identify('user123', {
  email: 'user@example.com',
  plan: 'premium',
  signupDate: '2024-01-01'
});`}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Login Event</h5>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>{`ChurnaizerSDK.track('login', {
  method: 'email',
  timestamp: Date.now()
});`}</code>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Feature Usage</h5>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>{`ChurnaizerSDK.track('feature_used', {
  feature: 'dashboard_view',
  duration: 120000
});`}</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Track key actions</p>
                    <p className="text-sm text-muted-foreground">Monitor login, feature usage, and engagement</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Include context</p>
                    <p className="text-sm text-muted-foreground">Add relevant properties to events</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Update user data</p>
                    <p className="text-sm text-muted-foreground">Keep user properties current</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      <Card className="text-center">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6">
            Implement the SDK and start preventing churn today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              View Integration Setup
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Live Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDocumentation;
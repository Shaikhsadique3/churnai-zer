import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Book, Code, Users, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-foreground">Churnaizer</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link to="/integration">
              <Button>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Book className="h-4 w-4" />
          Complete Documentation
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">Everything You Need to Get Started</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Comprehensive guides for founders, developers, and teams to successfully implement Churnaizer 
          and start saving customers.
        </p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <Tabs defaultValue="founders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-12">
            <TabsTrigger value="founders" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Founders</span>
            </TabsTrigger>
            <TabsTrigger value="developers" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Developers</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Onboarding</span>
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Integration</span>
            </TabsTrigger>
          </TabsList>

          {/* Founders Guide */}
          <TabsContent value="founders" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">The Complete Founder's Guide</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Non-technical guide to understanding and implementing Churnaizer in your SaaS business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💡 What is Churnaizer?
                  </CardTitle>
                  <CardDescription>
                    Understand how AI-powered churn prediction works for your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">The Hidden Cost of Churn</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Average SaaS churn rate: 5-7% monthly</li>
                      <li>• Cost to acquire new customer: 5-25x more than retention</li>
                      <li>• 1% churn reduction = 12% company value increase</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What Churnaizer Solves</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Reactive vs proactive customer management</li>
                      <li>• Manual monitoring limitations</li>
                      <li>• Generic retention approaches</li>
                      <li>• Lack of data insights</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎯 Key Benefits for Founders
                  </CardTitle>
                  <CardDescription>
                    How Churnaizer transforms your customer retention strategy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">💰 Protect Revenue</h4>
                    <p className="text-sm text-muted-foreground">
                      Save 20-50% of customers who would otherwise churn. ROI typically pays for itself within 30 days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">⏰ Save Time</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated retention campaigns run 24/7. Your team focuses on high-impact activities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📊 Data-Driven Decisions</h4>
                    <p className="text-sm text-muted-foreground">
                      See exactly which customers are at risk and why. Measure retention campaign effectiveness.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📈 Success Stories
                  </CardTitle>
                  <CardDescription>
                    Real results from founders using Churnaizer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">TaskFlow (Project Management SaaS)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Challenge: 8% monthly churn</li>
                      <li>• Result: Reduced to 4.2% in 3 months</li>
                      <li>• Revenue saved: $240k annually</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">DataSync Pro (Integration Platform)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Challenge: Enterprise customers churning without warning</li>
                      <li>• Result: 60% reduction in enterprise churn</li>
                      <li>• Revenue saved: $180k in 6 months</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎯 Best Practices
                  </CardTitle>
                  <CardDescription>
                    How to maximize success with Churnaizer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Start Simple</h4>
                    <p className="text-sm text-muted-foreground">
                      Begin with basic data, use proven templates, focus on high-risk users first.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. Involve Your Team</h4>
                    <p className="text-sm text-muted-foreground">
                      Train customer success, set up CRM notifications, create escalation processes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. Monitor and Iterate</h4>
                    <p className="text-sm text-muted-foreground">
                      Check dashboard weekly, analyze tactics, adjust thresholds based on your business.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link to="/auth">Start Your Free Trial</Link>
              </Button>
            </div>
          </TabsContent>

          {/* Developer Documentation */}
          <TabsContent value="developers" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Developer Documentation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete technical reference for SDK integration, API usage, and advanced features.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Quick Start</CardTitle>
                  <CardDescription>Get up and running in 5 minutes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Installation</h4>
                    <div className="bg-muted rounded p-3 text-sm font-mono">
                      {`<!-- Add to your HTML head -->`}<br/>
                      {`<script src="https://churnaizer.com/churnaizer-sdk.js"></script>`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Basic Usage</h4>
                    <div className="bg-muted rounded p-3 text-sm font-mono overflow-x-auto">
                      {`Churnaizer.track({
  user_id: "user_123",
  customer_email: "john@example.com",
  monthly_revenue: 99.99,
  subscription_plan: "Pro"
}, "your_api_key", function(result, error) {
  if (error) return console.error(error);
  console.log("Churn Score:", result.churn_score);
});`}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Data Schema</CardTitle>
                  <CardDescription>Required and optional fields for tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Required Fields</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>user_id</code> - Unique user identifier</li>
                      <li>• <code>customer_email</code> - User's email address</li>
                      <li>• <code>customer_name</code> - User's full name</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Highly Recommended</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>monthly_revenue</code> - Subscription value</li>
                      <li>• <code>subscription_plan</code> - Plan name/tier</li>
                      <li>• <code>days_since_signup</code> - Account age</li>
                      <li>• <code>number_of_logins_last30days</code> - Login frequency</li>
                      <li>• <code>last_login_days_ago</code> - Recency</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>REST API</CardTitle>
                  <CardDescription>Direct API access for custom integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Base URL</h4>
                    <div className="bg-muted rounded p-2 text-sm font-mono">
                      https://churnaizer.com/api/v1
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Authentication</h4>
                    <div className="bg-muted rounded p-2 text-sm font-mono">
                      Authorization: Bearer your_api_key_here
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Endpoints</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>POST /predict</code> - Single user prediction</li>
                      <li>• <code>POST /predict/batch</code> - Multiple users</li>
                      <li>• <code>POST /events</code> - Track user events</li>
                      <li>• <code>GET /users/&#123;id&#125;/predictions</code> - History</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Real-time notifications for your systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Supported Events</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>user.risk_detected</code> - High risk user identified</li>
                      <li>• <code>user.recovered</code> - At-risk user improved</li>
                      <li>• <code>email.sent</code> - Retention email triggered</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Security</h4>
                    <p className="text-sm text-muted-foreground">
                      All webhooks include HMAC signatures for verification. 
                      Check our documentation for implementation details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link to="/integration">View Full API Docs</Link>
              </Button>
            </div>
          </TabsContent>

          {/* Onboarding Guide */}
          <TabsContent value="onboarding" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Step-by-Step Onboarding</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get from zero to saving customers in just 30 minutes with this comprehensive guide.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Step 1 */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <CardTitle>Account Setup (5 minutes)</CardTitle>
                      <CardDescription>Create your account and get your API key</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="ml-14">
                    <h4 className="font-semibold mb-2">✅ Create Your Account</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Go to churnaizer.com/signup</li>
                      <li>Enter your email and create a password</li>
                      <li>Verify your email address</li>
                      <li>Complete your company profile</li>
                    </ol>
                    
                    <h4 className="font-semibold mb-2 mt-4">✅ Get Your API Key</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Go to Settings → API Keys</li>
                      <li>Click "Generate New Key"</li>
                      <li>Name it "Production Key"</li>
                      <li>Copy and save it securely</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <CardTitle>Technical Integration (10 minutes)</CardTitle>
                      <CardDescription>Add the SDK to your app and send first prediction</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="ml-14">
                    <h4 className="font-semibold mb-2">✅ Add the SDK</h4>
                    <div className="bg-muted rounded p-3 text-sm font-mono mb-4">
                      {`<script src="https://churnaizer.com/churnaizer-sdk.js"></script>
<script>
  const CHURNAIZER_API_KEY = "your_api_key_here";
  
  if (window.currentUser) {
    Churnaizer.track({
      user_id: window.currentUser.id,
      customer_email: window.currentUser.email,
      monthly_revenue: window.currentUser.revenue
    }, CHURNAIZER_API_KEY);
  }
</script>`}
                    </div>
                    
                    <h4 className="font-semibold mb-2">✅ Test Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Check your dashboard - you should see your test user appear within a few minutes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <CardTitle>Retention Setup (5 minutes)</CardTitle>
                      <CardDescription>Configure emails and automation rules</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="ml-14">
                    <h4 className="font-semibold mb-2">✅ Configure Email Settings</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Go to Settings → Email Integration</li>
                      <li>Choose your email provider (Mailchimp, SendGrid, or our built-in service)</li>
                      <li>Enter your API credentials</li>
                    </ol>
                    
                    <h4 className="font-semibold mb-2 mt-4">✅ Enable Templates</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• "We Miss You" - For inactive users</li>
                      <li>• "Unlock Your Potential" - For low feature adoption</li>
                      <li>• "Billing Reminder" - For payment issues</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <CardTitle>Team Training (5 minutes)</CardTitle>
                      <CardDescription>Get your team familiar with the dashboard</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="ml-14">
                    <h4 className="font-semibold mb-2">✅ Dashboard Overview</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• High Risk (70-100): Take immediate action</li>
                      <li>• Medium Risk (40-69): Monitor closely</li>
                      <li>• Low Risk (0-39): Healthy users</li>
                    </ul>
                    
                    <h4 className="font-semibold mb-2 mt-4">✅ Set Up Notifications</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Enable email alerts for new high-risk users</li>
                      <li>Set up weekly churn summary reports</li>
                      <li>Invite team members with appropriate permissions</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5 */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      5
                    </div>
                    <div>
                      <CardTitle>First Actions (5 minutes)</CardTitle>
                      <CardDescription>Start saving customers immediately</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="ml-14">
                    <h4 className="font-semibold mb-2">🎯 Quick Win #1: Identify Risk</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Export users with churn score greater than 80% and have your customer success team reach out personally.
                    </p>
                    
                    <h4 className="font-semibold mb-2">🎯 Quick Win #2: Monitor Features</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Track which features correlate with retention and focus adoption efforts there.
                    </p>
                    
                    <h4 className="font-semibold mb-2">🎯 Quick Win #3: Review Weekly</h4>
                    <p className="text-sm text-muted-foreground">
                      Establish a weekly process to review high-risk users and retention campaign results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link to="/auth">Start Your Onboarding</Link>
              </Button>
            </div>
          </TabsContent>

          {/* Integration Guide */}
          <TabsContent value="integration" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Integration Examples</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Platform-specific examples and advanced integration patterns.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>React Integration</CardTitle>
                  <CardDescription>Custom hook for React applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded p-3 text-sm font-mono overflow-x-auto">
                    {`import { useEffect, useState } from 'react';

export function useChurnPrediction(userData, apiKey) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData || !apiKey) return;
    
    setLoading(true);
    Churnaizer.track(userData, apiKey, (result, error) => {
      setLoading(false);
      if (error) return console.error(error);
      setPrediction(result);
    });
  }, [userData, apiKey]);

  return { prediction, loading };
}`}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Node.js Backend</CardTitle>
                  <CardDescription>Server-side implementation example</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded p-3 text-sm font-mono overflow-x-auto">
                    {`const express = require('express');
const axios = require('axios');

app.post('/track-churn', async (req, res) => {
  try {
    const response = await axios.post(
      'https://churnaizer.com/api/v1/predict', 
      req.body,
      {
        headers: {
          'Authorization': \`Bearer \${process.env.CHURNAIZER_API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Prediction failed' });
  }
});`}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Error Handling</CardTitle>
                  <CardDescription>Robust error handling patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded p-3 text-sm font-mono overflow-x-auto">
                    {`Churnaizer.track(userData, apiKey, function(result, error) {
  if (error) {
    switch(error.code) {
      case 'NETWORK_ERROR':
        console.log('Network issue, retry later');
        break;
      case 'INVALID_API_KEY':
        console.log('Check your API key');
        break;
      case 'QUOTA_EXCEEDED':
        console.log('Upgrade your plan');
        break;
      default:
        console.log('Unknown error:', error.message);
    }
    return;
  }
  // Handle successful result
  console.log('Churn Score:', result.churn_score);
});`}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Testing</CardTitle>
                  <CardDescription>Test your integration thoroughly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Test Mode</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use test API keys (starting with test_) for development:
                    </p>
                    <div className="bg-muted rounded p-2 text-sm font-mono">
                      Churnaizer.track(userData, "test_sk_123...", callback);
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Sample Data</h4>
                    <div className="bg-muted rounded p-3 text-sm font-mono overflow-x-auto">
                      {`const testUser = {
  user_id: "test_user_123",
  customer_email: "test@example.com",
  customer_name: "Test User",
  monthly_revenue: 99.99,
  subscription_plan: "Pro",
  days_since_signup: 30
};`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link to="/integration">View Live Integration</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, ExternalLink, FileText, Terminal, CheckCircle, AlertTriangle, Code, Folder, File, ChevronRight, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StepByStepGuideProps {
  apiKey: string;
  onCopyCode: (code: string) => void;
}

export function StepByStepGuide({ apiKey, onCopyCode }: StepByStepGuideProps) {
  const { toast } = useToast();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    onCopyCode(text);
    toast({
      title: "Copied!",
      description: description,
      duration: 2000,
    });
  };

  const steps = [
    {
      title: "1. Add SDK Script to Your Website",
      description: "Include the Churnaizer SDK in your HTML head section",
      framework: "html",
      code: `<!-- Add this to your HTML <head> section -->
<script src="https://ntbkydpgjaswmwruegyl.supabase.co/storage/v1/object/public/churnaizer-sdk/churnaizer-sdk.js"></script>
<script>
  // Configure the SDK (optional)
  window.ChurnaizerConfig = {
    modalEnabled: true,        // Enable retention modals
    checkInterval: 30000,      // Check every 30 seconds
    autoTrigger: true,         // Auto-trigger for high-risk users
    debug: true                // Set to false for production
  };
</script>`,
      terminal: null,
      files: ["index.html", "app.html", "master.html"]
    },
    {
      title: "2. Create User Tracking Function",
      description: "Set up the main tracking function using real production data fields",
      framework: "javascript",
      code: `// Create a file: js/churnaizer-tracking.js
/**
 * Tracks user data with Churnaizer SDK to predict churn risk
 * @param {Object} userData - User data object containing all required fields
 */
function trackUserWithChurnaizer(userData) {
  if (!window.Churnaizer) {
    console.error('Churnaizer SDK not loaded');
    return;
  }

  console.log('[TRACE] Sending user data to Churnaizer:', userData);

  // Prepare payload with all required fields and safe defaults
  window.Churnaizer.track({
    // Required user identification fields
    user_id: userData.id || 'unknown',
    email: userData.email || 'unknown',
    customer_name: userData.name || 'unknown',
    customer_email: userData.email || 'unknown',
    
    // Subscription and revenue information
    subscription_plan: userData.plan || 'free',
    monthly_revenue: userData.monthlyRevenue || 0,
    
    // Usage metrics
    loginCount: userData.loginCount || 0,
    dashboardViews: userData.dashboardViews || 0,
    
    // Feature usage breakdown
    feature_usage: {
      dashboard: userData.dashboardViews || 0,
      reports: userData.reportsGenerated || 0,
      settings: userData.settingsAccessed || 0
    },
    
    // Additional required fields with defaults
    days_since_signup: userData.days_since_signup || 0,
    number_of_logins_last30days: userData.number_of_logins_last30days || 0,
    active_features_used: userData.active_features_used || [],
    support_tickets_opened: userData.support_tickets_opened || 0,
    last_payment_status: userData.last_payment_status || 'unknown',
    email_opens_last30days: userData.email_opens_last30days || 0,
    last_login_days_ago: userData.last_login_days_ago || 0,
    billing_issue_count: userData.billing_issue_count || 0
  }, '${apiKey}', function(result, error) {
    
    if (error && error.message) {
      console.error('Churnaizer tracking failed:', error);
      return;
    }
    
    console.log('[TRACE] Client received result:', result);
    
    // Handle high-risk users 
    if (result && result.risk_level === 'high') {
      console.log('⚠️ High churn risk detected:', result.churn_reason);
      // Trigger custom retention actions
      showRetentionOffer(result);
    }
  });
}

/**
 * Shows a retention offer to high-risk users based on churn prediction data
 */
function showRetentionOffer(churnData) {
  console.log('Showing retention offer for:', churnData);
  
  const churnProbability = churnData.churn_probability 
    ? \`\${Math.round(churnData.churn_probability * 100)}%\` 
    : 'Unknown';
    
  const suggestions = churnData.retention_suggestions 
    ? churnData.retention_suggestions 
    : { discount: '20%', message: 'We value your business!' };
  
  // Your custom retention UI logic here
  alert(\`⚠️ Churn Risk: \${churnData.churn_reason} | Probability: \${churnProbability}\`);
}`,
      terminal: "touch js/churnaizer-tracking.js",
      files: ["js/churnaizer-tracking.js"]
    },
    {
      title: "3. Track User Login Events",
      description: "Implement tracking on successful login with real user data",
      framework: "javascript",
      code: `// Add this to your login success handler
// Example: After successful login
function onUserLogin(user) {
  // Your existing login logic...
  
  // Track with Churnaizer
  trackUserWithChurnaizer({
    id: user.id,
    email: user.email,
    name: user.full_name || user.name,
    daysSinceSignup: user.days_since_signup || 30,
    monthlyRevenue: user.monthly_revenue || 0,
    plan: user.subscription_plan || 'Free',
    loginCount: user.login_count || 1,
    featuresUsed: user.active_features_used?.length || 1,
    supportTickets: user.support_tickets_opened || 0,
    paymentStatus: user.last_payment_status || 'Success',
    emailOpens: user.email_opens_last30days || 0,
    lastLoginDaysAgo: user.last_login_days_ago || 1,
    billingIssues: user.billing_issue_count || 0,
    dashboardViews: user.dashboard_views || 0
  });
}

// Example: Track on page load for logged-in users
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const currentUser = getCurrentUser(); // Your function to get current user
  
  if (currentUser) {
    trackUserWithChurnaizer({
      id: currentUser.id,
      email: currentUser.email,
      daysSinceSignup: currentUser.days_since_signup || 30,
      monthlyRevenue: currentUser.monthly_revenue || 0,
      plan: currentUser.subscription_plan || 'Free',
      loginCount: currentUser.login_count || 1,
      featuresUsed: currentUser.active_features_used?.length || 1,
      supportTickets: currentUser.support_tickets_opened || 0,
      paymentStatus: currentUser.last_payment_status || 'Success',
      emailOpens: currentUser.email_opens_last30days || 0,
      lastLoginDaysAgo: currentUser.last_login_days_ago || 1,
      billingIssues: currentUser.billing_issue_count || 0
    });
  }
});`,
      terminal: null,
      files: ["js/auth.js", "js/login.js", "js/app.js"]
    },
    {
      title: "4. Track Key User Actions",
      description: "Monitor user interactions that indicate engagement levels",
      framework: "javascript",
      code: `/**
 * Track important user actions and interactions that indicate engagement
 * @param {string} actionType - The type of action being tracked
 * @param {object} actionData - Additional data about the action
 */
function trackUserAction(actionType, actionData = {}) {
  if (!window.Churnaizer) {
    console.error('Churnaizer SDK not loaded, cannot track user action:', actionType);
    return;
  }
  
  console.log(\`[TRACE] Tracking user action: \${actionType}\`, actionData);
  
  window.Churnaizer.trackEvent({
    event_type: actionType,
    user_id: getCurrentUserId(), // Your function to get user ID 
    event_data: actionData,
    timestamp: new Date().toISOString()
  }, '${apiKey}');
}

// Get current user ID helper function
function getCurrentUserId() {
  const currentUser = getCurrentUser(); // Your function to get current user
  return currentUser ? currentUser.id : null;
}

// Example implementations:

// Track dashboard views
document.addEventListener('DOMContentLoaded', function() {
  trackUserAction('page_view', { 
    page: window.location.pathname,
    referrer: document.referrer
  });
});

// Track feature usage with data attributes
document.querySelectorAll('[data-track="feature"]').forEach(button => {
  button.addEventListener('click', () => {
    const feature = button.getAttribute('data-feature');
    trackUserAction('feature_used', { feature: feature || 'unknown' });
  });
});

// Track support contact clicks
document.querySelectorAll('[data-track="support"]').forEach(link => {
  link.addEventListener('click', () => {
    trackUserAction('support_contact', { 
      type: link.getAttribute('data-contact-type') || 'general',
      subject: link.getAttribute('data-subject') || 'general_inquiry'
    });
  });
});`,
      terminal: null,
      files: ["js/analytics.js", "js/tracking.js"]
    },
    {
      title: "5. Test Your Integration",
      description: "Verify SDK is working with your production environment",
      framework: "javascript",
      code: `// Create a test file: test-churnaizer.html
<!DOCTYPE html>
<html>
<head>
    <title>Churnaizer SDK Production Test</title>
    <script src="https://ntbkydpgjaswmwruegyl.supabase.co/storage/v1/object/public/churnaizer-sdk/churnaizer-sdk.js"></script>
</head>
<body>
    <h1>Testing Churnaizer SDK</h1>
    <button onclick="testTracking()">Test User Tracking</button>
    <button onclick="testFeatureTracking()">Test Feature Tracking</button>
    <div id="result"></div>
    
    <script>
        // Include your tracking function
        function trackUserWithChurnaizer(userData) {
          // ... (copy from step 2)
        }
        
        function testTracking() {
            // Use realistic production data structure
            const currentUser = {
                id: "user_12345",
                email: "user@yourapp.com",
                name: "Production User",
                subscription_plan: "premium",
                monthly_revenue: 99.99,
                login_count: 15,
                dashboard_views: 50,
                days_since_signup: 300,
                number_of_logins_last30days: 15,
                active_features_used: ['dashboard', 'reports'],
                support_tickets_opened: 2,
                last_payment_status: 'paid',
                email_opens_last30days: 10,
                last_login_days_ago: 5,
                billing_issue_count: 0
            };
            
            trackUserWithChurnaizer(currentUser);
            document.getElementById('result').innerHTML = 
                '<p style="color: green;">✅ Production tracking test sent! Check console and network tab.</p>';
        }
        
        function testFeatureTracking() {
            window.Churnaizer?.trackEvent({
                event_type: 'feature_used',
                user_id: 'user_12345',
                event_data: { feature: 'integration_test' },
                timestamp: new Date().toISOString()
            }, '${apiKey}');
            
            document.getElementById('result').innerHTML += 
                '<br><p style="color: blue;">✅ Feature tracking test sent!</p>';
        }
    </script>
</body>
</html>`,
      terminal: "touch test-churnaizer.html",
      files: ["test-churnaizer.html"]
    }
  ];

  const frameworkGuides = {
    react: {
      title: "React Integration",
      code: `// 1. Install or add SDK script to public/index.html
// Add to public/index.html in <head>:
<script src="https://cdn.churnaizer.com/sdk/churnaizer-sdk.js"></script>

// 2. Create a custom hook: hooks/useChurnaizer.js
import { useEffect } from 'react';

export function useChurnaizer(user, options = {}) {
  useEffect(() => {
    if (!user || !window.Churnaizer) return;

    window.Churnaizer.track({
      user_id: user.id,
      days_since_signup: user.daysSinceSignup || 30,
      monthly_revenue: user.monthlyRevenue || 0,
      subscription_plan: user.plan || 'Free',
      number_of_logins_last30days: user.loginCount || 1,
      active_features_used: user.featuresUsed || 1,
      support_tickets_opened: user.supportTickets || 0,
      last_payment_status: user.paymentStatus || 'Success',
      email_opens_last30days: user.emailOpens || 0,
      last_login_days_ago: user.lastLoginDaysAgo || 1,
      billing_issue_count: user.billingIssues || 0
    }, '${apiKey}', (result, error) => {
      if (error) {
        console.error('Churnaizer error:', error);
        return;
      }
      
      if (result.risk_level === 'high') {
        // Handle high-risk users
        console.log('High churn risk:', result);
      }
    });
  }, [user]);
}

// 3. Use in your components
import { useChurnaizer } from './hooks/useChurnaizer';

function App() {
  const user = useCurrentUser(); // Your user state
  useChurnaizer(user);
  
  return <div>Your app content</div>;
}`,
      files: ["public/index.html", "src/hooks/useChurnaizer.js", "src/App.js"]
    },
    vue: {
      title: "Vue.js Integration",
      code: `<!-- 1. Add to public/index.html in <head> -->
<script src="https://cdn.churnaizer.com/sdk/churnaizer-sdk.js"></script>

<!-- 2. Create composable: composables/useChurnaizer.js -->
import { watch } from 'vue';

export function useChurnaizer(user) {
  watch(user, (newUser) => {
    if (!newUser || !window.Churnaizer) return;
    
    window.Churnaizer.track({
      user_id: newUser.id,
      days_since_signup: newUser.daysSinceSignup || 30,
      monthly_revenue: newUser.monthlyRevenue || 0,
      subscription_plan: newUser.plan || 'Free',
      number_of_logins_last30days: newUser.loginCount || 1,
      active_features_used: newUser.featuresUsed || 1,
      support_tickets_opened: newUser.supportTickets || 0,
      last_payment_status: newUser.paymentStatus || 'Success',
      email_opens_last30days: newUser.emailOpens || 0,
      last_login_days_ago: newUser.lastLoginDaysAgo || 1,
      billing_issue_count: newUser.billingIssues || 0
    }, '${apiKey}', (result, error) => {
      if (error) {
        console.error('Churnaizer error:', error);
        return;
      }
      
      if (result.risk_level === 'high') {
        console.log('High churn risk:', result);
      }
    });
  }, { immediate: true });
}

<!-- 3. Use in your component -->
<script setup>
import { useChurnaizer } from '@/composables/useChurnaizer';
import { useCurrentUser } from '@/composables/useCurrentUser';

const user = useCurrentUser();
useChurnaizer(user);
</script>`,
      files: ["public/index.html", "src/composables/useChurnaizer.js", "src/App.vue"]
    },
    angular: {
      title: "Angular Integration",
      code: `<!-- 1. Add to src/index.html in <head> -->
<script src="https://cdn.churnaizer.com/sdk/churnaizer-sdk.js"></script>

// 2. Create service: services/churnaizer.service.ts
import { Injectable } from '@angular/core';

declare global {
  interface Window {
    Churnaizer: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ChurnaizerService {
  
  trackUser(user: any): void {
    if (!user || !window.Churnaizer) return;
    
    window.Churnaizer.track({
      user_id: user.id,
      days_since_signup: user.daysSinceSignup || 30,
      monthly_revenue: user.monthlyRevenue || 0,
      subscription_plan: user.plan || 'Free',
      number_of_logins_last30days: user.loginCount || 1,
      active_features_used: user.featuresUsed || 1,
      support_tickets_opened: user.supportTickets || 0,
      last_payment_status: user.paymentStatus || 'Success',
      email_opens_last30days: user.emailOpens || 0,
      last_login_days_ago: user.lastLoginDaysAgo || 1,
      billing_issue_count: user.billingIssues || 0
    }, '${apiKey}', (result: any, error: any) => {
      if (error) {
        console.error('Churnaizer error:', error);
        return;
      }
      
      if (result.risk_level === 'high') {
        console.log('High churn risk:', result);
      }
    });
  }
}

// 3. Use in component: app.component.ts
import { Component, OnInit } from '@angular/core';
import { ChurnaizerService } from './services/churnaizer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  constructor(private churnaizer: ChurnaizerService) {}
  
  ngOnInit() {
    // Track user when component initializes
    const user = this.getCurrentUser(); // Your method
    if (user) {
      this.churnaizer.trackUser(user);
    }
  }
}`,
      files: ["src/index.html", "src/app/services/churnaizer.service.ts", "src/app/app.component.ts"]
    }
  };

  const deploymentSteps = [
    {
      title: "Production Checklist",
      items: [
        "✅ SDK script loaded in production environment",
        "✅ API key configured securely (consider server-side proxy)",
        "✅ User tracking implemented on login/authentication",
        "✅ Key user actions are being tracked",
        "✅ Error handling implemented for failed API calls",
        "✅ Test with real user data in staging environment",
        "✅ Monitor SDK performance and API response times",
        "✅ Set up alerts for high churn risk users"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Complete Integration Guide</h1>
          <p className="text-muted-foreground mt-2">
            Step-by-step instructions to integrate Churnaizer SDK into your application. 
            Perfect for non-technical founders with detailed terminal commands and file creation steps.
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Progress:</span>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {completedSteps.size}/{steps.length} completed
          </span>
        </div>
      </div>

      {/* Framework-specific guides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Framework-Specific Guides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="react" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="vue">Vue.js</TabsTrigger>
              <TabsTrigger value="angular">Angular</TabsTrigger>
            </TabsList>
            
            {Object.entries(frameworkGuides).map(([key, guide]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Files you'll need to create/modify:</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.files.map((file) => (
                        <Badge key={file} variant="secondary" className="text-xs">
                          <File className="h-3 w-3 mr-1" />
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="relative mt-4">
                    <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-96">
                      <code>{guide.code}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(guide.code, `${guide.title} code copied`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Step-by-step implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Universal Implementation Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border rounded-lg">
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleStep(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        completedSteps.has(index) 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-muted-foreground'
                      }`}>
                        {completedSteps.has(index) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="px-4 pb-4 space-y-4">
                  {/* Files to create */}
                  <div>
                    <p className="text-sm font-medium mb-2">Files to create/modify:</p>
                    <div className="flex flex-wrap gap-2">
                      {step.files.map((file) => (
                        <Badge key={file} variant="outline" className="text-xs">
                          <File className="h-3 w-3 mr-1" />
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Terminal command */}
                  {step.terminal && (
                    <div>
                      <p className="text-sm font-medium mb-2">Terminal command:</p>
                      <div className="relative">
                        <pre className="p-3 bg-black text-green-400 rounded-lg text-sm font-mono">
                          <code>$ {step.terminal}</code>
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(step.terminal, "Terminal command copied")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Code implementation */}
                  <div>
                    <p className="text-sm font-medium mb-2">Code implementation:</p>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-80">
                        <code>{step.code}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(step.code, `Step ${index + 1} code copied`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Production Deployment Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deploymentSteps.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-semibold">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2">
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Support section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ExternalLink className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-2 text-sm">
            <p>🚀 <strong>Quick Start:</strong> Follow the steps above in order for best results</p>
            <p>📧 <strong>Support:</strong> Contact support@churnaizer.com for technical assistance</p>
            <p>📚 <strong>Documentation:</strong> Check our developer docs for advanced features</p>
            <p>🔧 <strong>Debugging:</strong> Set ChurnaizerConfig.debug = true for detailed logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
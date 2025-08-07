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
      title: "1. Include Churnaizer SDK",
      description: "Add the production SDK script to your HTML",
      framework: "html",
      code: `<!-- Add to your HTML <head> section -->
<script src="https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/churnaizer-sdk.js"></script>
<script>
  // Optional SDK configuration
  window.ChurnaizerConfig = {
    modalEnabled: true,        // Show retention popups for high-risk users
    checkInterval: 5000,       // Check user activity every 5 seconds
    autoTrigger: true,         // Auto-start retention monitoring
    debug: false               // Set to true for development only
  };
</script>`,
      terminal: null,
      files: ["index.html", "app.html"]
    },
    {
      title: "2. Create User Tracking Function",
      description: "Set up type-safe user tracking with real production data",
      framework: "javascript",
      code: `// Create file: js/churnaizer-tracking.js
/**
 * Track user data with Churnaizer for churn prediction
 * @param {Object} userData - User data with required fields
 */
function trackUserWithChurnaizer(userData) {
  if (!window.Churnaizer) {
    console.error('❌ Churnaizer SDK not loaded');
    return;
  }

  // Validate required fields
  if (!userData.id || !userData.email) {
    console.error('❌ Missing required fields: user_id and email');
    return;
  }

  console.log('[TRACE] Tracking user:', userData.id);

  // Prepare payload with type-safe conversions and real data
  const trackingData = {
    user_id: String(userData.id),
    email: String(userData.email),
    customer_name: String(userData.name || userData.email.split('@')[0]),
    customer_email: String(userData.email),
    days_since_signup: Number(userData.days_since_signup) || 0,
    monthly_revenue: Number(userData.monthly_revenue) || 0,
    subscription_plan: String(userData.subscription_plan || 'Free'),
    number_of_logins_last30days: Number(userData.number_of_logins_last30days) || 1,
    active_features_used: Number(userData.active_features_used) || 1,
    support_tickets_opened: Number(userData.support_tickets_opened) || 0,
    last_payment_status: String(userData.last_payment_status || 'active'),
    email_opens_last30days: Number(userData.email_opens_last30days) || 0,
    last_login_days_ago: Number(userData.last_login_days_ago) || 0,
    billing_issue_count: Number(userData.billing_issue_count) || 0
  };

  window.Churnaizer.track(trackingData, '${apiKey}', function(result, error) {
    if (error) {
      console.error('❌ Churnaizer tracking failed:', error);
      return;
    }

    console.log('✅ Churn prediction successful:', result);

    // Handle high-risk users with retention logic
    if (result.risk_level === 'high') {
      console.log('⚠️ High churn risk detected:', result.churn_reason);
      showRetentionOffer(result);
    }
  });
}

/**
 * Show retention offer for high-risk users
 * Note: Rate-limited to max 2 emails/second on backend
 */
function showRetentionOffer(churnData) {
  console.log('📧 Retention email triggered (rate-limited):', churnData);
  
  // Show retention modal or notification
  window.Churnaizer.showBadge(
    \`We noticed you might need help. Let's connect!\`, 
    'warning'
  );
  
  // Optional: Custom retention UI
  // showCustomRetentionModal(churnData);
}`,
      terminal: "touch js/churnaizer-tracking.js",
      files: ["js/churnaizer-tracking.js"]
    },
    {
      title: "3. Track User Login Events",
      description: "Implement post-authentication tracking with real user data",
      framework: "javascript",
      code: `// Add to your authentication flow
/**
 * Track user after successful login
 * @param {Object} user - Authenticated user object
 */
function onUserLogin(user) {
  console.log('🔐 User logged in:', user.id);
  
  // Track with Churnaizer using real user data
  trackUserWithChurnaizer({
    id: user.id,
    email: user.email,
    name: user.name || user.full_name,
    days_since_signup: calculateDaysSinceSignup(user.created_at),
    monthly_revenue: parseFloat(user.current_plan_amount) || 0,
    subscription_plan: user.subscription_plan || 'Free',
    number_of_logins_last30days: user.login_count_30days || 1,
    active_features_used: user.features_used?.length || 1,
    support_tickets_opened: user.support_tickets || 0,
    last_payment_status: user.payment_status || 'active',
    email_opens_last30days: user.email_engagement || 0,
    last_login_days_ago: calculateDaysSinceLastLogin(user.last_login),
    billing_issue_count: user.billing_issues || 0
  });
}

/**
 * Calculate days since user signup
 */
function calculateDaysSinceSignup(signupDate) {
  if (!signupDate) return 0;
  const signup = new Date(signupDate);
  const now = new Date();
  return Math.floor((now - signup) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days since last login
 */
function calculateDaysSinceLastLogin(lastLogin) {
  if (!lastLogin) return 0;
  const login = new Date(lastLogin);
  const now = new Date();
  return Math.floor((now - login) / (1000 * 60 * 60 * 24));
}

// Auto-track on page load for existing sessions
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = getCurrentUser(); // Your function to get current user
  
  if (currentUser) {
    onUserLogin(currentUser);
  }
});`,
      terminal: null,
      files: ["js/auth.js", "js/login.js"]
    },
    {
      title: "4. Track User Engagement Events",
      description: "Monitor user interactions for churn prediction enhancement",
      framework: "javascript",
      code: `/**
 * Track user engagement events
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Additional event data
 */
function trackUserEvent(eventType, eventData = {}) {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !window.Churnaizer) {
    console.warn('Cannot track event: user not logged in or SDK not loaded');
    return;
  }

  const eventPayload = {
    event: eventType,
    user_id: String(currentUser.id),
    email: String(currentUser.email),
    customer_name: String(currentUser.name || currentUser.email.split('@')[0]),
    monthly_revenue: Number(currentUser.monthly_revenue) || 0,
    ...eventData
  };

  window.Churnaizer.trackEvent(eventPayload, '${apiKey}', function(result, error) {
    if (error) {
      console.error('Event tracking failed:', error);
      return;
    }
    console.log('✅ Event tracked:', eventType);
  });
}

// Set up automatic event tracking
document.addEventListener('DOMContentLoaded', function() {
  // Track page views
  trackUserEvent('page_view', { 
    page: window.location.pathname,
    referrer: document.referrer
  });
  
  // Track feature usage with data attributes
  document.querySelectorAll('[data-track="feature"]').forEach(element => {
    element.addEventListener('click', () => {
      const feature = element.getAttribute('data-feature');
      trackUserEvent('feature_used', { feature: feature });
    });
  });
  
  // Track dashboard interactions
  document.querySelectorAll('[data-track="dashboard"]').forEach(element => {
    element.addEventListener('click', () => {
      trackUserEvent('dashboard_view', { 
        section: element.getAttribute('data-section') || 'main'
      });
    });
  });
  
  // Track support interactions
  document.querySelectorAll('[data-track="support"]').forEach(element => {
    element.addEventListener('click', () => {
      trackUserEvent('support_contact', { 
        type: element.getAttribute('data-contact-type') || 'general'
      });
    });
  });
});

// Track user recovery events (for recovered users)
function trackRecoveryEvent(recoveryType, details = {}) {
  trackUserEvent('user_recovery', {
    recovery_type: recoveryType,
    recovery_details: details,
    timestamp: new Date().toISOString()
  });
}`,
      terminal: null,
      files: ["js/event-tracking.js", "js/analytics.js"]
    },
    {
      title: "5. Production Testing & Validation",
      description: "Test integration with real data and proper error handling",
      framework: "javascript",
      code: `/**
 * Production-ready integration validation
 */
function validateChurnaizerIntegration() {
  console.log('🔍 Validating Churnaizer integration...');
  
  // Check SDK availability
  if (typeof window.Churnaizer === 'undefined') {
    console.error('❌ Churnaizer SDK not found. Check script inclusion.');
    return false;
  }
  
  console.log('✅ SDK loaded, version:', window.Churnaizer.version);
  
  // Check API key configuration
  const apiKey = '${apiKey}';
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('❌ API key not configured properly');
    return false;
  }
  
  console.log('✅ API key configured');
  
  // Test with current user if available
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.warn('⚠️ No user logged in for testing');
    return true;
  }
  
  // Validate required user fields
  const requiredFields = ['id', 'email'];
  const missing = requiredFields.filter(field => !currentUser[field]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required user fields:', missing);
    return false;
  }
  
  console.log('✅ User data validation passed');
  
  // Test actual tracking (only in development/staging)
  if (window.location.hostname === 'localhost' || 
      window.location.hostname.includes('staging')) {
    testUserTracking(currentUser);
  }
  
  return true;
}

/**
 * Test user tracking with production data structure
 */
function testUserTracking(user) {
  console.log('🧪 Testing user tracking...');
  
  trackUserWithChurnaizer({
    id: user.id,
    email: user.email,
    name: user.name || 'Test User',
    days_since_signup: calculateDaysSinceSignup(user.created_at) || 30,
    monthly_revenue: parseFloat(user.current_plan_amount) || 0,
    subscription_plan: user.subscription_plan || 'Free',
    number_of_logins_last30days: user.login_count_30days || 1,
    active_features_used: user.features_used?.length || 1,
    support_tickets_opened: user.support_tickets || 0,
    last_payment_status: user.payment_status || 'active',
    email_opens_last30days: user.email_engagement || 0,
    last_login_days_ago: calculateDaysSinceLastLogin(user.last_login) || 0,
    billing_issue_count: user.billing_issues || 0
  });
}

// Error handling for AI prediction fallbacks
window.addEventListener('error', function(e) {
  if (e.message.includes('Churnaizer')) {
    console.warn('⚠️ Churnaizer fallback logic active:', e.message);
    // Fallback logic is handled automatically by the backend
    // when AI prediction fails (sets risk_level to 'medium')
  }
});

// Run validation on page load
document.addEventListener('DOMContentLoaded', validateChurnaizerIntegration);`,
      terminal: "touch test-integration.js",
      files: ["js/integration-test.js", "test-integration.js"]
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
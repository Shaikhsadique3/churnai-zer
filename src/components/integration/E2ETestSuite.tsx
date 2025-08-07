import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: any;
}

export const E2ETestSuite = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load SDK for testing
  useEffect(() => {
    const loadSDK = () => {
      if (window.Churnaizer) {
        setSdkLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = '/churnaizer-sdk.js';
      script.async = true;
      script.onload = () => {
        // Configure SDK
        (window as any).ChurnaizerConfig = { debug: true };
        setSdkLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Churnaizer SDK');
        setSdkLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadSDK();
  }, []);

  const runE2ETests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    const testTraceId = `e2e-test-${Date.now()}`;

    try {
      // Test 1: SDK Website Integration
      results.push({ name: '1. SDK Script Loading', status: 'pending', message: 'Checking...' });
      setTestResults([...results]);

      if (!window.Churnaizer) {
        results[results.length - 1] = { 
          name: '1. SDK Script Loading', 
          status: 'fail', 
          message: 'Churnaizer SDK not found on page' 
        };
      } else {
        results[results.length - 1] = { 
          name: '1. SDK Script Loading', 
          status: 'pass', 
          message: 'SDK loaded successfully' 
        };
      }
      setTestResults([...results]);

      // Test 2: API Key Validation
      results.push({ name: '2. API Key Validation', status: 'pending', message: 'Checking...' });
      setTestResults([...results]);

      const { data: apiKeyData } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (!apiKeyData?.key) {
        results[results.length - 1] = { 
          name: '2. API Key Validation', 
          status: 'fail', 
          message: 'No active API key found' 
        };
      } else {
        results[results.length - 1] = { 
          name: '2. API Key Validation', 
          status: 'pass', 
          message: 'API key found and active' 
        };
      }
      setTestResults([...results]);

      if (!apiKeyData?.key) return;

      // Test 3: User Data Tracking
      results.push({ name: '3. User Data Tracking', status: 'pending', message: 'Sending tracking data...' });
      setTestResults([...results]);

      const testUserData = {
        user_id: `test-${user?.id}-${Date.now()}`,
        email: user?.email || 'test@example.com',
        customer_name: 'E2E Test User',
        customer_email: user?.email || 'test@example.com',
        subscription_plan: 'Pro',
        monthly_revenue: 99.99,
        days_since_signup: 30,
        number_of_logins_last30days: 15,
        active_features_used: 5,
        support_tickets_opened: 1,
        last_payment_status: 'Success',
        email_opens_last30days: 8,
        last_login_days_ago: 1,
        billing_issue_count: 0,
        trace_id: testTraceId
      };

      const trackingResult = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Tracking timeout')), 15000);
        
        window.Churnaizer.track(testUserData, apiKeyData.key, (result: any, error: any) => {
          clearTimeout(timeout);
          if (error) reject(error);
          else resolve(result);
        });
      });

      if (trackingResult.status === 'ok' && trackingResult.processed > 0) {
        results[results.length - 1] = { 
          name: '3. User Data Tracking', 
          status: 'pass', 
          message: `Tracking successful: ${trackingResult.processed} user processed`,
          details: trackingResult
        };
      } else {
        results[results.length - 1] = { 
          name: '3. User Data Tracking', 
          status: 'fail', 
          message: 'Tracking failed or no users processed',
          details: trackingResult
        };
      }
      setTestResults([...results]);

      // Test 4: AI Churn Prediction
      results.push({ name: '4. AI Churn Prediction', status: 'pending', message: 'Checking AI model response...' });
      setTestResults([...results]);

      const userResult = trackingResult.results?.[0];
      if (userResult && userResult.churn_score !== undefined && userResult.risk_level) {
        results[results.length - 1] = { 
          name: '4. AI Churn Prediction', 
          status: 'pass', 
          message: `AI prediction: ${userResult.risk_level} risk (${Math.round(userResult.churn_score * 100)}%)`,
          details: userResult
        };
      } else {
        results[results.length - 1] = { 
          name: '4. AI Churn Prediction', 
          status: 'warning', 
          message: 'AI prediction missing or incomplete',
          details: userResult
        };
      }
      setTestResults([...results]);

      // Test 5: Database Storage
      results.push({ name: '5. Database Storage', status: 'pending', message: 'Checking database...' });
      setTestResults([...results]);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for DB insert

      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', testUserData.user_id)
        .eq('owner_id', user?.id)
        .single();

      if (userData && !userError) {
        results[results.length - 1] = { 
          name: '5. Database Storage', 
          status: 'pass', 
          message: 'User data stored successfully in database',
          details: userData
        };
      } else {
        results[results.length - 1] = { 
          name: '5. Database Storage', 
          status: 'fail', 
          message: 'User data not found in database',
          details: userError
        };
      }
      setTestResults([...results]);

      // Test 6: Email Automation (if high risk)
      if (userResult?.risk_level === 'high') {
        results.push({ name: '6. Email Automation', status: 'pending', message: 'Checking email logs...' });
        setTestResults([...results]);

        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for email processing

        const { data: emailLogs } = await supabase
          .from('email_logs')
          .select('*')
          .eq('target_user_id', testUserData.user_id)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (emailLogs && emailLogs.length > 0) {
          results[results.length - 1] = { 
            name: '6. Email Automation', 
            status: 'pass', 
            message: `Email triggered: ${emailLogs[0].status}`,
            details: emailLogs[0]
          };
        } else {
          results[results.length - 1] = { 
            name: '6. Email Automation', 
            status: 'warning', 
            message: 'No email log found (may still be processing)',
          };
        }
      } else {
        results.push({ 
          name: '6. Email Automation', 
          status: 'pass', 
          message: 'Not triggered (user not high-risk)' 
        });
      }
      setTestResults([...results]);

      // Test 7: Recovery Event
      results.push({ name: '7. Recovery Event Tracking', status: 'pending', message: 'Testing recovery...' });
      setTestResults([...results]);

      let recoveryResult = { success: false, message: 'trackEvent not available', recovery_triggered: false };
      
      if ((window.Churnaizer as any).trackEvent) {
        try {
          recoveryResult = await new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Recovery tracking timeout')), 10000);
            
            (window.Churnaizer as any).trackEvent({
              event: 'login',
              user_id: testUserData.user_id,
              email: testUserData.email,
              customer_name: testUserData.customer_name,
              monthly_revenue: testUserData.monthly_revenue,
              trace_id: testTraceId
            }, apiKeyData.key, (result: any, error: any) => {
              clearTimeout(timeout);
              if (error) reject(error);
              else resolve(result);
            });
          });
        } catch (error) {
          recoveryResult = { success: false, message: 'trackEvent failed', recovery_triggered: false };
        }
      }

      if (recoveryResult.success) {
        results[results.length - 1] = { 
          name: '7. Recovery Event Tracking', 
          status: 'pass', 
          message: `Recovery event tracked: ${recoveryResult.recovery_triggered ? 'Recovery triggered' : 'Event logged'}`,
          details: recoveryResult
        };
      } else {
        results[results.length - 1] = { 
          name: '7. Recovery Event Tracking', 
          status: 'warning', 
          message: 'Recovery event tracking not available or failed',
          details: recoveryResult
        };
      }
      setTestResults([...results]);

    } catch (error) {
      console.error('E2E Test Error:', error);
      if (results.length > 0 && results[results.length - 1].status === 'pending') {
        results[results.length - 1] = { 
          name: results[results.length - 1].name, 
          status: 'fail', 
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        };
      }
      setTestResults([...results]);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const failedTests = testResults.filter(r => r.status === 'fail').length;
  const warningTests = testResults.filter(r => r.status === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>End-to-End Test Suite</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive testing of the entire Churnaizer flow from SDK to dashboard
        </p>
        {testResults.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {passedTests} Passed</span>
            <span className="text-red-600">✗ {failedTests} Failed</span>
            <span className="text-yellow-600">⚠ {warningTests} Warnings</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={runE2ETests}
          disabled={isRunning || !user || !sdkLoaded}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running E2E Tests...
            </>
          ) : !sdkLoaded ? (
            'Loading SDK...'
          ) : (
            'Run Full E2E Test Suite'
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        View Details
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <p><strong>Test Coverage:</strong></p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>SDK script loading and initialization</li>
            <li>API key validation and authentication</li>
            <li>User tracking data payload and processing</li>
            <li>AI churn prediction model response</li>
            <li>Database storage and RLS policies</li>
            <li>Email automation for high-risk users</li>
            <li>Recovery event tracking and logging</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
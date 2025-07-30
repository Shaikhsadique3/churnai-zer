import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle, TestTube, AlertCircle } from 'lucide-react';
import { showErrorToast, showSuccessToast, showSDKErrorToast, errorMessages } from '@/components/ui/error-toast';

interface TestResult {
  success: boolean;
  churn_probability?: number;
  risk_level?: string;
  understanding_score?: number;
  reason?: string;
  message?: string;
  error?: string;
}

export const TestIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    fetchApiKey();
  }, [user]);

  const fetchApiKey = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) setApiKey(data.key);
    } catch (error) {
      // Silently handle API key fetch errors - user will see appropriate message
    }
  };

  const runIntegrationTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // 1. Check if SDK is loaded
      if (!window.Churnaizer) {
        throw new Error(errorMessages.sdkNotFound);
      }

      // 2. Check if user is logged in
      if (!user) {
        throw new Error('Please sign in to test the integration.');
      }

      // 3. Check if API key is available
      if (!apiKey) {
        throw new Error(errorMessages.apiKeyMissing);
      }

      // 4. Prepare real user data
      const userData = {
        user_id: user.id,
        email: user.email || '',
        customer_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
        customer_email: user.email || '',
        subscription_plan: 'Pro', // Default for testing
        monthly_revenue: 29.99,
        loginCount: 1,
        dashboardViews: 1,
        feature_usage: {
          dashboard: 1,
          reports: 0,
          settings: 0
        },
        days_since_signup: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        number_of_logins_last30days: 1,
        active_features_used: 1,
        support_tickets_opened: 0,
        last_payment_status: 'success',
        email_opens_last30days: 0,
        last_login_days_ago: 0,
        billing_issue_count: 0
      };

      // 5. Call the SDK with real data
      const result = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SDK request timeout'));
        }, 10000);

        window.Churnaizer.track(userData, apiKey, (error: any, result: any) => {
          clearTimeout(timeout);
          if (error) {
            reject(new Error(error.message || 'SDK tracking request failed'));
          } else {
            resolve(result);
          }
        });
      });

      // 6. Validate response
      if (!result.churn_probability || !result.risk_level) {
        throw new Error('Invalid response from SDK');
      }

      const successResult = {
        success: true,
        ...result
      };
      
      setTestResult(successResult);
      
      showSuccessToast(
        "SDK Integration Successful",
        `Risk Level: ${result.risk_level} | Churn Probability: ${Math.round(result.churn_probability * 100)}%`
      );

    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      setTestResult(errorResult);
      
      showSDKErrorToast(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can test
  const canTest = user && apiKey;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center space-x-2">
        <TestTube className="h-4 w-4 md:h-5 md:w-5" />
        <h3 className="text-base md:text-lg font-semibold">Live SDK Test</h3>
      </div>
      
      <p className="text-xs md:text-sm text-muted-foreground">
        Test your SDK integration with real user data to verify everything works correctly.
      </p>

      {!canTest && (
        <div className="p-3 rounded-lg bg-muted border border-border">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs md:text-sm text-muted-foreground">
              {!user ? 'Please sign in to test the integration.' : 'API key not found. Please refresh the page.'}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button 
          onClick={runIntegrationTest}
          disabled={isLoading || !canTest}
          className="w-full text-xs md:text-sm py-2 md:py-3"
          variant={canTest ? "default" : "secondary"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
              Testing Live Integration...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Test Live Integration
            </>
          )}
        </Button>

        {testResult && (
          <div className={`p-3 md:p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-secondary/5 border-secondary/20' 
              : 'bg-destructive/5 border-destructive/20'
          }`}>
            <div className="flex items-start space-x-2">
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-secondary mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 md:h-5 md:w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`text-sm md:text-base font-medium ${
                  testResult.success ? 'text-secondary' : 'text-destructive'
                }`}>
                  {testResult.success ? 'Integration Test Passed' : 'Integration Test Failed'}
                </h4>
                
                {testResult.success ? (
                  <div className="mt-2 text-xs md:text-sm text-secondary space-y-1">
                    <p><strong>Risk Level:</strong> {testResult.risk_level}</p>
                    <p><strong>Churn Probability:</strong> {Math.round((testResult.churn_probability || 0) * 100)}%</p>
                    <p><strong>Understanding Score:</strong> {testResult.understanding_score}</p>
                    <p><strong>Reason:</strong> {testResult.reason}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-xs md:text-sm text-destructive">
                    {testResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-muted rounded-lg">
        <h4 className="text-sm md:text-base font-medium mb-2">What this live test does:</h4>
        <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
          <li>• Checks if SDK script is loaded on current page</li>
          <li>• Uses your real user data and API key</li>
          <li>• Sends live tracking request to Churnaizer</li>
          <li>• Validates complete API response structure</li>
          <li>• Shows actual churn risk assessment for your account</li>
        </ul>
      </div>
    </div>
  );
};
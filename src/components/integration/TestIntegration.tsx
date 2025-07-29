import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, TestTube } from 'lucide-react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const runIntegrationTest = () => {
    setIsLoading(true);
    setTestResult(null);

    // Create iframe for test
    const iframe = document.createElement('iframe');
    iframe.src = window.location.origin + '/test.html';
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    
    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      // Validate origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      const result = event.data as TestResult;
      
      setIsLoading(false);
      setTestResult(result);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (result.success) {
        toast({
          title: "✅ Integration Test Passed",
          description: `SDK working correctly. Risk level: ${result.risk_level}, Score: ${Math.round((result.churn_probability || 0) * 100)}%`,
        });
      } else {
        toast({
          title: "❌ Integration Test Failed", 
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }

      // Clean up
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      window.removeEventListener('message', handleMessage);
    };

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setTestResult({ success: false, error: 'Test timeout - SDK not responding' });
      
      toast({
        title: "❌ Test Timeout",
        description: "SDK test took too long to respond",
        variant: "destructive",
      });

      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      window.removeEventListener('message', handleMessage);
    }, 10000); // 10 second timeout

    window.addEventListener('message', handleMessage);
    document.body.appendChild(iframe);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <TestTube className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Test Integration</h3>
      </div>
      
      <p className="text-muted-foreground">
        Test your SDK integration with mock data to ensure everything is working correctly.
      </p>

      <div className="space-y-4">
        <Button 
          onClick={runIntegrationTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Integration...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Run Integration Test
            </>
          )}
        </Button>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Integration Test Passed' : 'Integration Test Failed'}
                </h4>
                
                {testResult.success ? (
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Risk Level:</strong> {testResult.risk_level}</p>
                    <p><strong>Churn Probability:</strong> {Math.round((testResult.churn_probability || 0) * 100)}%</p>
                    <p><strong>Understanding Score:</strong> {testResult.understanding_score}</p>
                    <p><strong>Reason:</strong> {testResult.reason}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-red-700">
                    {testResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">What this test does:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Loads SDK in isolated iframe environment</li>
          <li>• Sends mock user data with test API key</li>
          <li>• Validates API response structure</li>
          <li>• Confirms all required fields are present</li>
          <li>• Reports success/failure with detailed results</li>
        </ul>
      </div>
    </div>
  );
};
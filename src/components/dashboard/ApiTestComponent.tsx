import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { testChurnApiConnection } from "@/lib/churnApi";

export const ApiTestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testChurnApiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        connected: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test your churn prediction API connection to ensure everything is working correctly.
        </p>
        
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test API Connection'
          )}
        </Button>
        
        {testResult && (
          <Alert variant={testResult.connected ? "default" : "destructive"}>
            {testResult.connected ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="font-medium">
                {testResult.connected ? '✅ Connection Successful' : '❌ Connection Failed'}
              </div>
              <div className="text-sm mt-1">
                {testResult.message}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
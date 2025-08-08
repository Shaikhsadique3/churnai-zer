
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SDKCheckResult {
  status: "idle" | "running" | "success" | "error";
  message: string;
  details?: {
    domain: string;
    apiKey: string;
    churnScore?: number;
    riskLevel?: string;
    churnReason?: string;
    emailSent?: boolean;
    traceId?: string;
  };
}

export const SmartIntegrationTest: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>("");
  const [result, setResult] = useState<SDKCheckResult>({ status: "idle", message: "" });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("api_keys")
        .select("key")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.key) setApiKey(data.key);
    };
    fetchApiKey();
  }, [user]);

  const checkSDKIntegration = async () => {
    if (!user) {
      toast.error("Please sign in to check SDK integration");
      return;
    }

    if (!apiKey) {
      toast.error("API key not found. Please generate one first.");
      return;
    }

    setRunning(true);
    setResult({ status: "running", message: "✅ Churnaizer SDK initialized\n📡 Sending user behavior data..." });

    try {
      // Get the founder's website from their profile
      const { data: profile } = await supabase
        .from("founder_profile")
        .select("company_website")
        .eq("user_id", user.id)
        .single();

      const website = profile?.company_website;
      if (!website) {
        throw new Error("Please add your company website in your founder profile first.");
      }

      // Clean and validate URL
      let checkUrl = website;
      if (!checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
        checkUrl = 'https://' + checkUrl;
      }

      // Generate a unique trace ID for this test
      const traceId = `sdk_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create hidden iframe to test the SDK
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.src = checkUrl;
      document.body.appendChild(iframe);

      // Set up timeout for the entire test
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        setResult({
          status: "error",
          message: "❌ SDK script not found or blocked by CORS\n💡 Make sure the SDK is installed in your website's <head> section"
        });
        setRunning(false);
      }, 15000); // 15 second timeout

      // Listen for SDK test completion
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'CHURNAIZER_SDK_TEST_RESULT') {
          clearTimeout(timeout);
          window.removeEventListener("message", messageHandler);
          document.body.removeChild(iframe);

          const testResult = event.data.result;
          
          if (testResult.success) {
            setResult({
              status: "success",
              message: `✅ SDK Connected\n✅ User Tracked\n🎯 Prediction: ${testResult.riskLevel || 'Medium'} Risk ${testResult.churnReason?.includes('fallback') ? '(Fallback)' : '(AI)'}\n${testResult.emailSent ? '✉️ Email Sent' : '📧 Email Ready'}`,
              details: {
                domain: testResult.domain,
                apiKey: testResult.apiKeyUsed ? 'Active ✅' : 'Missing ❌',
                churnScore: testResult.churnScore,
                riskLevel: testResult.riskLevel,
                churnReason: testResult.churnReason,
                emailSent: testResult.emailSent,
                traceId: testResult.traceId
              }
            });

            toast.success(`🎉 SDK verification successful on ${testResult.domain}!`);

            // Log successful integration test
            supabase.from("integration_test_results").insert({
              founder_id: user.id,
              domain: testResult.domain,
              api_key: apiKey,
              churn_score: testResult.churnScore,
              risk_level: testResult.riskLevel
            });

          } else {
            let errorMessage = "❌ SDK Integration Failed";
            
            // Provide specific error messages based on failure type
            if (testResult.error?.includes('not found')) {
              errorMessage = "❌ SDK script not found on your website\n💡 Add the SDK script to your website's <head> section";
            } else if (testResult.error?.includes('API key')) {
              errorMessage = "❌ API key not configured\n💡 Set window.__CHURNAIZER_API_KEY__ = 'your-key'";
            } else if (testResult.error?.includes('track')) {
              errorMessage = "❌ SDK track function failed\n💡 Check browser console for errors";
            } else if (testResult.error?.includes('response')) {
              errorMessage = "❌ Backend not responding\n💡 Check your internet connection";
            }

            setResult({
              status: "error",
              message: errorMessage,
              details: {
                domain: testResult.domain || 'Unknown',
                apiKey: 'Not Configured',
              }
            });
          }
          
          setRunning(false);
        }
      };

      window.addEventListener("message", messageHandler);

      // Wait for iframe to load, then trigger SDK test
      iframe.onload = () => {
        setTimeout(() => {
          try {
            // Send test command to the iframe
            iframe.contentWindow?.postMessage({
              type: 'CHURNAIZER_SDK_TEST',
              apiKey: apiKey,
              traceId: traceId
            }, "*");
          } catch (error) {
            console.warn("Cross-origin postMessage expected for external sites");
          }
        }, 2000); // Wait 2 seconds for SDK to load
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);
        document.body.removeChild(iframe);
        setResult({
          status: "error",
          message: "❌ Unable to access your website\n💡 Check the URL in your founder profile"
        });
        setRunning(false);
      };

    } catch (error: any) {
      setResult({
        status: "error",
        message: error.message || "❌ Failed to test SDK integration"
      });
      setRunning(false);
    }
  };

  const disabled = running || !user || !apiKey;

  return (
    <section aria-labelledby="sdk-integration-check" className="space-y-3 md:space-y-4">
      <h3 id="sdk-integration-check" className="text-base md:text-lg font-semibold">
        🔍 Check SDK Integration
      </h3>
      <p className="text-xs md:text-sm text-muted-foreground">
        Test your complete SDK integration by sending a live tracking event to validate your setup.
      </p>

      <Button 
        onClick={checkSDKIntegration} 
        disabled={disabled} 
        className="w-full md:w-auto" 
        size="lg"
      >
        {running ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Testing SDK Integration...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Check SDK Integration
          </>
        )}
      </Button>

      {!user && (
        <p className="text-sm text-muted-foreground">Please sign in to check your SDK integration.</p>
      )}

      {user && !apiKey && (
        <p className="text-sm text-muted-foreground">Please generate an API key first in the Quick Setup tab.</p>
      )}

      {/* Result Display */}
      {result.status !== "idle" && (
        <Card className="mt-3 md:mt-4">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              {result.status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : result.status === "error" ? (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              ) : (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin flex-shrink-0" />
              )}
              
              <div className="flex-1 space-y-2">
                <pre className="text-sm font-medium whitespace-pre-wrap">{result.message}</pre>
                
                {result.status === "success" && result.details && (
                  <div className="text-sm text-muted-foreground space-y-1 mt-3">
                    <p><strong>Website:</strong> {result.details.domain}</p>
                    <p><strong>API Key:</strong> {result.details.apiKey}</p>
                    {result.details.churnScore !== undefined && (
                      <p><strong>Churn Score:</strong> {result.details.churnScore}</p>
                    )}
                    {result.details.riskLevel && (
                      <p><strong>Risk Level:</strong> {result.details.riskLevel}</p>
                    )}
                    {result.details.traceId && (
                      <p><strong>Trace ID:</strong> {result.details.traceId}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

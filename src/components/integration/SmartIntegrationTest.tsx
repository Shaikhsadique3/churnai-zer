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
    installed: boolean;
    apiKey: string;
    domain: string;
    version?: string;
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
    setResult({ status: "running", message: "Checking SDK integration on your website..." });

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

      // Create hidden iframe to check SDK
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = checkUrl;
      document.body.appendChild(iframe);

      // Set up timeout and message listener
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        setResult({
          status: "error",
          message: "SDK not found on your website. Please install the Churnaizer SDK."
        });
        setRunning(false);
      }, 5000);

      const messageHandler = (event: MessageEvent) => {
        if (event.data?.__CHURNAIZER_SDK_STATUS__) {
          clearTimeout(timeout);
          window.removeEventListener("message", messageHandler);
          document.body.removeChild(iframe);

          const status = event.data.__CHURNAIZER_SDK_STATUS__;
          
          if (status.installed) {
            // Check if API key matches
            const keyMatch = status.apiKey === apiKey || status.apiKey === 'not-set';
            
            setResult({
              status: "success",
              message: `✅ SDK successfully installed on ${status.domain}`,
              details: {
                installed: true,
                apiKey: status.apiKey,
                domain: status.domain,
                version: status.version
              }
            });

            if (!keyMatch && status.apiKey !== 'not-set') {
              toast.warning("API key mismatch detected. Please verify your integration code.");
            } else if (status.apiKey === 'not-set') {
              toast.info("SDK installed but API key not configured. Please follow the integration guide.");
            } else {
              toast.success("SDK integration verified successfully!");
            }

            // Log successful check to database
            supabase.from("integration_test_results").insert({
              founder_id: user.id,
              domain: status.domain,
              api_key: apiKey,
              churn_score: null,
              risk_level: 'verified'
            });

          } else {
            setResult({
              status: "error",
              message: "SDK script found but not active on your website."
            });
          }
          
          setRunning(false);
        }
      };

      window.addEventListener("message", messageHandler);

      // Wait for iframe to load then request SDK status
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.postMessage({ action: "GET_CHURNAIZER_SDK_STATUS" }, "*");
          } catch (error) {
            // Cross-origin restriction - this is expected for external sites
            console.log("Cross-origin postMessage (expected for external sites)");
          }
        }, 1000);
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);
        document.body.removeChild(iframe);
        setResult({
          status: "error",
          message: "Unable to access your website. Please check the URL in your profile."
        });
        setRunning(false);
      };

    } catch (error: any) {
      setResult({
        status: "error",
        message: error.message || "Failed to check SDK integration"
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
        Verify that the Churnaizer SDK is properly installed and configured on your website.
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
            Checking Integration...
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
                <p className="text-sm font-medium">{result.message}</p>
                
                {result.status === "success" && result.details && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Domain:</strong> {result.details.domain}</p>
                    <p><strong>API Key:</strong> {result.details.apiKey === 'not-set' ? 'Not configured' : '✅ Configured'}</p>
                    {result.details.version && (
                      <p><strong>SDK Version:</strong> {result.details.version}</p>
                    )}
                  </div>
                )}

                {result.status === "error" && (
                  <div className="text-sm text-muted-foreground">
                    <p>Make sure you have:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Added the SDK script to your website</li>
                      <li>Configured your API key correctly</li>
                      <li>Updated your website URL in your founder profile</li>
                    </ul>
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
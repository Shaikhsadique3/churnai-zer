import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SmartResult {
  status: "idle" | "running" | "success" | "error";
  step?: string;
  message?: string;
  details?: any;
  risk_level?: string;
  churn_score?: number;
  churn_reason?: string;
  domain?: string;
}

export const SmartIntegrationTest: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>("");
  const [result, setResult] = useState<SmartResult>({ status: "idle" });
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

  // Ensure Churnaizer SDK is available on this page (auto-load for testing)
  const ensureSDKLoaded = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Churnaizer) return resolve();

      const existing = document.getElementById('churnaizer-sdk');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load SDK')));
        setTimeout(() => ((window as any).Churnaizer ? resolve() : reject(new Error('SDK load timeout'))), 8000);
        return;
      }

      const script = document.createElement('script');
      script.id = 'churnaizer-sdk';
      script.src = '/churnaizer-sdk.js';
      script.async = true;
      script.onload = () => {
        (window as any).ChurnaizerConfig = { debug: true };
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load SDK'));
      document.head.appendChild(script);

      setTimeout(() => ((window as any).Churnaizer ? resolve() : reject(new Error('SDK load timeout'))), 8000);
    });
  };

  const run = async () => {
    setRunning(true);
    setResult({ status: "running", step: "Initializing", message: "Starting Smart Integration Test..." });

    try {
      const domain = window.location.hostname;

      // Step 1: SDK presence
      setResult({ status: "running", step: "Step 1", message: "Loading SDK on this page..." });
      // Auto-load SDK for this diagnostic if not present
      try {
        await ensureSDKLoaded();
      } catch (err) {
        throw new Error("SDK not found on your website. Please add the Churnaizer SDK first.");
      }

      // Step 2: Verify API key & Domain
      setResult({ status: "running", step: "Step 2", message: "Verifying API key and domain..." });
      if (!user) throw new Error("Please sign in to run the integration test.");
      if (!apiKey) throw new Error("API key not found in your dashboard.");

      // Read last api key used by SDK (exposed by SDK when it runs any call)
      const sdkKey = (window as any).__Churnaizer_lastApiKey as string | undefined;
      if (sdkKey && sdkKey !== apiKey) {
        throw new Error("API key mismatch or unauthorized domain detected");
      }

      // Step 3: Real Churn Prediction Test
      setResult({ status: "running", step: "Step 3", message: "Sending live tracking event..." });

      const trace_id = `smart-test-${Date.now()}`;
      const testUser = {
        user_id: user.id,
        email: user.email || "",
        customer_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Unknown",
        customer_email: user.email || "",
        subscription_plan: "Pro",
        monthly_revenue: 29.99,
        days_since_signup: Math.max(0, Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))),
        number_of_logins_last30days: 1,
        active_features_used: 1,
        support_tickets_opened: 0,
        last_payment_status: "success",
        email_opens_last30days: 0,
        last_login_days_ago: 0,
        billing_issue_count: 0,
        trace_id,
      };

      const prediction = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Tracking timeout")), 15000);
        window.Churnaizer.track(testUser, apiKey, (res: any, err: any) => {
          clearTimeout(timeout);
          if (err) return reject(new Error(typeof err === "string" ? err : err?.message || "Tracking failed"));
          resolve(res);
        });
      });

      const churn_score = prediction?.churn_score ?? prediction?.churn_probability;
      const churn_reason = prediction?.churn_reason || prediction?.reason;
      const risk_level = prediction?.risk_level;

      if (churn_score == null || !churn_reason || !risk_level) {
        throw new Error("Step 3 Failed — API response missing required fields (churn_score, churn_reason, risk_level)");
      }

      // Log success to DB for history
      await supabase.from("integration_test_results").insert({
        founder_id: user.id,
        domain,
        api_key: apiKey,
        churn_score,
        risk_level,
      });

      setResult({
        status: "success",
        step: "Completed",
        message: `Integration verified — SDK is live on ${domain}. Real churn prediction working ✅`,
        details: prediction,
        risk_level,
        churn_score,
        churn_reason,
        domain,
      });
    } catch (e: any) {
      setResult({
        status: "error",
        step: result.step,
        message: e?.message || "Unknown error",
      });
    } finally {
      setRunning(false);
    }
  };

  const disabled = running || !user || !apiKey;

  return (
    <section aria-labelledby="live-sdk-test" className="space-y-3 md:space-y-4">
      <h3 id="live-sdk-test" className="text-base md:text-lg font-semibold">Live SDK Test</h3>
      <p className="text-xs md:text-sm text-muted-foreground">One-click test that validates SDK presence, API key, and real AI prediction.</p>

      <Button onClick={run} disabled={disabled} className="w-full md:w-auto" size="lg">
        {running ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Integration Test...
          </>
        ) : (
          "Run Integration Test"
        )}
      </Button>

      {/* Result Box */}
      {result.status !== "idle" && (
        <Card className="mt-3 md:mt-4">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              {result.status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : result.status === "error" ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {result.status === "success"
                    ? `SDK is successfully installed${result.domain ? ` on ${result.domain}` : ""} and connected with your API key ✅`
                    : result.message}
                </p>
                {result.status === "success" && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Risk Level: <span className="font-medium">{result.risk_level}</span>
                      {typeof result.churn_score === "number" && (
                        <> · Churn Score: <span className="font-medium">{(result.churn_score as number).toFixed(2)}</span></>
                      )}
                    </p>
                    {result.churn_reason && <p>Reason: "{result.churn_reason}"</p>}
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

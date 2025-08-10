
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code, CopyCheck, Link, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const IntegrationPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [integrationStatus, setIntegrationStatus] = useState<{
    status: 'unknown' | 'success' | 'fail';
    lastCheck?: string;
    website?: string;
    loading: boolean;
  }>({ status: 'unknown', loading: true });

  // Fetch API key
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('api_keys')
          .select('key')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setApiKey(data.key);
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
  }, [user]);

  // Check integration status
  useEffect(() => {
    const checkIntegrationStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('integrations')
          .select('*')
          .eq('founder_id', user.id)
          .eq('status', 'success')
          .order('checked_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setIntegrationStatus({
            status: 'success',
            lastCheck: data.checked_at,
            website: data.website,
            loading: false
          });
        } else {
          setIntegrationStatus({
            status: 'fail',
            loading: false
          });
        }
      } catch (error) {
        console.error('Error checking integration status:', error);
        setIntegrationStatus({
          status: 'unknown',
          loading: false
        });
      }
    };

    checkIntegrationStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkIntegrationStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const embedCode = `<!-- Churnaizer SDK Integration -->
<script>
  window.churnaizer = window.churnaizer || function () {
    (window.churnaizer.q = window.churnaizer.q || []).push(arguments);
  };

  // API key from Churnaizer Dashboard
  window.__CHURNAIZER_API_KEY__ = "${apiKey || 'YOUR_API_KEY_HERE'}";

  // Identify the user (replace with real user ID from app)
  churnaizer('identify', 'USER_ID');

  // Example event (replace or add more based on usage)
  churnaizer('track', 'feature_used', { feature_name: 'dashboard' });

  // Automatic SDK Integration Check
  window.addEventListener("load", function () {
    try {
      fetch("https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/sdk-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": window.__CHURNAIZER_API_KEY__
        },
        body: JSON.stringify({
          test: true,
          website: window.location.hostname,
          user_id: "USER_ID"
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "ok") {
          console.log(\`✅ Churnaizer SDK integration confirmed for \${window.location.hostname}\`);
        } else {
          console.warn("⚠️ Churnaizer SDK integration check failed:", data);
        }
      })
      .catch(err => {
        console.error("❌ SDK integration check error:", err);
      });
    } catch (e) {
      console.error("❌ SDK auto-check failed to run:", e);
    }
  });
</script>

<!-- Load the Churnaizer SDK -->
<script async src="https://churnaizer.com/churnaizer-sdk.js"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Enhanced embed code copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshStatus = async () => {
    setIntegrationStatus(prev => ({ ...prev, loading: true }));
    
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('integrations')
        .select('*')
        .eq('founder_id', user.id)
        .eq('status', 'success')
        .order('checked_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setIntegrationStatus({
          status: 'success',
          lastCheck: data.checked_at,
          website: data.website,
          loading: false
        });
      } else {
        setIntegrationStatus({
          status: 'fail',
          loading: false
        });
      }
    } catch (error) {
      console.error('Error refreshing integration status:', error);
      setIntegrationStatus({
        status: 'unknown',
        loading: false
      });
    }
  };

  const getStatusBadge = () => {
    if (integrationStatus.loading) {
      return (
        <Badge variant="secondary" className="gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Checking...
        </Badge>
      );
    }

    switch (integrationStatus.status) {
      case 'success':
        return (
          <Badge variant="default" className="gap-2 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-4 w-4" />
            Integration Confirmed
          </Badge>
        );
      case 'fail':
        return (
          <Badge variant="destructive" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            SDK Not Detected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Status Unknown
          </Badge>
        );
    }
  };

  return (
    <PageLayout 
      title="Website Integration" 
      description="Integrate Churnaizer with your website and track user behavior"
      icon={<Code className="h-8 w-8 text-primary" />}
    >
      {/* Integration Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                SDK Integration Status
                {getStatusBadge()}
              </CardTitle>
              <CardDescription>
                {integrationStatus.status === 'success' && integrationStatus.lastCheck && (
                  <>
                    Last confirmed: {new Date(integrationStatus.lastCheck).toLocaleString()}
                    {integrationStatus.website && ` on ${integrationStatus.website}`}
                  </>
                )}
                {integrationStatus.status === 'fail' && (
                  'No successful integration detected. Follow the setup guide below.'
                )}
                {integrationStatus.status === 'unknown' && (
                  'Unable to determine integration status. Check your connection.'
                )}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshStatus} disabled={integrationStatus.loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${integrationStatus.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5" />
            Enhanced Integration Guide
          </CardTitle>
          <CardDescription>
            Add the enhanced Churnaizer script to your website for automatic integration verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="snippet">Enhanced Embed Code (v1.1.0)</Label>
            <Textarea
              id="snippet"
              value={embedCode}
              readOnly
              rows={12}
              className="font-mono text-sm resize-none"
            />
            <Button size="sm" onClick={handleCopy} disabled={copied}>
              {copied ? (
                <>
                  <CopyCheck className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Copy Enhanced Code
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-900 mb-2">✨ What's New in v1.1.0:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Auto Integration Check:</strong> Automatically verifies SDK connection on page load</li>
              <li>• <strong>Real-time Status:</strong> Dashboard shows live integration status</li>
              <li>• <strong>Admin Logging:</strong> All integration attempts logged for monitoring</li>
              <li>• <strong>Console Feedback:</strong> Clear success/error messages in browser console</li>
              <li>• <strong>No Manual Testing:</strong> Integration status updates automatically</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Setup Instructions</Label>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Copy the enhanced embed code above (your API key is already included)</li>
              <li>Paste it into the <code>&lt;head&gt;</code> section of your website's HTML</li>
              <li>Replace <code>"USER_ID"</code> with the actual unique identifier for each user</li>
              <li>Add custom tracking events using <code>churnaizer('track', 'event_name', data)</code></li>
              <li>Check your browser console for integration confirmation messages</li>
              <li>The status above will automatically update when integration is detected</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label>Console Messages You'll See:</Label>
            <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
              <div className="text-green-400">✅ Churnaizer SDK integration confirmed for yoursite.com</div>
              <div className="text-yellow-400 mt-1">⚠️ Churnaizer SDK integration check failed: Invalid API key</div>
              <div className="text-red-400 mt-1">❌ SDK integration check error: Network error</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Troubleshooting</Label>
            <div className="text-sm space-y-2">
              <p><strong>Status shows "SDK Not Detected":</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check that the script is properly added to your website</li>
                <li>Verify your API key is correctly set</li>
                <li>Ensure CORS is not blocking the integration check</li>
                <li>Check browser console for error messages</li>
              </ul>
              
              <p className="mt-3"><strong>CORS Issues:</strong></p>
              <p>If you see CORS errors, the tracking will still work, but status updates may be delayed. This is normal for some hosting environments.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Link className="h-4 w-4 mr-2" />
              <a href="https://app.churnaizer.com/docs" target="_blank" rel="noopener noreferrer">
                View Full Documentation
              </a>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default IntegrationPage;

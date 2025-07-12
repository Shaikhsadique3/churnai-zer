import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CRMSettings {
  crm_webhook_url?: string;
  crm_api_key?: string;
  is_crm_connected?: boolean;
}

export const CRMIntegrationPanel = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current CRM settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['crm-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('integration_settings')
        .select('crm_webhook_url, crm_api_key, is_crm_connected')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CRMSettings;
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setWebhookUrl(settings.crm_webhook_url || '');
      setApiKey(settings.crm_api_key || '');
    }
  }, [settings]);

  // Save CRM settings mutation
  const saveMutation = useMutation({
    mutationFn: async ({ webhookUrl, apiKey }: { webhookUrl: string; apiKey: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          user_id: user.id,
          crm_webhook_url: webhookUrl.trim() || null,
          crm_api_key: apiKey.trim() || null,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-settings'] });
      toast({
        title: "Settings Saved",
        description: "Your CRM webhook settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save CRM settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Test ping mutation
  const testMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/notify-crm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'ping'
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Test failed');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-settings'] });
      toast({
        title: "Test Successful ✅",
        description: data.message || "CRM webhook test completed successfully!",
      });
    },
    onError: (error) => {
      console.error('Test error:', error);
      toast({
        title: "Test Failed ❌",
        description: error.message || "Failed to connect to your CRM webhook.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a webhook URL.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(webhookUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid webhook URL.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({ webhookUrl, apiKey });
  };

  const handleTestPing = () => {
    if (!settings?.crm_webhook_url) {
      toast({
        title: "No Webhook URL",
        description: "Please save your webhook URL first before testing.",
        variant: "destructive",
      });
      return;
    }

    testMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM Integration</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              CRM Integration
              {settings?.is_crm_connected ? (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <X className="h-3 w-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Connect your CRM system (Zapier, HubSpot, etc.) to receive churn alerts and automate workflows.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL *</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              The webhook URL where churn events will be sent
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key (Optional)</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your CRM API key if required"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Optional authentication key for your CRM system
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleTestPing}
              disabled={testMutation.isPending || !settings?.crm_webhook_url}
              className="flex-1"
            >
              {testMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Test Ping
            </Button>
          </div>
        </form>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">How it works:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• When a user reaches high churn risk, we'll send a webhook to your CRM</p>
            <p>• Payload includes user email, churn score, and risk level</p>
            <p>• Use this to trigger automated workflows like tagging or email campaigns</p>
          </div>
          
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => window.open('https://zapier.com/apps/webhook/help', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Learn about Zapier webhooks
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
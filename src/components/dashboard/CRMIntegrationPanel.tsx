import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Webhook, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface IntegrationSettings {
  email_provider?: string;
  email_api_key?: string;
  sender_name?: string;
  sender_email?: string;
  webhook_url?: string;
  status?: string;
}

const CRMIntegrationPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<IntegrationSettings>({});
  const [loading, setLoading] = useState({
    testEmail: false,
    testWebhook: false,
    save: false,
    load: true,
  });
  const [connectionStatus, setConnectionStatus] = useState({
    email: false,
    webhook: false,
  });

  // Load existing settings
  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    try {
      // Get the most recent settings record for this user
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setSettings(data);
        setConnectionStatus({
          email: !!(data.email_provider && data.email_api_key),
          webhook: !!data.webhook_url,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(prev => ({ ...prev, load: false }));
    }
  };

  const testEmail = async () => {
    if (!settings.email_provider || !settings.email_api_key) {
      toast({
        title: "Missing Configuration",
        description: "Please select an email provider and enter your API key first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, testEmail: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('integration-test', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          action: 'test-email',
          settings: settings,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Email Test Successful",
          description: data.message,
        });
        setConnectionStatus(prev => ({ ...prev, email: true }));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "❌ Email Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, testEmail: false }));
    }
  };

  const testWebhook = async () => {
    if (!settings.webhook_url) {
      toast({
        title: "Missing Webhook URL",
        description: "Please enter a webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, testWebhook: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('integration-test', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          action: 'test-webhook',
          settings: settings,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Webhook Test Successful",
          description: data.message,
        });
        setConnectionStatus(prev => ({ ...prev, webhook: true }));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "❌ Webhook Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, testWebhook: false }));
    }
  };

  const saveSettings = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));

    try {
      // First, delete any existing records for this user to avoid duplicates
      await supabase
        .from('integration_settings')
        .delete()
        .eq('user_id', user.id);

      // Then insert the new settings
      const { data, error } = await supabase
        .from('integration_settings')
        .insert({
          user_id: user.id,
          email_provider: settings.email_provider || null,
          email_api_key: settings.email_api_key || null,
          sender_name: settings.sender_name || null,
          sender_email: settings.sender_email || null,
          webhook_url: settings.webhook_url || null,
          status: 'connected',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Settings Saved",
        description: "Your integration settings have been saved successfully.",
      });

      // Update local state with saved data
      if (data) {
        setSettings(data);
        setConnectionStatus({
          email: !!(data.email_provider && data.email_api_key),
          webhook: !!data.webhook_url,
        });
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        title: "❌ Save Failed",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const updateSettings = (key: keyof IntegrationSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading.load) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading Integration Settings...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          🔗 Connect CRM or Email Tools
        </CardTitle>
        <CardDescription>
          Set up email automation and webhook integrations for customer retention campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Integration Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Email Sender Settings</h3>
            {connectionStatus.email && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender_name">Sender Name</Label>
              <Input
                id="sender_name"
                placeholder="ChurnGuard"
                value={settings.sender_name || ''}
                onChange={(e) => updateSettings('sender_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender_email">Sender Email</Label>
              <Input
                id="sender_email"
                type="email"
                placeholder="noreply@yourcompany.com"
                value={settings.sender_email || ''}
                onChange={(e) => updateSettings('sender_email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_provider">Email Provider</Label>
              <Select
                value={settings.email_provider || ''}
                onValueChange={(value) => updateSettings('email_provider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="smtp">Custom SMTP</SelectItem>
                  <SelectItem value="mailchimp" disabled>Mailchimp (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_api_key">API Key</Label>
              <Input
                id="email_api_key"
                type="password"
                placeholder="Enter your API key"
                value={settings.email_api_key || ''}
                onChange={(e) => updateSettings('email_api_key', e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={testEmail} 
            disabled={loading.testEmail || !settings.email_provider || !settings.email_api_key}
            className="w-full md:w-auto"
          >
            {loading.testEmail ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Test Email
          </Button>
        </div>

        <Separator />

        {/* Webhook Integration Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Webhook className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Webhook URL</h3>
            {connectionStatus.webhook && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL (Zapier, Intercom, Custom CRM)</Label>
            <Input
              id="webhook_url"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/xyz/abc123"
              value={settings.webhook_url || ''}
              onChange={(e) => updateSettings('webhook_url', e.target.value)}
            />
          </div>

          <Button 
            onClick={testWebhook} 
            disabled={loading.testWebhook || !settings.webhook_url}
            variant="outline"
            className="w-full md:w-auto"
          >
            {loading.testWebhook ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Webhook className="h-4 w-4 mr-2" />
            )}
            Send Test Ping
          </Button>
        </div>

        <Separator />

        {/* Save Settings */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {connectionStatus.email || connectionStatus.webhook
              ? "✅ Ready for automation campaigns"
              : "⚠️ Connect at least one integration to enable automation"
            }
          </div>
          <Button 
            onClick={saveSettings} 
            disabled={loading.save}
          >
            {loading.save ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CRMIntegrationPanel;
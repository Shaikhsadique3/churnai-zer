import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle2, XCircle, Loader2, Trash2, Server } from "lucide-react";

interface SMTPProvider {
  id: string;
  provider_name?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  from_email: string;
  from_name?: string;
  is_verified: boolean;
  created_at: string;
}

interface SMTPFormData {
  provider_name: string;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  test_email: string;
}

const SMTPConfigPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<SMTPProvider[]>([]);
  const [loading, setLoading] = useState({
    load: true,
    verify: false,
    delete: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [sendTestEmail, setSendTestEmail] = useState(true);
  const [formData, setFormData] = useState<SMTPFormData>({
    provider_name: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
    test_email: '',
  });

  // Load existing SMTP providers
  useEffect(() => {
    if (user?.id) {
      loadProviders();
    }
  }, [user?.id]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('smtp_providers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading SMTP providers:', error);
      toast({
        title: "Error",
        description: "Failed to load SMTP providers",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, load: false }));
    }
  };

  const handleVerifyAndSave = async () => {
    if (!formData.smtp_host || !formData.smtp_username || !formData.smtp_password || !formData.from_email) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required SMTP fields",
        variant: "destructive",
      });
      return;
    }

    if (sendTestEmail && !formData.test_email) {
      toast({
        title: "Test Email Required",
        description: "Please provide a test email address to verify the connection",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, verify: true }));

    try {
      const { data, error } = await supabase.functions.invoke('smtp-test', {
        body: {
          action: 'verify-and-save',
          config: {
            provider_name: formData.provider_name || 'Custom SMTP',
            smtp_host: formData.smtp_host,
            smtp_port: parseInt(formData.smtp_port),
            smtp_username: formData.smtp_username,
            smtp_password: formData.smtp_password,
            from_email: formData.from_email,
            from_name: formData.from_name || formData.from_email.split('@')[0],
            test_email: formData.test_email,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ SMTP Provider Verified & Saved",
          description: sendTestEmail 
            ? `${data.message}. Check your inbox at ${formData.test_email}`
            : data.message,
        });
        setShowForm(false);
        setSendTestEmail(true);
        setFormData({
          provider_name: '',
          smtp_host: '',
          smtp_port: '587',
          smtp_username: '',
          smtp_password: '',
          from_email: '',
          from_name: '',
          test_email: '',
        });
        loadProviders();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "❌ SMTP Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, verify: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SMTP provider?')) return;

    setLoading(prev => ({ ...prev, delete: id }));

    try {
      const { error } = await supabase
        .from('smtp_providers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Provider Deleted",
        description: "SMTP provider has been removed",
      });
      loadProviders();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: '' }));
    }
  };

  const updateFormData = (key: keyof SMTPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const commonSMTPProviders = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: 587 },
    { name: 'Outlook', host: 'smtp.office365.com', port: 587 },
    { name: 'Zoho', host: 'smtp.zoho.com', port: 587 },
    { name: 'Brevo/Sendinblue', host: 'smtp-relay.brevo.com', port: 587 },
    { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587 },
  ];

  if (loading.load) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading SMTP Providers...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            SMTP Email Providers
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            + Add SMTP Provider
          </Button>
        </CardTitle>
        <CardDescription>
          Connect your own SMTP email server to send automated emails through your domain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Providers */}
        {providers.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Connected Providers</h4>
            {providers.map(provider => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${provider.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-medium">{provider.provider_name || 'Custom SMTP'}</p>
                    <p className="text-sm text-muted-foreground">{provider.from_email}</p>
                    <p className="text-xs text-muted-foreground">{provider.smtp_host}:{provider.smtp_port}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {provider.is_verified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(provider.id)}
                    disabled={loading.delete === provider.id}
                  >
                    {loading.delete === provider.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Provider Form */}
        {showForm && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add New SMTP Provider</h4>
                <Button variant="outline" onClick={() => setShowForm(false)} size="sm">
                  Cancel
                </Button>
              </div>

              {/* Quick Select Common Providers */}
              <div className="space-y-2">
                <Label>Quick Select Common Providers</Label>
                <div className="flex flex-wrap gap-2">
                  {commonSMTPProviders.map(provider => (
                    <Button
                      key={provider.name}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateFormData('provider_name', provider.name);
                        updateFormData('smtp_host', provider.host);
                        updateFormData('smtp_port', provider.port.toString());
                      }}
                    >
                      {provider.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider_name">Provider Name (Optional)</Label>
                  <Input
                    id="provider_name"
                    placeholder="e.g., Gmail, Zoho, Custom"
                    value={formData.provider_name}
                    onChange={(e) => updateFormData('provider_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host *</Label>
                  <Input
                    id="smtp_host"
                    placeholder="smtp.gmail.com"
                    value={formData.smtp_host}
                    onChange={(e) => updateFormData('smtp_host', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port *</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    placeholder="587"
                    value={formData.smtp_port}
                    onChange={(e) => updateFormData('smtp_port', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username *</Label>
                  <Input
                    id="smtp_username"
                    placeholder="your-email@domain.com"
                    value={formData.smtp_username}
                    onChange={(e) => updateFormData('smtp_username', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password *</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    placeholder="Your app password"
                    value={formData.smtp_password}
                    onChange={(e) => updateFormData('smtp_password', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email *</Label>
                  <Input
                    id="from_email"
                    type="email"
                    placeholder="noreply@yourdomain.com"
                    value={formData.from_email}
                    onChange={(e) => updateFormData('from_email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    placeholder="Your Company"
                    value={formData.from_name}
                    onChange={(e) => updateFormData('from_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_email">Test Email {sendTestEmail ? '*' : ''}</Label>
                  <Input
                    id="test_email"
                    type="email"
                    placeholder="test@yourdomain.com"
                    value={formData.test_email}
                    onChange={(e) => updateFormData('test_email', e.target.value)}
                    disabled={!sendTestEmail}
                  />
                </div>
              </div>

              {/* Test Email Checkbox */}
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="send_test_email"
                  checked={sendTestEmail}
                  onChange={(e) => setSendTestEmail(e.target.checked)}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="send_test_email" className="text-sm">
                  ✅ Send test email and confirm delivery before saving
                </Label>
              </div>

              <Button 
                onClick={handleVerifyAndSave} 
                disabled={loading.verify}
                className="w-full"
              >
                {loading.verify ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {sendTestEmail ? 'Send Test Email & Save Provider' : 'Save SMTP Provider'}
              </Button>
            </div>
          </>
        )}

        {providers.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No SMTP providers configured yet</p>
            <p className="text-sm">Add your first SMTP provider to start sending emails through your domain</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMTPConfigPanel;

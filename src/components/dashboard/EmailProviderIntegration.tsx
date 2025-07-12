import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Send, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export const EmailProviderIntegration = () => {
  const { toast } = useToast();
  const [provider, setProvider] = useState<'resend' | 'smtp'>('resend');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    sender_email: '',
    sender_name: '',
    email_api_key: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    test_email: ''
  });

  // Load existing settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setProvider((data.email_provider as 'resend' | 'smtp') || 'resend');
        setFormData({
          sender_email: data.sender_email || '',
          sender_name: data.sender_name || '',
          email_api_key: data.email_api_key || '',
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port?.toString() || '587',
          smtp_username: data.smtp_username || '',
          smtp_password: data.smtp_password || '',
          test_email: user.email || ''
        });
      } else {
        // Set default test email to user's email
        setFormData(prev => ({ ...prev, test_email: user.email || '' }));
      }
    } catch (error) {
      console.error('Error in loadSettings:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.sender_email || !formData.sender_name || !formData.test_email) {
      toast({
        title: "Validation Error",
        description: "Please fill in sender email, sender name, and test email.",
        variant: "destructive"
      });
      return false;
    }

    if (provider === 'resend' && !formData.email_api_key) {
      toast({
        title: "Validation Error",
        description: "Please enter your Resend API key.",
        variant: "destructive"
      });
      return false;
    }

    if (provider === 'smtp') {
      if (!formData.smtp_host || !formData.smtp_port || !formData.smtp_username || !formData.smtp_password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all SMTP configuration fields.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleTestAndSave = async () => {
    if (!validateForm()) return;

    setIsTestLoading(true);
    setTestResult(null);

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Please log in to continue');
      }

      console.log('Session found, calling email-provider-test function');

      const response = await fetch(`https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/email-provider-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          provider,
          sender_email: formData.sender_email,
          sender_name: formData.sender_name,
          email_api_key: formData.email_api_key,
          smtp_host: formData.smtp_host,
          smtp_port: formData.smtp_port,
          smtp_username: formData.smtp_username,
          smtp_password: formData.smtp_password,
          test_email: formData.test_email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setTestResult(result);

      if (result.status === 'success') {
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          title: "Test Failed",
          description: result.message || 'Email test failed',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setTestResult({
        status: 'error',
        message: error.message || 'Failed to test email configuration'
      });
      toast({
        title: "Error",
        description: error.message || 'Failed to test email configuration',
        variant: "destructive"
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">📧 Email Provider Setup</h1>
        <p className="text-muted-foreground">Configure your email provider to send customer retention emails</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Provider Configuration
          </CardTitle>
          <CardDescription>
            Choose your email provider and configure the settings to start sending emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div>
            <Label className="text-base font-medium">Email Provider</Label>
            <RadioGroup 
              value={provider} 
              onValueChange={(value: 'resend' | 'smtp') => setProvider(value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="resend" id="resend" />
                <Label htmlFor="resend" className="flex items-center gap-2">
                  Resend
                  <Badge variant="secondary">Recommended</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="smtp" id="smtp" />
                <Label htmlFor="smtp">Custom SMTP</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sender_name">Sender Name *</Label>
              <Input
                id="sender_name"
                placeholder="Your Company"
                value={formData.sender_name}
                onChange={(e) => handleInputChange('sender_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sender_email">Sender Email *</Label>
              <Input
                id="sender_email"
                type="email"
                placeholder="noreply@yourdomain.com"
                value={formData.sender_email}
                onChange={(e) => handleInputChange('sender_email', e.target.value)}
              />
            </div>
          </div>

          {/* Provider-specific fields */}
          {provider === 'resend' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email_api_key">Resend API Key *</Label>
                <Input
                  id="email_api_key"
                  type="password"
                  placeholder="re_xxxxxxxx..."
                  value={formData.email_api_key}
                  onChange={(e) => handleInputChange('email_api_key', e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your API key from{' '}
                  <a 
                    href="https://resend.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Resend Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Domain Verification:</strong> Make sure to verify your sending domain in the{' '}
                  <a 
                    href="https://resend.com/domains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Resend Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {' '}for production use.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {provider === 'smtp' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host *</Label>
                  <Input
                    id="smtp_host"
                    placeholder="smtp.gmail.com"
                    value={formData.smtp_host}
                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port *</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    placeholder="587"
                    value={formData.smtp_port}
                    onChange={(e) => handleInputChange('smtp_port', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_username">SMTP Username *</Label>
                  <Input
                    id="smtp_username"
                    placeholder="your-email@domain.com"
                    value={formData.smtp_username}
                    onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password *</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    placeholder="Your SMTP password"
                    value={formData.smtp_password}
                    onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Test Email */}
          <div>
            <Label htmlFor="test_email">Test Email Address *</Label>
            <Input
              id="test_email"
              type="email"
              placeholder="test@example.com"
              value={formData.test_email}
              onChange={(e) => handleInputChange('test_email', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              We'll send a test email to this address to verify your configuration.
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert variant={testResult.status === 'success' ? 'default' : 'destructive'}>
              {testResult.status === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleTestAndSave} 
            disabled={isTestLoading}
            className="w-full"
            size="lg"
          >
            {isTestLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing & Saving...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Test & Save Configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
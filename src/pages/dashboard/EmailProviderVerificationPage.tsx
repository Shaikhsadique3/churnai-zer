import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, CheckCircle, XCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const EmailProviderVerificationPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'not-verified' | null>(null);
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    email_provider: 'Resend',
    sender_name: '',
    sender_email: '',
    email_api_key: ''
  });

  // Load existing settings on page load
  useEffect(() => {
    loadExistingSettings();
  }, []);

  const loadExistingSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (settings) {
        setFormData({
          email_provider: settings.email_provider || 'Resend',
          sender_name: settings.sender_name || '',
          sender_email: settings.sender_email || '',
          email_api_key: settings.email_api_key || ''
        });

        // Check if provider is verified (has successful email logs)
        const { data: emailLogs } = await supabase
          .from('email_logs')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'sent')
          .limit(1);

        setVerificationStatus(emailLogs && emailLogs.length > 0 ? 'verified' : 'not-verified');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email_provider, sender_name, sender_email, email_api_key } = formData;
    
    if (!email_provider || !sender_name || !sender_email || !email_api_key) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email)) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid sender email address.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setLastTestResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to continue');
      }

      // Save settings to integration_settings table
      const { error: saveError } = await supabase
        .from('integration_settings')
        .upsert({
          user_id: user.id,
          email_provider: formData.email_provider.toLowerCase(),
          sender_name: formData.sender_name,
          sender_email: formData.sender_email,
          email_api_key: formData.email_api_key,
          status: 'connected'
        }, {
          onConflict: 'user_id'
        });

      if (saveError) {
        throw new Error(`Failed to save settings: ${saveError.message}`);
      }

      // Now test the email by calling the send-email function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expired. Please log in again.');
      }

      console.log('Testing email with saved configuration...');
      
      const emailResponse = await supabase.functions.invoke('send-email', {
        body: {
          to: formData.sender_email, // Send test email to the sender email
          subject: "Test Email from Churnaizer",
          html: "<p>Hello! This is a test email from your Churnaizer app. If you received it, your integration works correctly.</p>"
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Email test response:', emailResponse);

      if (emailResponse.error) {
        throw new Error(emailResponse.error.message || 'Failed to send test email');
      }

      if (emailResponse.data?.success) {
        setLastTestResult({ success: true, message: "✅ Email sent successfully and provider verified." });
        setVerificationStatus('verified');
        toast({
          title: "Success!",
          description: "✅ Email sent successfully and provider verified.",
        });
      } else {
        throw new Error('Test email was not sent successfully');
      }

    } catch (error: any) {
      console.error('Form submission error:', error);
      const errorMessage = `❌ Email verification failed: ${error.message}`;
      setLastTestResult({ success: false, message: errorMessage });
      setVerificationStatus('not-verified');
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/integrations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Button>
        </Link>
      </div>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-foreground">📧 Email Provider Verification</h1>
        <p className="text-muted-foreground mt-2">
          Configure and verify your email provider to start sending customer retention emails.
        </p>
      </div>

      {/* Verification Status */}
      {verificationStatus && (
        <Alert variant={verificationStatus === 'verified' ? 'default' : 'destructive'}>
          {verificationStatus === 'verified' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <strong>Status:</strong> {verificationStatus === 'verified' ? 'Verified' : 'Not Verified'}
            {verificationStatus === 'verified' && ' - Your email provider is working correctly!'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Provider Configuration
          </CardTitle>
          <CardDescription>
            Configure your email provider settings and verify the connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Provider Dropdown */}
          <div>
            <Label htmlFor="email_provider">Email Provider *</Label>
            <Select value={formData.email_provider} onValueChange={(value) => handleInputChange('email_provider', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select email provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Resend">
                  <div className="flex items-center gap-2">
                    Resend
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="SendGrid">SendGrid</SelectItem>
                <SelectItem value="Mailgun">Mailgun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sender Name */}
          <div>
            <Label htmlFor="sender_name">Sender Name *</Label>
            <Input
              id="sender_name"
              placeholder="Your Company Name"
              value={formData.sender_name}
              onChange={(e) => handleInputChange('sender_name', e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Sender Email */}
          <div>
            <Label htmlFor="sender_email">Sender Email *</Label>
            <Input
              id="sender_email"
              type="email"
              placeholder="noreply@yourdomain.com"
              value={formData.sender_email}
              onChange={(e) => handleInputChange('sender_email', e.target.value)}
              className="mt-2"
            />
          </div>

          {/* API Key */}
          <div>
            <Label htmlFor="email_api_key">API Key *</Label>
            <Input
              id="email_api_key"
              type="password"
              placeholder={
                formData.email_provider === 'Resend' ? 're_xxxxxxxx...' :
                formData.email_provider === 'SendGrid' ? 'SG.xxxxxxxx...' :
                'API key'
              }
              value={formData.email_api_key}
              onChange={(e) => handleInputChange('email_api_key', e.target.value)}
              className="mt-2"
            />
            {formData.email_provider === 'Resend' && (
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
            )}
            {formData.email_provider === 'SendGrid' && (
              <p className="text-sm text-muted-foreground mt-1">
                Get your API key from{' '}
                <a 
                  href="https://app.sendgrid.com/settings/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  SendGrid Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
            {formData.email_provider === 'Mailgun' && (
              <p className="text-sm text-muted-foreground mt-1">
                Get your API key from{' '}
                <a 
                  href="https://app.mailgun.com/app/account/security/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Mailgun Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
          </div>

          {/* Important Note for Resend */}
          {formData.email_provider === 'Resend' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Make sure to verify your sending domain in{' '}
                <a 
                  href="https://resend.com/domains" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Resend Domains
                  <ExternalLink className="h-3 w-3" />
                </a>
                {' '}for production use.
              </AlertDescription>
            </Alert>
          )}

          {/* Test Result */}
          {lastTestResult && (
            <Alert variant={lastTestResult.success ? 'default' : 'destructive'}>
              {lastTestResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{lastTestResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving & Testing...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Save & Test Configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
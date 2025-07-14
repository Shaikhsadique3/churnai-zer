import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Send } from "lucide-react";

interface SendEmailModalProps {
  trigger?: React.ReactNode;
  defaultTo?: string;
  defaultSubject?: string;
  defaultHtml?: string;
  defaultFrom?: string;
}

export const SendEmailModal = ({ 
  trigger, 
  defaultTo = '', 
  defaultSubject = '', 
  defaultHtml = '', 
  defaultFrom = '' 
}: SendEmailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    to: defaultTo,
    subject: defaultSubject,
    html: defaultHtml,
    from: defaultFrom,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendTestEmail = async () => {
    // Enhanced validation - check for empty/whitespace values
    const trimmedTo = formData.to?.trim();
    const trimmedSubject = formData.subject?.trim(); 
    const trimmedHtml = formData.html?.trim();
    
    if (!trimmedTo || !trimmedSubject || !trimmedHtml) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields (To, Subject, Body)",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedTo)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to send emails",
          variant: "destructive",
        });
        return;
      }

      // Prepare the request payload
      const emailPayload = {
        to: trimmedTo,
        subject: trimmedSubject,
        html: trimmedHtml
      };

      console.log('Sending email with payload:', emailPayload);

      const response = await supabase.functions.invoke('send-email', {
        body: emailPayload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Email API Response:', response);

      if (response.error) {
        console.error('Supabase function error:', response.error);
        throw new Error(response.error.message || 'Failed to send email');
      }

      if (response.data?.success) {
        toast({
          title: "✅ Email Sent Successfully", 
          description: `Email sent via ${response.data.provider || 'Resend'}. ID: ${response.data.emailId || response.data.id}`,
        });
        setOpen(false);
        // Reset form
        setFormData({
          to: defaultTo,
          subject: defaultSubject,
          html: defaultHtml,
          from: defaultFrom,
        });
      } else {
        throw new Error(response.data?.error || 'Failed to send email');
      }

    } catch (error: any) {
      console.error('Email sending error:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Unknown error occurred';
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        errorMessage = 'Email configuration error. Please check your email provider settings.';
      } else if (error.message?.includes('Missing authorization')) {
        errorMessage = 'Authentication error. Please try logging in again.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Invalid email address format.';
      } else if (error.message?.includes('Invalid JSON')) {
        errorMessage = 'Request format error. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Email Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test email to verify your email configuration is working properly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Send Test Email</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="from">From (Sender)</Label>
            <Input
              id="from"
              placeholder="Auto-filled from connected provider"
              value={formData.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              This will be auto-filled from your connected email provider
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To (Recipient) *</Label>
            <Input
              id="to"
              type="email"
              placeholder="test@example.com"
              value={formData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Test Email Subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="html">Email Body (HTML) *</Label>
            <Textarea
              id="html"
              placeholder="<p>Hello! This is a test email.</p>"
              value={formData.html}
              onChange={(e) => handleInputChange('html', e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              You can use HTML tags for formatting
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={sendTestEmail} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Test Email
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
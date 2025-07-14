import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailService } from "@/hooks/useEmailService";
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
  const { sendEmail, loading: emailLoading } = useEmailService();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    to: defaultTo,
    subject: defaultSubject,
    html: defaultHtml,
    from: defaultFrom,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
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

    try {
      await sendEmail({
        to: trimmedTo,
        subject: trimmedSubject,
        html: trimmedHtml,
        priority: 'high',
      });

      setOpen(false);
      // Reset form
      setFormData({
        to: defaultTo,
        subject: defaultSubject,
        html: defaultHtml,
        from: defaultFrom,
      });
    } catch (error) {
      // Error handling is done in useEmailService hook
      console.error('Send email error:', error);
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
              onClick={handleSendEmail} 
              disabled={emailLoading}
              className="flex-1"
            >
              {emailLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {emailLoading ? "Sending..." : "Send Test Email"}
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
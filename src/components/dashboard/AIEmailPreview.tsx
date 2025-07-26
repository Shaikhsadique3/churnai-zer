import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Edit, Eye, Loader2 } from "lucide-react";
import { useEmailService } from "@/hooks/useEmailService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIEmailPreviewProps {
  userData?: {
    id: string;
    email: string;
    name?: string;
    plan: string;
    churn_score: number;
    risk_level: string;
    churn_reason: string;
  };
}

export const AIEmailPreview = ({ userData }: AIEmailPreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{subject: string, body: string} | null>(null);
  const { toast } = useToast();

  const generateEmailPreview = async () => {
    if (!userData) {
      toast({
        title: "No user selected",
        description: "Please select a high-risk user to generate email preview",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-and-send-email', {
        body: {
          user_id: userData.id,
          customer_email: userData.email,
          customer_name: userData.name || userData.email.split('@')[0],
          subscription_plan: userData.plan,
          churn_score: userData.churn_score,
          risk_level: userData.risk_level,
          churn_reason: userData.churn_reason,
          psychologyStyle: 'urgency',
          customMessage: 'Preview mode - do not send',
          previewOnly: true // Flag to prevent actual sending
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.results?.[0]) {
        setEmailPreview({
          subject: response.data.results[0].subject,
          body: response.data.results[0].body || 'Email content generated'
        });
        
        toast({
          title: "✅ Email Preview Generated",
          description: "AI-powered retention email ready for review"
        });
      }
    } catch (error: any) {
      console.error('Email generation error:', error);
      toast({
        title: "❌ Generation Failed",
        description: error.message || "Failed to generate email preview",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!emailPreview || !userData) return;

    setIsSending(true);
    try {
      const response = await supabase.functions.invoke('generate-and-send-email', {
        body: {
          user_id: userData.id,
          customer_email: userData.email,
          customer_name: userData.name || userData.email.split('@')[0],
          subscription_plan: userData.plan,
          churn_score: userData.churn_score,
          risk_level: userData.risk_level,
          churn_reason: userData.churn_reason,
          psychologyStyle: 'urgency'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "📧 Email Sent Successfully",
        description: `Retention email sent to ${userData.email}`
      });
      
      // Clear preview after sending
      setEmailPreview(null);
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "❌ Send Failed",
        description: error.message || "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              AI Email Writer
            </CardTitle>
            <CardDescription>
              Generate personalized retention emails using AI psychology
            </CardDescription>
          </div>
          <Badge variant={userData?.risk_level === 'high' ? 'destructive' : 'secondary'}>
            {userData?.risk_level || 'No user'} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!emailPreview ? (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {userData ? 'Generate AI-powered retention email' : 'Select a high-risk user to generate email'}
            </p>
            <Button 
              onClick={generateEmailPreview}
              disabled={!userData || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Generate Preview
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Subject Line</h4>
              <p className="text-sm">{emailPreview.subject}</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Email Content</h4>
              <div 
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: emailPreview.body }}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={sendEmail}
                disabled={isSending}
                className="gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Now
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setEmailPreview(null)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {userData && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Target:</strong> {userData.email} • <strong>Plan:</strong> {userData.plan} • 
              <strong>Risk Score:</strong> {(userData.churn_score * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
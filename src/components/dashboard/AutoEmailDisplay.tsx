import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Edit, Download, Calendar, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EmailLog {
  id: string;
  target_email: string;
  target_user_id: string;
  status: string;
  email_data: {
    subject?: string;
    body?: string;
    churn_score?: number;
    risk_level?: string;
    confidence_score?: number;
  };
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

interface AutoEmailDisplayProps {
  userId?: string;
  userEmail?: string;
  riskLevel?: string;
  autoExpand?: boolean;
  className?: string;
}

export const AutoEmailDisplay = ({ 
  userId, 
  userEmail, 
  riskLevel, 
  autoExpand = false,
  className = "" 
}: AutoEmailDisplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(autoExpand || riskLevel === 'high');

  // Fetch latest email for this user
  const { data: emailLog, isLoading, refetch } = useQuery({
    queryKey: ['user-email-log', userId, user?.id],
    queryFn: async () => {
      if (!userId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as EmailLog | null;
    },
    enabled: !!userId && !!user?.id,
  });

  // Auto-expand for high-risk users
  useEffect(() => {
    if (riskLevel === 'high') {
      setIsExpanded(true);
    }
  }, [riskLevel]);

  const handleSendEmail = async () => {
    if (!emailLog || !userId) return;

    try {
      const response = await supabase.functions.invoke('generate-and-send-email', {
        body: {
          user_id: userId,
          customer_email: userEmail || emailLog.target_email,
          customer_name: userEmail?.split('@')[0] || 'Customer',
          subscription_plan: 'Unknown',
          churn_score: emailLog.email_data.churn_score || 0.8,
          risk_level: riskLevel || 'high',
          churn_reason: 'High churn risk detected',
          psychologyStyle: 'urgency'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "📧 Email Sent Successfully",
        description: `Retention email sent to ${userEmail || emailLog.target_email}`
      });
      
      refetch();
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "❌ Send Failed",
        description: error.message || "Failed to send email",
        variant: "destructive"
      });
    }
  };

  const handleDownloadEmail = () => {
    if (!emailLog?.email_data) return;
    
    const emailContent = `Subject: ${emailLog.email_data.subject || 'Retention Email'}\n\n${emailLog.email_data.body || 'No content'}`;
    const blob = new Blob([emailContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retention-email-${userId}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!userId) {
    return (
      <Card className={`${className} opacity-60`}>
        <CardContent className="p-6 text-center">
          <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a user to view AI-generated emails</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${riskLevel === 'high' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle className="text-lg">AI Retention Email</CardTitle>
            {riskLevel === 'high' && (
              <Badge variant="destructive" className="text-xs">
                Auto-Generated
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <CardDescription>
          {userEmail ? `Email for ${userEmail}` : `User ID: ${userId}`}
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading email...</span>
            </div>
          ) : !emailLog ? (
            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No email generated yet</p>
              <p className="text-xs text-muted-foreground">
                {riskLevel === 'high' 
                  ? 'AI email will be auto-generated for high-risk users' 
                  : 'Email will be generated when user reaches high risk'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant={emailLog.status === 'sent' ? 'default' : emailLog.status === 'failed' ? 'destructive' : 'secondary'}>
                    {emailLog.status.toUpperCase()}
                  </Badge>
                  {emailLog.email_data.confidence_score && (
                    <span className="text-xs text-muted-foreground">
                      Confidence: {(emailLog.email_data.confidence_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(emailLog.created_at), 'MMM d, h:mm a')}
                </div>
              </div>

              {/* Email Subject */}
              {emailLog.email_data.subject && (
                <div className="border rounded-lg p-4 bg-card">
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Subject Line</h4>
                  <p className="text-sm font-medium">{emailLog.email_data.subject}</p>
                </div>
              )}

              {/* Email Content */}
              {emailLog.email_data.body && (
                <div className="border rounded-lg p-4 bg-card">
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Email Content</h4>
                  <div 
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: emailLog.email_data.body }}
                  />
                </div>
              )}

              {/* Error Message */}
              {emailLog.error_message && (
                <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                  <h4 className="font-semibold mb-2 text-sm text-destructive">Error</h4>
                  <p className="text-xs text-destructive">{emailLog.error_message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleSendEmail}
                  size="sm"
                  className="gap-2"
                  disabled={emailLog.status === 'pending'}
                >
                  <Send className="h-4 w-4" />
                  {emailLog.status === 'sent' ? 'Resend' : 'Send Now'}
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadEmail}
                  className="gap-2"
                  disabled={!emailLog.email_data.body}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Refresh
                </Button>
              </div>

              {/* Metadata */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Risk Level:</strong> {emailLog.email_data.risk_level || 'Unknown'} • 
                  <strong>Churn Score:</strong> {emailLog.email_data.churn_score ? (emailLog.email_data.churn_score * 100).toFixed(1) + '%' : 'N/A'} • 
                  <strong>Generated:</strong> {format(new Date(emailLog.created_at), 'MMM d, yyyy')}
                  {emailLog.sent_at && (
                    <> • <strong>Sent:</strong> {format(new Date(emailLog.sent_at), 'MMM d, yyyy')}</>
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
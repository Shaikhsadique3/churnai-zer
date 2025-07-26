import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AutoEmailDisplay } from "./AutoEmailDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

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
}

export const RecentEmailsList = () => {
  const { user } = useAuth();

  // Fetch recent emails for high-risk users
  const { data: recentEmails, isLoading } = useQuery({
    queryKey: ['recent-emails', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as EmailLog[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const getDateLabel = (date: string) => {
    const emailDate = new Date(date);
    if (isToday(emailDate)) return 'Today';
    if (isYesterday(emailDate)) return 'Yesterday';
    return format(emailDate, 'MMM d, yyyy');
  };

  const groupEmailsByDate = (emails: EmailLog[]) => {
    const groups: { [key: string]: EmailLog[] } = {};
    
    emails.forEach(email => {
      const dateKey = getDateLabel(email.created_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(email);
    });
    
    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Loading recent emails...</span>
      </div>
    );
  }

  if (!recentEmails || recentEmails.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
        <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">No AI emails generated yet</p>
        <p className="text-xs text-muted-foreground">
          Emails will appear here when high-risk users are detected by the SDK
        </p>
      </div>
    );
  }

  const groupedEmails = groupEmailsByDate(recentEmails);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEmails).map(([dateLabel, emails]) => (
        <div key={dateLabel} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-muted-foreground">{dateLabel}</h4>
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">{emails.length} email{emails.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {emails.map((email) => (
              <Card key={email.id} className={`${
                email.email_data.risk_level === 'high' ? 'border-destructive/30 bg-destructive/5' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Email Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate" title={email.target_email}>
                          {email.target_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          User ID: {email.target_user_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          email.status === 'sent' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                          email.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {email.status}
                        </span>
                      </div>
                    </div>

                    {/* Email Subject */}
                    {email.email_data.subject && (
                      <div className="border-l-2 border-primary/20 pl-3">
                        <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                        <p className="text-sm font-medium line-clamp-2" title={email.email_data.subject}>
                          {email.email_data.subject}
                        </p>
                      </div>
                    )}

                    {/* Email Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {email.email_data.churn_score && (
                          <span>Score: {(email.email_data.churn_score * 100).toFixed(0)}%</span>
                        )}
                        {email.email_data.confidence_score && (
                          <span>Confidence: {(email.email_data.confidence_score * 100).toFixed(0)}%</span>
                        )}
                      </div>
                      <span>{format(new Date(email.created_at), 'h:mm a')}</span>
                    </div>

                    {/* Auto-Expand for High-Risk */}
                    <AutoEmailDisplay
                      userId={email.target_user_id}
                      userEmail={email.target_email}
                      riskLevel={email.email_data.risk_level}
                      autoExpand={false}
                      className="border-0 bg-transparent shadow-none p-0"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  template_id?: string;
  variables?: Record<string, any>;
}

export interface EmailLog {
  id: string;
  target_email: string;
  status: string;
  sent_at?: string;
  error_message?: string;
  email_data: any; // Json type from database
  created_at: string;
}

export const useEmailService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Send email using Churnaizer's default email service
  const sendEmail = async (request: EmailRequest) => {
    setLoading(true);
    try {
      console.log('Sending email via Churnaizer service:', request);
      
      // Ensure we only send required fields to match edge function expectations
      const emailBody = {
        to: request.to,
        subject: request.subject,
        html: request.html,
      };
      
      console.log('Email body being sent:', emailBody);
      
      const response = await supabase.functions.invoke('send-email', {
        body: emailBody
      });

      if (response.error) {
        console.error('Email service error:', response.error);
        throw new Error(response.error.message || 'Failed to send email');
      }

      if (response.data?.success) {
        toast({
          title: "✅ Email Sent Successfully",
          description: `Email sent via Churnaizer Email Service`,
        });
        return response.data;
      } else {
        throw new Error(response.data?.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Email sending error:', error);
      
      toast({
        title: "❌ Email Failed",
        description: error.message || 'Unknown email error',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send email using template with variables
  const sendTemplateEmail = async (
    to: string, 
    templateId: string, 
    variables: Record<string, any> = {}
  ) => {
    // Template functionality not implemented yet - throw error for now
    throw new Error('Template email functionality not implemented yet. Please use sendEmail with complete subject and html.');
  };

  // Get email logs for current user
  const getEmailLogs = async (limit = 50): Promise<EmailLog[]> => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email logs",
        variant: "destructive",
      });
      return [];
    }
  };

  // Get email analytics
  const getEmailAnalytics = async (days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('email_logs')
        .select('status, created_at, email_data')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const analytics = {
        totalSent: 0,
        totalFailed: 0,
        totalPending: 0,
        successRate: 0,
        dailyStats: {} as Record<string, { sent: number; failed: number; pending: number }>,
        providerStats: {} as Record<string, number>,
      };

      data?.forEach(log => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        const emailData = log.email_data as any;
        const provider = emailData?.provider || 'unknown';

        // Initialize daily stats
        if (!analytics.dailyStats[date]) {
          analytics.dailyStats[date] = { sent: 0, failed: 0, pending: 0 };
        }

        // Count by status
        switch (log.status) {
          case 'sent':
            analytics.totalSent++;
            analytics.dailyStats[date].sent++;
            break;
          case 'failed':
            analytics.totalFailed++;
            analytics.dailyStats[date].failed++;
            break;
          case 'pending':
          case 'queued':
            analytics.totalPending++;
            analytics.dailyStats[date].pending++;
            break;
        }

        // Count by provider
        analytics.providerStats[provider] = (analytics.providerStats[provider] || 0) + 1;
      });

      // Calculate success rate
      const total = analytics.totalSent + analytics.totalFailed;
      analytics.successRate = total > 0 ? (analytics.totalSent / total) * 100 : 0;

      return analytics;
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      return null;
    }
  };


  return {
    sendEmail,
    sendTemplateEmail,
    getEmailLogs,
    getEmailAnalytics,
    loading,
  };
};
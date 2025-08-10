
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface EmailCampaignProps {
  filters: any;
  isPaidPlan: boolean;
}

export const EmailCampaignChart = ({ filters, isPaidPlan }: EmailCampaignProps) => {
  const { user } = useAuth();

  const { data: emailData, isLoading } = useQuery({
    queryKey: ['email-campaign-performance', user?.id, filters],
    queryFn: async () => {
      const days = isPaidPlan ? 30 : 7;
      const startDate = subDays(new Date(), days);
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

      const { data: emailLogs } = await supabase
        .from('email_logs')
        .select('created_at, opened_at, clicked_at, status')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString());

      return dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const dayEmails = emailLogs?.filter(email => 
          format(new Date(email.created_at), 'yyyy-MM-dd') === dateStr
        ) || [];
        
        const sent = dayEmails.length;
        const opened = dayEmails.filter(email => email.opened_at).length;
        const clicked = dayEmails.filter(email => email.clicked_at).length;
        
        const openRate = sent > 0 ? (opened / sent) * 100 : 0;
        const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
        
        return {
          date: format(date, 'MMM dd'),
          sent,
          opened,
          clicked,
          openRate: Math.round(openRate * 10) / 10,
          clickRate: Math.round(clickRate * 10) / 10,
        };
      });
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Campaign Performance
        </CardTitle>
        <CardDescription>Emails sent vs open rate over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={emailData} margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number, name: string) => [
                  name.includes('Rate') ? `${value}%` : value,
                  name === 'sent' ? 'Emails Sent' : 
                  name === 'openRate' ? 'Open Rate' : 
                  name === 'clickRate' ? 'Click Rate' : name
                ]}
              />
              <Bar 
                yAxisId="left"
                dataKey="sent" 
                fill="hsl(var(--primary))" 
                opacity={0.7}
                radius={[2, 2, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="openRate" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="clickRate" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Emails Sent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span>Open Rate (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-accent rounded-full"></div>
            <span>Click Rate (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

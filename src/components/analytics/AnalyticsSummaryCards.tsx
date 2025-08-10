
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Shield, Users } from 'lucide-react';

interface SummaryCardsProps {
  filters: any;
  isPaidPlan: boolean;
}

export const AnalyticsSummaryCards = ({ filters, isPaidPlan }: SummaryCardsProps) => {
  const { user } = useAuth();

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['analytics-summary', user?.id, filters],
    queryFn: async () => {
      const dateFilter = isPaidPlan ? {} : {
        gte: 'created_at',
        value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Get MRR from user data
      const { data: userData } = await supabase
        .from('user_data')
        .select('monthly_revenue, status, risk_level')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      // Get revenue saved from recovery logs
      const { data: recoveryData } = await supabase
        .from('recovery_logs')
        .select('revenue_saved')
        .eq('owner_id', user?.id);

      // Get email metrics
      const { data: emailData } = await supabase
        .from('email_logs')
        .select('status, opened_at')
        .eq('user_id', user?.id);

      const mrr = userData?.reduce((sum, user) => sum + (user.monthly_revenue || 0), 0) || 0;
      const revenueSaved = recoveryData?.reduce((sum, recovery) => sum + (recovery.revenue_saved || 0), 0) || 0;
      const activeUsers = userData?.filter(user => user.status !== 'churned').length || 0;
      
      const totalEmails = emailData?.length || 0;
      const openedEmails = emailData?.filter(email => email.opened_at).length || 0;
      const recoveryRate = totalEmails > 0 ? (openedEmails / totalEmails) * 100 : 0;

      return {
        mrr,
        revenueSaved,
        recoveryRate,
        activeUsers
      };
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: 'Monthly Recurring Revenue',
      value: formatCurrency(summaryData?.mrr || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Revenue Saved',
      value: formatCurrency(summaryData?.revenueSaved || 0),
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Recovery Rate',
      value: `${(summaryData?.recoveryRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      title: 'Active Users',
      value: summaryData?.activeUsers || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor} shadow-sm`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

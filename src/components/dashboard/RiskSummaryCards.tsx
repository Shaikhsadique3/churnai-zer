import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Users, TrendingUp, Bot, Calendar, Activity } from 'lucide-react';

interface RiskSummaryData {
  totalUsers: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  avgChurnScore: number;
  recentUsers7d: number;
  recentUsers30d: number;
  triggeredPlaybooks: number;
}

export const RiskSummaryCards = () => {
  const { user } = useAuth();

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['risk-summary', user?.id],
    queryFn: async (): Promise<RiskSummaryData> => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('risk_level, churn_score, last_login, created_at')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      if (userError) throw userError;

      // Fetch playbook logs for triggered playbooks count
      const { data: playbookLogs, error: playbookError } = await supabase
        .from('playbook_logs')
        .select('log_id')
        .eq('user_id', user?.id)
        .gte('triggered_at', sevenDaysAgo.toISOString());

      if (playbookError) throw playbookError;

      const totalUsers = userData?.length || 0;
      const highRiskCount = userData?.filter(u => u.risk_level === 'high').length || 0;
      const mediumRiskCount = userData?.filter(u => u.risk_level === 'medium').length || 0;
      const lowRiskCount = userData?.filter(u => u.risk_level === 'low').length || 0;
      
      const avgChurnScore = totalUsers > 0 
        ? (userData?.reduce((sum, u) => sum + (u.churn_score || 0), 0) || 0) / totalUsers 
        : 0;

      const recentUsers7d = userData?.filter(u => 
        u.last_login && new Date(u.last_login) >= sevenDaysAgo
      ).length || 0;

      const recentUsers30d = userData?.filter(u => 
        u.last_login && new Date(u.last_login) >= thirtyDaysAgo
      ).length || 0;

      const triggeredPlaybooks = playbookLogs?.length || 0;

      return {
        totalUsers,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        avgChurnScore,
        recentUsers7d,
        recentUsers30d,
        triggeredPlaybooks,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const cards = [
    {
      title: 'High Risk Users',
      value: summaryData?.highRiskCount || 0,
      description: `${summaryData?.totalUsers || 0} total users`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
    {
      title: 'Total Users',
      value: summaryData?.totalUsers || 0,
      description: `${summaryData?.mediumRiskCount || 0} medium, ${summaryData?.lowRiskCount || 0} low risk`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Avg Churn Score',
      value: `${Math.round((summaryData?.avgChurnScore || 0) * 100)}%`,
      description: 'Overall risk assessment',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      title: 'Active (7 days)',
      value: summaryData?.recentUsers7d || 0,
      description: `${summaryData?.recentUsers30d || 0} active in 30 days`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Triggered Playbooks',
      value: summaryData?.triggeredPlaybooks || 0,
      description: 'Last 7 days',
      icon: Bot,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      title: 'Risk Distribution',
      value: `${Math.round(((summaryData?.highRiskCount || 0) / Math.max(summaryData?.totalUsers || 1, 1)) * 100)}%`,
      description: 'High risk percentage',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import { format, subMonths, eachMonthOfInterval, startOfMonth } from 'date-fns';

interface RevenueTrendsProps {
  filters: any;
  isPaidPlan: boolean;
}

export const RevenueTrendsChart = ({ filters, isPaidPlan }: RevenueTrendsProps) => {
  const { user } = useAuth();

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-trends', user?.id, filters],
    queryFn: async () => {
      const months = isPaidPlan ? 12 : 3;
      const startDate = startOfMonth(subMonths(new Date(), months));
      const monthRange = eachMonthOfInterval({ start: startDate, end: new Date() });

      // Get revenue data from user_data and recovery_logs
      const { data: userData } = await supabase
        .from('user_data')
        .select('monthly_revenue, created_at')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      const { data: recoveryData } = await supabase
        .from('recovery_logs')
        .select('revenue_saved, recovered_at')
        .eq('owner_id', user?.id);

      return monthRange.map(month => {
        const monthStr = format(month, 'yyyy-MM');
        
        // Calculate MRR for users created up to this month
        const activeUsers = userData?.filter(u => 
          new Date(u.created_at) <= month
        ) || [];
        
        const mrr = activeUsers.reduce((sum, u) => sum + (u.monthly_revenue || 0), 0);
        
        // Calculate revenue saved in this month
        const monthRecoveries = recoveryData?.filter(r => 
          format(new Date(r.recovered_at), 'yyyy-MM') === monthStr
        ) || [];
        
        const revenueSaved = monthRecoveries.reduce((sum, r) => sum + (r.revenue_saved || 0), 0);
        
        // Calculate LTV (simplified as MRR * 12 for annual value)
        const ltv = mrr * 12;
        
        return {
          month: format(month, 'MMM yyyy'),
          mrr,
          ltv,
          revenueSaved,
        };
      });
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
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
          <DollarSign className="h-5 w-5" />
          Revenue Trends ({isPaidPlan ? 'Last 12 Months' : 'Last 3 Months'})
        </CardTitle>
        <CardDescription>MRR, LTV, and revenue saved over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ left: 20, right: 30 }}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ltvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'mrr' ? 'MRR' : name === 'ltv' ? 'LTV' : 'Revenue Saved'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="ltv" 
                stackId="1"
                stroke="hsl(var(--secondary))" 
                fill="url(#ltvGradient)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="mrr" 
                stackId="2"
                stroke="hsl(var(--primary))" 
                fill="url(#mrrGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Monthly Recurring Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span>Lifetime Value</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

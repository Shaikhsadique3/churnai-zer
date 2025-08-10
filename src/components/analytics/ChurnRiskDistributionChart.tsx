
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Shield } from 'lucide-react';

interface ChurnRiskDistributionProps {
  filters: any;
  isPaidPlan: boolean;
}

const COLORS = {
  low: '#10b981',    // green
  medium: '#f59e0b', // yellow  
  high: '#ef4444',   // red
};

export const ChurnRiskDistributionChart = ({ filters, isPaidPlan }: ChurnRiskDistributionProps) => {
  const { user } = useAuth();

  const { data: riskData, isLoading } = useQuery({
    queryKey: ['churn-risk-distribution', user?.id, filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('risk_level')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      if (error) throw error;

      const distribution = {
        low: 0,
        medium: 0,
        high: 0,
      };

      data?.forEach(user => {
        const riskLevel = user.risk_level || 'low';
        distribution[riskLevel as keyof typeof distribution]++;
      });

      return [
        { name: 'Low Risk', value: distribution.low, color: COLORS.low },
        { name: 'Medium Risk', value: distribution.medium, color: COLORS.medium },
        { name: 'High Risk', value: distribution.high, color: COLORS.high },
      ].filter(item => item.value > 0);
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / (riskData?.reduce((sum, item) => sum + item.value, 0) || 1)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Churn Risk Distribution
        </CardTitle>
        <CardDescription>Breakdown of users by risk level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [`${value} users`, "Count"]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {riskData?.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="font-medium" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.name.replace(' Risk', '')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

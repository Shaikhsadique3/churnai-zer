
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureUsageProps {
  filters: any;
  isPaidPlan: boolean;
}

export const FeatureUsageChart = ({ filters, isPaidPlan }: FeatureUsageProps) => {
  const { user } = useAuth();

  const { data: featureData, isLoading } = useQuery({
    queryKey: ['feature-usage', user?.id, filters],
    queryFn: async () => {
      if (!isPaidPlan) {
        return [
          { feature: 'Dashboard', usage: 45, percentage: 85 },
          { feature: 'Analytics', usage: 32, percentage: 60 },
          { feature: 'Reports', usage: 28, percentage: 53 },
          { feature: 'Settings', usage: 15, percentage: 28 },
          { feature: 'Integrations', usage: 8, percentage: 15 },
        ];
      }

      // In a real implementation, this would come from actual feature usage tracking
      // For now, we'll simulate based on available data patterns
      const { data: userData } = await supabase
        .from('user_data')
        .select('usage, last_login, plan')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      // Simulate feature usage based on user engagement patterns
      const totalUsers = userData?.length || 0;
      const highEngagementUsers = userData?.filter(u => (u.usage || 0) > 10).length || 0;
      const mediumEngagementUsers = userData?.filter(u => (u.usage || 0) > 5 && (u.usage || 0) <= 10).length || 0;

      return [
        { 
          feature: 'Churn Prediction', 
          usage: Math.round(totalUsers * 0.9), 
          percentage: Math.round((totalUsers * 0.9 / Math.max(totalUsers, 1)) * 100)
        },
        { 
          feature: 'Email Automation', 
          usage: Math.round(highEngagementUsers * 1.2), 
          percentage: Math.round((highEngagementUsers * 1.2 / Math.max(totalUsers, 1)) * 100)
        },
        { 
          feature: 'Analytics Dashboard', 
          usage: Math.round(totalUsers * 0.7), 
          percentage: Math.round((totalUsers * 0.7 / Math.max(totalUsers, 1)) * 100)
        },
        { 
          feature: 'CSV Upload', 
          usage: Math.round(mediumEngagementUsers * 0.8), 
          percentage: Math.round((mediumEngagementUsers * 0.8 / Math.max(totalUsers, 1)) * 100)
        },
        { 
          feature: 'API Integration', 
          usage: Math.round(highEngagementUsers * 0.4), 
          percentage: Math.round((highEngagementUsers * 0.4 / Math.max(totalUsers, 1)) * 100)
        },
        { 
          feature: 'Playbooks', 
          usage: Math.round(totalUsers * 0.3), 
          percentage: Math.round((totalUsers * 0.3 / Math.max(totalUsers, 1)) * 100)
        },
      ].sort((a, b) => b.usage - a.usage);
    },
    enabled: !!user?.id,
  });

  if (!isPaidPlan) {
    return (
      <Card className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold">Premium Feature</h3>
              <p className="text-sm text-muted-foreground">Upgrade to access detailed feature usage analytics</p>
              <Button className="mt-2" size="sm">Upgrade Now</Button>
            </div>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Feature Usage Analytics
          </CardTitle>
          <CardDescription>Most to least used features in your app</CardDescription>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="feature" width={100} />
                <Tooltip />
                <Bar dataKey="usage" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Analytics</CardTitle>
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
          <Activity className="h-5 w-5" />
          Feature Usage Analytics
        </CardTitle>
        <CardDescription>Most to least used features in your app</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureData} layout="horizontal" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="feature" 
                width={120}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number, name: string) => [
                  `${value} users (${featureData?.find(d => d.usage === value)?.percentage || 0}%)`,
                  "Usage"
                ]}
              />
              <Bar 
                dataKey="usage" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Most Used:</div>
            <div className="text-muted-foreground">
              {featureData?.[0]?.feature} ({featureData?.[0]?.percentage}%)
            </div>
          </div>
          <div>
            <div className="font-medium">Least Used:</div>
            <div className="text-muted-foreground">
              {featureData?.[featureData.length - 1]?.feature} ({featureData?.[featureData.length - 1]?.percentage}%)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

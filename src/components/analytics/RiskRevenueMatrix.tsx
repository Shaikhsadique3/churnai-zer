
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RiskRevenueMatrixProps {
  filters: any;
  isPaidPlan: boolean;
}

export const RiskRevenueMatrix = ({ filters, isPaidPlan }: RiskRevenueMatrixProps) => {
  const { user } = useAuth();

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ['risk-revenue-matrix', user?.id, filters],
    queryFn: async () => {
      if (!isPaidPlan) {
        // Return limited data for free plan
        return {
          high: { users: 5, revenue: 2500 },
          medium: { users: 8, revenue: 1200 },
          low: { users: 12, revenue: 600 },
        };
      }

      const { data, error } = await supabase
        .from('user_data')
        .select('risk_level, monthly_revenue, plan')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      if (error) throw error;

      const matrix = {
        high: { users: 0, revenue: 0 },
        medium: { users: 0, revenue: 0 },
        low: { users: 0, revenue: 0 },
      };

      data?.forEach(user => {
        const riskLevel = user.risk_level || 'low';
        matrix[riskLevel as keyof typeof matrix].users += 1;
        matrix[riskLevel as keyof typeof matrix].revenue += user.monthly_revenue || 0;
      });

      return matrix;
    },
    enabled: !!user?.id,
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntensity = (revenue: number, maxRevenue: number) => {
    const intensity = Math.min(revenue / maxRevenue, 1);
    return intensity * 0.8 + 0.2; // Min opacity 0.2, max 1.0
  };

  if (!isPaidPlan) {
    return (
      <Card className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold">Premium Feature</h3>
              <p className="text-sm text-muted-foreground">Upgrade to access the Risk × Revenue Matrix</p>
              <Button className="mt-2" size="sm">Upgrade Now</Button>
            </div>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk × Revenue Matrix
          </CardTitle>
          <CardDescription>Heatmap showing revenue at risk by user segments</CardDescription>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="grid grid-cols-3 gap-4">
            {/* Blurred placeholder content */}
            <div className="space-y-2">
              <div className="h-20 bg-red-100 rounded"></div>
              <div className="text-center">
                <div className="font-medium">High Risk</div>
                <div className="text-sm text-muted-foreground">5 users</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk × Revenue Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(
    matrixData?.high.revenue || 0,
    matrixData?.medium.revenue || 0,
    matrixData?.low.revenue || 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk × Revenue Matrix
        </CardTitle>
        <CardDescription>Revenue at risk by user risk levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(matrixData || {}).map(([risk, data]) => (
            <div key={risk} className="space-y-3">
              <div
                className={`${getRiskColor(risk)} rounded-lg p-6 text-white relative overflow-hidden`}
                style={{
                  opacity: getIntensity(data.revenue, maxRevenue)
                }}
              >
                <div className="relative z-10">
                  <div className="text-2xl font-bold">
                    ${(data.revenue / 1000).toFixed(1)}k
                  </div>
                  <div className="text-sm opacity-90">
                    {data.users} users
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Badge variant={risk === 'high' ? 'destructive' : risk === 'medium' ? 'secondary' : 'default'}>
                  {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  ${data.revenue.toLocaleString()} at risk
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-2">Key Insights:</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• High-risk users represent the most urgent revenue threats</li>
            <li>• Focus retention efforts on the highest-value segments</li>
            <li>• Medium-risk users offer the best recovery ROI</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

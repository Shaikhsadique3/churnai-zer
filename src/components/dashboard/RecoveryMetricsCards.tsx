import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, DollarSign, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth } from "date-fns";

export const RecoveryMetricsCards = () => {
  const { user } = useAuth();

  // Fetch recovery metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['recovery-metrics', user?.id],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get all recovery logs for the user
      const { data: allRecoveries, error: allError } = await supabase
        .from('recovery_logs')
        .select('*')
        .eq('owner_id', user?.id);

      if (allError) throw allError;

      // Get this month's recoveries
      const { data: monthRecoveries, error: monthError } = await supabase
        .from('recovery_logs')
        .select('*')
        .eq('owner_id', user?.id)
        .gte('recovered_at', monthStart.toISOString())
        .lte('recovered_at', monthEnd.toISOString());

      if (monthError) throw monthError;

      const totalRecovered = allRecoveries?.length || 0;
      const totalRevenueSaved = allRecoveries?.reduce((sum, recovery) => sum + (recovery.revenue_saved || 0), 0) || 0;
      const monthlyRecovered = monthRecoveries?.length || 0;
      const monthlyRevenueSaved = monthRecoveries?.reduce((sum, recovery) => sum + (recovery.revenue_saved || 0), 0) || 0;

      return {
        totalRecovered,
        totalRevenueSaved,
        monthlyRecovered,
        monthlyRevenueSaved
      };
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 w-4 bg-muted rounded"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Recovered",
      value: metrics?.totalRecovered || 0,
      description: "All time recovered users",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Revenue Saved",
      value: formatCurrency(metrics?.totalRevenueSaved || 0),
      description: "Lifetime revenue recovered",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: `Recovered This Month`,
      value: metrics?.monthlyRecovered || 0,
      description: format(new Date(), 'MMMM yyyy'),
      icon: CheckCircle,
      color: "text-emerald-600"
    },
    {
      title: "Monthly Revenue Saved",
      value: formatCurrency(metrics?.monthlyRevenueSaved || 0),
      description: "This month's recovery value",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
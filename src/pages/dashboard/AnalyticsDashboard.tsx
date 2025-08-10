
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { EngagementTrendsChart } from '@/components/analytics/EngagementTrendsChart';
import { RevenueTrendsChart } from '@/components/analytics/RevenueTrendsChart';
import { ChurnRiskDistributionChart } from '@/components/analytics/ChurnRiskDistributionChart';
import { FeatureUsageChart } from '@/components/analytics/FeatureUsageChart';
import { EmailCampaignChart } from '@/components/analytics/EmailCampaignChart';
import { RiskRevenueMatrix } from '@/components/analytics/RiskRevenueMatrix';
import { ActivityRecoveryMatrix } from '@/components/analytics/ActivityRecoveryMatrix';
import { TrendingUp, Download, Filter } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface DashboardFilters {
  planType: string;
  riskLevel: string;
  recoveryStatus: string;
  activityLevel: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<DashboardFilters>({
    planType: 'all',
    riskLevel: 'all',
    recoveryStatus: 'all',
    activityLevel: 'all',
    dateRange: {
      from: addDays(new Date(), -30),
      to: new Date(),
    },
  });

  // Check user plan for restrictions
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_profile')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isPaidPlan = userProfile?.revenue_model === 'Pro' || userProfile?.revenue_model === 'Enterprise';

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    // Implementation for data export
    console.log(`Exporting data as ${format}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Analytics Hub
          </h1>
          <p className="text-muted-foreground">
            SaaS-grade analytics powered by real-time data
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Plan Type</label>
              <Select value={filters.planType} onValueChange={(value) => handleFilterChange('planType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Risk Level</label>
              <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Recovery Status</label>
              <Select value={filters.recoveryStatus} onValueChange={(value) => handleFilterChange('recoveryStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="not_recovered">Not Recovered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Activity Level</label>
              <Select value={filters.activityLevel} onValueChange={(value) => handleFilterChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="high">High Activity</SelectItem>
                  <SelectItem value="medium">Medium Activity</SelectItem>
                  <SelectItem value="low">Low Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => handleFilterChange('dateRange', dateRange)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <AnalyticsSummaryCards filters={filters} isPaidPlan={isPaidPlan} />

      {/* Priority Charts - Risk × Revenue Matrix and Feature Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskRevenueMatrix filters={filters} isPaidPlan={isPaidPlan} />
        <FeatureUsageChart filters={filters} isPaidPlan={isPaidPlan} />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementTrendsChart filters={filters} isPaidPlan={isPaidPlan} />
        <RevenueTrendsChart filters={filters} isPaidPlan={isPaidPlan} />
        <ChurnRiskDistributionChart filters={filters} isPaidPlan={isPaidPlan} />
        <EmailCampaignChart filters={filters} isPaidPlan={isPaidPlan} />
      </div>

      {/* Activity Recovery Matrix */}
      <ActivityRecoveryMatrix filters={filters} isPaidPlan={isPaidPlan} />
    </div>
  );
};

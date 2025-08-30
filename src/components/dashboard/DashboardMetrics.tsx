import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, description }) => {
  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${changeColor} flex items-center gap-1`}>
            <TrendingUp className="h-3 w-3" />
            {change > 0 ? '+' : ''}{change}% from yesterday
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardMetricsProps {
  metrics: {
    revenueSavedToday: number;
    saveRate: number;
    cancelsDiverted: number;
    vipAlerts: number;
  };
  changes?: {
    revenueSavedToday: number;
    saveRate: number;
    cancelsDiverted: number;
    vipAlerts: number;
  };
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  metrics, 
  changes 
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Revenue Saved Today"
        value={formatCurrency(metrics.revenueSavedToday)}
        change={changes?.revenueSavedToday}
        icon={<DollarSign className="h-4 w-4" />}
        description="Total revenue retained from successful interventions"
      />
      
      <MetricCard
        title="Save Rate"
        value={`${metrics.saveRate}%`}
        change={changes?.saveRate}
        icon={<Shield className="h-4 w-4" />}
        description="Percentage of cancel attempts successfully diverted"
      />
      
      <MetricCard
        title="Cancels Diverted"
        value={metrics.cancelsDiverted}
        change={changes?.cancelsDiverted}
        icon={<TrendingUp className="h-4 w-4" />}
        description="Number of cancellations prevented today"
      />
      
      <MetricCard
        title="VIP Alerts"
        value={metrics.vipAlerts}
        change={changes?.vipAlerts}
        icon={<AlertTriangle className="h-4 w-4" />}
        description="High-value customers requiring immediate attention"
      />
    </div>
  );
};
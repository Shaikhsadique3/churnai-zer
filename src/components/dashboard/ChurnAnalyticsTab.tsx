import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  DollarSign,
  Users,
  Download,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChurnAnalyticsTabProps {
  results: any;
  onProceedToEmails: () => void;
}

export function ChurnAnalyticsTab({ results, onProceedToEmails }: ChurnAnalyticsTabProps) {
  if (!results) return null;

  const { analytics, results: customerResults } = results;

  const downloadReport = () => {
    const csvContent = [
      ['Customer ID', 'Email', 'Monthly Revenue', 'Churn Score', 'Risk Level', 'Reason', 'Recommendations'].join(','),
      ...customerResults.map((r: any) => [
        r.customer_id,
        r.customer_email || '',
        r.monthly_revenue,
        (r.churn_score * 100).toFixed(2) + '%',
        r.risk_level,
        `"${r.reason}"`,
        `"${r.recommendations?.join('; ') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `churn-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.total_customers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Churn Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(analytics.avg_churn_score * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue at Risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${analytics.revenue_at_risk.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Est. Churn Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {analytics.churn_rate_estimate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>Customer segmentation by churn risk level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                Critical Risk
              </span>
              <span className="text-sm font-bold">{analytics.risk_distribution.critical} customers</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(analytics.risk_distribution.critical / analytics.total_customers) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                High Risk
              </span>
              <span className="text-sm font-bold">{analytics.risk_distribution.high} customers</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${(analytics.risk_distribution.high / analytics.total_customers) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                Medium Risk
              </span>
              <span className="text-sm font-bold">{analytics.risk_distribution.medium} customers</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 transition-all"
                style={{ width: `${(analytics.risk_distribution.medium / analytics.total_customers) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                Low Risk
              </span>
              <span className="text-sm font-bold">{analytics.risk_distribution.low} customers</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(analytics.risk_distribution.low / analytics.total_customers) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top At-Risk Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top At-Risk Customers</CardTitle>
          <CardDescription>Customers requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customerResults
              .filter((r: any) => r.risk_level === 'critical' || r.risk_level === 'high')
              .slice(0, 10)
              .map((customer: any) => (
                <div 
                  key={customer.customer_id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{customer.customer_id}</span>
                      <Badge className={getRiskColor(customer.risk_level)}>
                        {customer.risk_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{customer.reason}</p>
                    {customer.recommendations && customer.recommendations.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <strong>Action:</strong> {customer.recommendations[0]}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-red-600">
                      {(customer.churn_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      ${customer.monthly_revenue}/mo
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={downloadReport} className="gap-2">
          <Download className="w-4 h-4" />
          Download Full Report
        </Button>
        
        <Button size="lg" onClick={onProceedToEmails} className="gap-2">
          Generate Retention Emails
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
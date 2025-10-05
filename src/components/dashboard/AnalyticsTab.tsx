import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign } from "lucide-react";

interface AnalyticsTabProps {
  analytics: any;
  predictions: any[];
}

export function AnalyticsTab({ analytics, predictions }: AnalyticsTabProps) {
  const getRiskColor = (risk: string) => {
    if (risk === 'high') return 'bg-red-500';
    if (risk === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Calculate top churn reasons
  const reasonCounts: { [key: string]: number } = {};
  predictions.forEach(pred => {
    const reasons = pred.churn_reason.split('; ');
    reasons.forEach((reason: string) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
  });

  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_customers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Churn Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.predicted_churn_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry avg: {analytics.industry_benchmark}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.total_mrr.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR at Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${analytics.at_risk_mrr.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.revenue_at_risk_percentage}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
          <CardDescription>Customer segmentation by churn risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                High Risk
              </span>
              <span className="font-medium">{analytics.high_risk_count} customers</span>
            </div>
            <Progress 
              value={(analytics.high_risk_count / analytics.total_customers) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                Medium Risk
              </span>
              <span className="font-medium">{analytics.medium_risk_count} customers</span>
            </div>
            <Progress 
              value={(analytics.medium_risk_count / analytics.total_customers) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Low Risk
              </span>
              <span className="font-medium">{analytics.low_risk_count} customers</span>
            </div>
            <Progress 
              value={(analytics.low_risk_count / analytics.total_customers) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Churn Drivers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Churn Drivers</CardTitle>
          <CardDescription>Most common reasons for customer churn risk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topReasons.map(([reason, count], index) => (
              <div key={reason} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm">{reason}</span>
                </div>
                <span className="text-sm text-muted-foreground">{count} customers</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmark Comparison</CardTitle>
          <CardDescription>How your churn rate compares to SaaS industry average</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Predicted Churn Rate</span>
              <span className="text-2xl font-bold">{analytics.predicted_churn_rate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Industry Average</span>
              <span className="text-2xl font-bold text-muted-foreground">{analytics.industry_benchmark}%</span>
            </div>
            <div className="pt-4 border-t">
              {analytics.predicted_churn_rate > analytics.industry_benchmark ? (
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {(analytics.predicted_churn_rate - analytics.industry_benchmark).toFixed(1)}% above industry average
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingDown className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {(analytics.industry_benchmark - analytics.predicted_churn_rate).toFixed(1)}% below industry average
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SHAP Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Importance (SHAP Values)</CardTitle>
          <CardDescription>Factors contributing most to churn predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Payment Status</span>
              <div className="flex items-center gap-2">
                <Progress value={30} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground w-12 text-right">30%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Last Login Days</span>
              <div className="flex items-center gap-2">
                <Progress value={25} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground w-12 text-right">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Login Frequency</span>
              <div className="flex items-center gap-2">
                <Progress value={15} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground w-12 text-right">15%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Feature Adoption</span>
              <div className="flex items-center gap-2">
                <Progress value={15} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground w-12 text-right">15%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Support Tickets</span>
              <div className="flex items-center gap-2">
                <Progress value={10} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground w-12 text-right">10%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>NPS Score</span>
              <div className="flex items-center gap-2">
                <Progress value={5} className="h-2 w-32" />
                <span className="text-xs text-muted-foreground w-12 text-right">5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Upload,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PredictionsTable } from "@/components/dashboard/PredictionsTable";
import { ActionableRetentionMap } from "@/components/dashboard/ActionableRetentionMap";

export default function DashboardOverview() {
  const navigate = useNavigate();

  // Fetch real user data statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from('user_data')
        .select('risk_level, monthly_revenue, churn_score')
        .eq('owner_id', session.user.id);

      if (error) throw error;

      const total = data.length;
      const highRisk = data.filter(u => u.risk_level === 'high').length;
      const mediumRisk = data.filter(u => u.risk_level === 'medium').length;
      const lowRisk = data.filter(u => u.risk_level === 'low').length;
      
      // Calculate revenue at risk (high risk users monthly revenue)
      const revenueAtRisk = data
        .filter(u => u.risk_level === 'high')
        .reduce((sum, u) => sum + (u.monthly_revenue || 0), 0);

      // Calculate average churn score
      const avgChurnScore = data.length > 0 
        ? data.reduce((sum, u) => sum + (u.churn_score || 0), 0) / data.length 
        : 0;

      return { total, highRisk, mediumRisk, lowRisk, revenueAtRisk, avgChurnScore };
    },
  });

  const stats = [
    {
      title: "Total Users Analyzed",
      value: userStats?.total?.toString() || "0",
      change: "",
      trend: "neutral",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "High Cancel Risk",
      value: userStats?.highRisk?.toString() || "0",
      change: userStats?.total ? `${Math.round((userStats.highRisk / userStats.total) * 100)}%` : "",
      trend: "up", 
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Revenue at Risk",
      value: userStats?.revenueAtRisk ? `$${userStats.revenueAtRisk.toLocaleString()}` : "$0",
      change: "Monthly revenue from high-risk users",
      trend: "neutral",
      icon: TrendingUp,
      color: "text-red-600"
    },
    {
      title: "Avg Churn Score",
      value: userStats?.avgChurnScore ? `${Math.round(userStats.avgChurnScore * 100)}%` : "0%",
      change: "Across all analyzed users",
      trend: "neutral",
      icon: Target,
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Upload Customer Data",
      description: "Upload CSV file to predict cancel intent",
      icon: Upload,
      action: () => navigate("/csv-upload"),
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to Churnaizer! Upload customer data to start predicting cancel intent.
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                   {stat.change && (
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">{stat.change}</span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Upload your user CSV to see cancel-risk predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start text-left space-y-2 ${action.color}`}
                onClick={action.action}
              >
                <action.icon className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Retention Map */}
      <ActionableRetentionMap />

      {/* Predictions Table */}
      <PredictionsTable onUploadClick={() => navigate("/csv-upload")} />
    </div>
  );
}
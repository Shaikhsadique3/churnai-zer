
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WeeklyStats {
  churnChange: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  lowRiskUsers: number;
  topRisk: string;
  improvement: string;
}

export const WeeklyReportCard = () => {
  const { user } = useAuth();

  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['weekly-report', user?.id],
    queryFn: async (): Promise<WeeklyStats> => {
      // Get current week data
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: currentData, error: currentError } = await supabase
        .from('user_data')
        .select('risk_level, churn_score')
        .eq('owner_id', user?.id);
      
      if (currentError) throw currentError;

      // Get previous week data for comparison
      const { data: previousData, error: previousError } = await supabase
        .from('user_data')
        .select('risk_level, churn_score, created_at')
        .eq('owner_id', user?.id)
        .lt('created_at', oneWeekAgo.toISOString());
      
      if (previousError) throw previousError;

      const currentHighRisk = currentData?.filter(u => u.risk_level === 'high').length || 0;
      const currentMediumRisk = currentData?.filter(u => u.risk_level === 'medium').length || 0;
      const currentLowRisk = currentData?.filter(u => u.risk_level === 'low').length || 0;
      
      const previousHighRisk = previousData?.filter(u => u.risk_level === 'high').length || 0;
      const currentTotal = currentData?.length || 0;
      const previousTotal = previousData?.length || 0;
      
      // Calculate churn change percentage
      const currentChurnRate = currentTotal > 0 ? (currentHighRisk / currentTotal) * 100 : 0;
      const previousChurnRate = previousTotal > 0 ? (previousHighRisk / previousTotal) * 100 : 0;
      const churnChange = currentChurnRate - previousChurnRate;

      // Determine top risk factor and improvement suggestion
      let topRisk = "No significant risks detected";
      let improvement = "Continue monitoring user engagement";
      
      if (currentHighRisk > 0) {
        topRisk = currentHighRisk > currentMediumRisk ? "High churn risk users detected" : "Feature abandonment patterns";
        improvement = currentHighRisk > 3 ? "Implement retention campaigns" : "Set up email automation";
      }

      return {
        churnChange: Number(churnChange.toFixed(1)),
        highRiskUsers: currentHighRisk,
        mediumRiskUsers: currentMediumRisk,
        lowRiskUsers: currentLowRisk,
        topRisk,
        improvement
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="border-2 hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            Weekly Report Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-16 bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weeklyData) return null;

  const isImprovement = weeklyData.churnChange < 0;
  
  return (
    <Card className="border-2 hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
          <div className="w-3 h-3 bg-secondary rounded-full"></div>
          Weekly Report Card
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">Last 7 days performance</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Churn Change */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
          <div>
            <p className="text-sm text-muted-foreground">Churn Change</p>
            <div className="flex items-center gap-2">
              {isImprovement ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              <span className={`font-bold text-lg ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                {weeklyData.churnChange > 0 ? '+' : ''}{weeklyData.churnChange}%
              </span>
            </div>
          </div>
          <Badge variant={isImprovement ? "default" : "destructive"}>
            {isImprovement ? "IMPROVED" : "ALERT"}
          </Badge>
        </div>

        {/* Risk Distribution */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm font-medium text-foreground">Risk Distribution</p>
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            <div className="text-center p-1 sm:p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
              <div className="text-sm sm:text-lg font-bold text-red-700 dark:text-red-400">{weeklyData.highRiskUsers}</div>
              <div className="text-xs text-red-600 dark:text-red-500">High Risk</div>
            </div>
            <div className="text-center p-1 sm:p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm sm:text-lg font-bold text-yellow-700 dark:text-yellow-400">{weeklyData.mediumRiskUsers}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-500">Medium</div>
            </div>
            <div className="text-center p-1 sm:p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
              <div className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-400">{weeklyData.lowRiskUsers}</div>
              <div className="text-xs text-green-600 dark:text-green-500">Low Risk</div>
            </div>
          </div>
        </div>

        {/* Top Risk & Recommendation */}
        <div className="space-y-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Top Risk Factor</p>
            <Badge variant="outline" className="border-accent text-accent-foreground">
              AI INSIGHT
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{weeklyData.topRisk}</p>
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <ArrowRight className="h-3 w-3" />
            {weeklyData.improvement}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

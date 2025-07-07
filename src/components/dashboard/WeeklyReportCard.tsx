import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface WeeklyStats {
  churnChange: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  lowRiskUsers: number;
  topRisk: string;
  improvement: string;
}

const mockWeeklyData: WeeklyStats = {
  churnChange: -12.5,
  highRiskUsers: 8,
  mediumRiskUsers: 23,
  lowRiskUsers: 156,
  topRisk: "Feature abandonment",
  improvement: "Implement onboarding flow"
};

export const WeeklyReportCard = () => {
  const isImprovement = mockWeeklyData.churnChange < 0;
  
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
                {mockWeeklyData.churnChange > 0 ? '+' : ''}{mockWeeklyData.churnChange}%
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
              <div className="text-sm sm:text-lg font-bold text-red-700 dark:text-red-400">{mockWeeklyData.highRiskUsers}</div>
              <div className="text-xs text-red-600 dark:text-red-500">High Risk</div>
            </div>
            <div className="text-center p-1 sm:p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm sm:text-lg font-bold text-yellow-700 dark:text-yellow-400">{mockWeeklyData.mediumRiskUsers}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-500">Medium</div>
            </div>
            <div className="text-center p-1 sm:p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
              <div className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-400">{mockWeeklyData.lowRiskUsers}</div>
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
          <p className="text-sm text-muted-foreground">{mockWeeklyData.topRisk}</p>
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <ArrowRight className="h-3 w-3" />
            {mockWeeklyData.improvement}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
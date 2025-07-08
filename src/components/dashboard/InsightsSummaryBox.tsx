import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Brain, AlertTriangle, CheckCircle } from "lucide-react";

interface UserData {
  id: string;
  user_id: string;
  churn_score: number;
  churn_reason: string | null;
  risk_level: 'low' | 'medium' | 'high';
  understanding_score?: number;
  user_stage?: string;
}

interface InsightsSummaryBoxProps {
  data: UserData[];
  isLoading: boolean;
}

const InsightsSummaryBox = ({ data, isLoading }: InsightsSummaryBoxProps) => {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate insights
  const highRisk = data.filter(user => user.risk_level === 'high').length;
  const mediumRisk = data.filter(user => user.risk_level === 'medium').length;
  const lowRisk = data.filter(user => user.risk_level === 'low').length;
  
  // Most common churn reason
  const churnReasons = data
    .map(user => user.churn_reason)
    .filter(reason => reason && reason !== "🕵️ No strong signals yet")
    .filter(Boolean);
  
  const reasonFrequency = churnReasons.reduce((acc, reason) => {
    acc[reason!] = (acc[reason!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonReason = Object.keys(reasonFrequency).length > 0 
    ? Object.entries(reasonFrequency).sort(([,a], [,b]) => b - a)[0][0]
    : "No clear patterns detected";

  // Average understanding score
  const understandingScores = data
    .map(user => user.understanding_score)
    .filter(score => score !== undefined && score !== null) as number[];
  
  const avgUnderstandingScore = understandingScores.length > 0
    ? Math.round(understandingScores.reduce((a, b) => a + b, 0) / understandingScores.length)
    : 0;

  // New users count
  const newUsers = data.filter(user => user.user_stage === 'new_user').length;

  const getRiskIcon = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getUnderstandingScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  if (data.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No customer data yet. Upload a CSV file to see AI-powered insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights Summary
          <Badge variant="outline" className="ml-auto">
            {data.length} Users Analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Risk Level Cards */}
          <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {getRiskIcon('high')}
            <div>
              <div className="text-2xl font-bold text-destructive">{highRisk}</div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            {getRiskIcon('medium')}
            <div>
              <div className="text-2xl font-bold text-yellow-600">{mediumRisk}</div>
              <div className="text-sm text-muted-foreground">Medium Risk</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            {getRiskIcon('low')}
            <div>
              <div className="text-2xl font-bold text-green-600">{lowRisk}</div>
              <div className="text-sm text-muted-foreground">Low Risk</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{newUsers}</div>
              <div className="text-sm text-muted-foreground">New Users</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Common Churn Reason */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Most Common Churn Pattern
            </h4>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                {mostCommonReason.length > 60 
                  ? mostCommonReason.substring(0, 60) + "..." 
                  : mostCommonReason}
              </p>
              {churnReasons.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Affecting {Object.values(reasonFrequency)[0]} users
                </p>
              )}
            </div>
          </div>

          {/* AI Confidence Score */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Average AI Confidence
            </h4>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-sm font-medium ${getUnderstandingScoreColor(avgUnderstandingScore)}`}>
                    {avgUnderstandingScore}%
                  </div>
                  <div className="text-sm">
                    {avgUnderstandingScore >= 80 ? "Excellent 🔥" : 
                     avgUnderstandingScore >= 50 ? "Moderate" : 
                     "Needs more data"}
                  </div>
                </div>
                <div className="w-20 bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${avgUnderstandingScore}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {understandingScores.length} predictions
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {highRisk > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-200">
                Action Required: {highRisk} users need immediate attention
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsSummaryBox;
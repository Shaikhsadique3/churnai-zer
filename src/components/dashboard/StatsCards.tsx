
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, Shield } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-1 sm:pt-2">
          <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Active customer base
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">High Risk</CardTitle>
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
        </CardHeader>
        <CardContent className="pt-1 sm:pt-2">
          <div className="text-lg sm:text-2xl font-bold text-red-600">🔴 {stats.high}</div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Immediate attention needed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Medium Risk</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
        </CardHeader>
        <CardContent className="pt-1 sm:pt-2">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">🟡 {stats.medium}</div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Monitor closely
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Low Risk</CardTitle>
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
        </CardHeader>
        <CardContent className="pt-1 sm:pt-2">
          <div className="text-lg sm:text-2xl font-bold text-green-600">🟢 {stats.low}</div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Healthy customers
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;

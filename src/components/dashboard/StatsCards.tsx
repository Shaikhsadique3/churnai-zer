
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Customers</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Active customer base</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">High Risk</p>
              <p className="text-3xl font-bold text-red-600">{stats.high}</p>
              <p className="text-xs text-muted-foreground mt-1">Immediate attention needed</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Medium Risk</p>
              <p className="text-3xl font-bold text-amber-600">{stats.medium}</p>
              <p className="text-xs text-muted-foreground mt-1">Monitor closely</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Low Risk</p>
              <p className="text-3xl font-bold text-green-600">{stats.low}</p>
              <p className="text-xs text-muted-foreground mt-1">Healthy customers</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;

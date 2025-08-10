
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity } from 'lucide-react';

interface ActivityRecoveryMatrixProps {
  filters: any;
  isPaidPlan: boolean;
}

export const ActivityRecoveryMatrix = ({ filters, isPaidPlan }: ActivityRecoveryMatrixProps) => {
  const { user } = useAuth();

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ['activity-recovery-matrix', user?.id, filters],
    queryFn: async () => {
      const { data: userData } = await supabase
        .from('user_data')
        .select('user_id, usage, status, risk_level, last_login')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      const { data: recoveryData } = await supabase
        .from('recovery_logs')
        .select('user_id')
        .eq('owner_id', user?.id);

      const recoveredUserIds = new Set(recoveryData?.map(r => r.user_id) || []);

      // Categorize users by activity level
      const matrix = userData?.map(user => {
        const activityLevel = 
          (user.usage || 0) > 15 ? 'High' :
          (user.usage || 0) > 5 ? 'Medium' : 'Low';
        
        const recoveryStatus = recoveredUserIds.has(user.user_id) ? 'Recovered' : 
          user.status === 'at_risk' ? 'At Risk' : 'Stable';
        
        const daysSinceLogin = user.last_login ? 
          Math.floor((new Date().getTime() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24)) : 
          999;
        
        return {
          userId: user.user_id,
          activityLevel,
          recoveryStatus,
          riskLevel: user.risk_level || 'low',
          daysSinceLogin,
          usage: user.usage || 0,
        };
      }) || [];

      return matrix.sort((a, b) => {
        // Sort by risk level (high first) then by activity level
        const riskOrder = { high: 3, medium: 2, low: 1 };
        const activityOrder = { High: 3, Medium: 2, Low: 1 };
        
        if (riskOrder[a.riskLevel as keyof typeof riskOrder] !== riskOrder[b.riskLevel as keyof typeof riskOrder]) {
          return riskOrder[b.riskLevel as keyof typeof riskOrder] - riskOrder[a.riskLevel as keyof typeof riskOrder];
        }
        
        return activityOrder[b.activityLevel as keyof typeof activityOrder] - activityOrder[a.activityLevel as keyof typeof activityOrder];
      });
    },
    enabled: !!user?.id,
  });

  const getRowColor = (riskLevel: string, recoveryStatus: string) => {
    if (recoveryStatus === 'Recovered') return 'bg-green-50 dark:bg-green-950/20';
    if (riskLevel === 'high' && recoveryStatus === 'At Risk') return 'bg-red-50 dark:bg-red-950/20';
    if (riskLevel === 'medium') return 'bg-yellow-50 dark:bg-yellow-950/20';
    return '';
  };

  const getActivityBadge = (level: string) => {
    switch (level) {
      case 'High': return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
      case 'Medium': return <Badge variant="secondary">Medium</Badge>;
      case 'Low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRecoveryBadge = (status: string) => {
    switch (status) {
      case 'Recovered': return <Badge className="bg-green-100 text-green-800">Recovered</Badge>;
      case 'At Risk': return <Badge variant="destructive">At Risk</Badge>;
      case 'Stable': return <Badge variant="outline">Stable</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity × Recovery Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limit to top 20 users for display
  const displayData = matrixData?.slice(0, 20) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity × Recovery Status Matrix
        </CardTitle>
        <CardDescription>
          Color-coded view of user activity levels and recovery status for quick targeting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Activity Level</TableHead>
                <TableHead>Usage Score</TableHead>
                <TableHead>Recovery Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Days Since Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No user data available
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((user, index) => (
                  <TableRow 
                    key={index} 
                    className={getRowColor(user.riskLevel, user.recoveryStatus)}
                  >
                    <TableCell className="font-medium font-mono text-sm">
                      {user.userId}
                    </TableCell>
                    <TableCell>
                      {getActivityBadge(user.activityLevel)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{user.usage}</span>
                    </TableCell>
                    <TableCell>
                      {getRecoveryBadge(user.recoveryStatus)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.riskLevel === 'high' ? 'destructive' : 
                          user.riskLevel === 'medium' ? 'secondary' : 'default'
                        }
                      >
                        {user.riskLevel.charAt(0).toUpperCase() + user.riskLevel.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${
                        user.daysSinceLogin > 30 ? 'text-red-600' :
                        user.daysSinceLogin > 7 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {user.daysSinceLogin > 999 ? 'Never' : `${user.daysSinceLogin}d`}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {displayData.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing top 20 users. Use filters above to refine your view.
          </div>
        )}
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-2">Quick Action Guide:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span>High Risk + At Risk = Immediate intervention needed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span>Medium Risk = Monitor closely</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>Recovered = Success case study</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

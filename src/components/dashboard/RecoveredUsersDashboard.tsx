
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, Users, TrendingUp } from "lucide-react";
import { format } from 'date-fns';

interface RecoveryLog {
  id: string;
  user_id: string;
  recovered_at: string;
  revenue_saved: number;
  recovery_reason: string;
}

export const RecoveredUsersDashboard = () => {
  const { user } = useAuth();

  const { data: recoveryLogs = [], isLoading } = useQuery({
    queryKey: ['recovery-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('recovery_logs')
        .select('*')
        .eq('owner_id', user.id)
        .order('recovered_at', { ascending: false });
      
      if (error) throw error;
      return data as RecoveryLog[];
    },
    enabled: !!user?.id,
  });

  const totalRevenueSaved = recoveryLogs.reduce((sum, log) => sum + (log.revenue_saved || 0), 0);
  const totalRecovered = recoveryLogs.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recovered</p>
                <p className="text-2xl font-bold">{totalRecovered}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Saved</p>
                <p className="text-2xl font-bold">${totalRevenueSaved.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {recoveryLogs.filter(log => {
                    const logDate = new Date(log.recovered_at);
                    const currentDate = new Date();
                    return logDate.getMonth() === currentDate.getMonth() && 
                           logDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Recoveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Recovery Date</TableHead>
                <TableHead>Revenue Saved</TableHead>
                <TableHead>Recovery Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : recoveryLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">No recovery data found.</TableCell>
                </TableRow>
              ) : (
                recoveryLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono">{log.user_id}</TableCell>
                    <TableCell>{format(new Date(log.recovered_at), 'MMM d, yyyy h:mm a')}</TableCell>
                    <TableCell>${log.revenue_saved}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.recovery_reason}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

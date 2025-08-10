
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';

interface UserData {
  id: string;
  user_id: string;
  churn_score: number;
  risk_level: string;
  created_at: string;
  monthly_revenue: number;
  status: string;
}

export const UsersTable = () => {
  const { user } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserData[];
    },
    enabled: !!user?.id,
  });

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Churn Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">No user data found.</TableCell>
              </TableRow>
            ) : (
              users.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell className="font-mono">{userData.user_id}</TableCell>
                  <TableCell>{(userData.churn_score * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(userData.risk_level)}>
                      {userData.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>${userData.monthly_revenue}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{userData.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(userData.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface UserRiskData {
  id: string;
  user_id: string;
  churn_score: number;
  churn_reason: string;
  last_login: string;
  plan: string;
  usage: number;
  risk_level: 'high' | 'medium' | 'low';
  created_at: string;
}

export const UserRiskTable = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'churn_score' | 'last_login' | 'created_at'>('churn_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: userRiskData, isLoading } = useQuery({
    queryKey: ['user-risk-data', user?.id, sortBy, sortOrder, riskFilter],
    queryFn: async (): Promise<UserRiskData[]> => {
      let query = supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user?.id)
        .not('is_deleted', 'eq', true);

      if (riskFilter !== 'all') {
        query = query.eq('risk_level', riskFilter);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      return data as UserRiskData[];
    },
    enabled: !!user?.id,
  });

  const filteredData = userRiskData?.filter(user => 
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSort = (column: 'churn_score' | 'last_login' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getRiskBadge = (riskLevel: string, churnScore: number) => {
    const score = Math.round(churnScore * 100);
    switch (riskLevel) {
      case 'high':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            High ({score}%)
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <Shield className="h-3 w-3" />
            Medium ({score}%)
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            Low ({score}%)
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const calculateRevenue = (plan: string, usage: number) => {
    const planPrices = { 'Free': 0, 'Pro': 29, 'Enterprise': 99 };
    const basePrice = planPrices[plan as keyof typeof planPrices] || 0;
    const usageMultiplier = Math.max(1, Math.floor(usage / 100));
    return basePrice * usageMultiplier;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 User Risk Analysis
        </CardTitle>
        <CardDescription>
          Monitor and analyze user churn risk levels with detailed insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Email</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('churn_score')}
                    className="h-auto p-0 font-semibold"
                  >
                    Churn Score <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Churn Reason</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('last_login')}
                    className="h-auto p-0 font-semibold"
                  >
                    Last Login <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell className="font-medium">
                      {userData.user_id}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold">
                        {Math.round((userData.churn_score || 0) * 100)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(userData.risk_level, userData.churn_score || 0)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {userData.churn_reason || 'No reason specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {userData.last_login ? (
                        <span className="text-sm">
                          {format(new Date(userData.last_login), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ${calculateRevenue(userData.plan || 'Free', userData.usage || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {userData.plan || 'Free'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredData.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {userRiskData?.length || 0} users
          </div>
        )}
      </CardContent>
    </Card>
  );
};
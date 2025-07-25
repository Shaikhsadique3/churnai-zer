import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, ExternalLink, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface UserPrediction {
  id: string;
  user_id: string;
  plan: string;
  churn_score: number;
  churn_reason: string;
  last_login: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
  source: string;
}

const ITEMS_PER_PAGE = 50;

export const UserPredictionsTable = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch SDK users data only
  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ['user-predictions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('source', 'sdk')
        .not('user_id', 'like', '%test%')
        .not('user_id', 'like', '%@saas.com%')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserPrediction[];
    },
    enabled: !!user?.id,
  });

  // Filter and paginate data
  const filteredUsers = useMemo(() => {
    if (!userData) return [];
    
    return userData.filter(user => {
      const matchesSearch = !searchTerm || 
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = riskFilter === 'all' || user.risk_level === riskFilter;
      
      return matchesSearch && matchesRisk;
    });
  }, [userData, searchTerm, riskFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Risk badge styling
  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // CSV Export
  const handleDownloadCSV = () => {
    if (!filteredUsers.length) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const csvHeaders = ['User ID', 'Plan', 'Churn Score', 'Risk Level', 'Last Login', 'Churn Reason', 'Created At'];
    const csvData = filteredUsers.map(user => [
      user.user_id,
      user.plan || 'Free',
      user.churn_score?.toFixed(2) || '0.00',
      user.risk_level,
      user.last_login ? format(new Date(user.last_login), 'yyyy-MM-dd HH:mm') : 'N/A',
      user.churn_reason || 'No reason provided',
      format(new Date(user.created_at), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user-predictions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast({ title: "CSV exported successfully" });
  };

  if (usersLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state for no SDK users
  if (!userData || userData.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No user predictions yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Install the Churnaizer SDK to start tracking user behavior and generating churn predictions.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/integration')}
            className="mt-4"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to SDK Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Predictions
            </CardTitle>
            <CardDescription>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} tracked via SDK
            </CardDescription>
          </div>
          <Button
            onClick={handleDownloadCSV}
            variant="outline"
            size="sm"
            className="w-fit"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={riskFilter} onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setRiskFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
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

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Churn Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Churn Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users match your filter criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {user.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.plan || 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(user.churn_score * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeColor(user.risk_level)}>
                        {user.risk_level?.charAt(0).toUpperCase() + user.risk_level?.slice(1) || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login ? format(new Date(user.last_login), 'MMM dd, yyyy') : 'Never'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {user.churn_reason || 'No reason provided'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
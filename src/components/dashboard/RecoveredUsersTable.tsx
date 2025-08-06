import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RecoveredUser {
  id: string;
  user_id: string;
  recovered_at: string;
  recovery_reason: string;
  revenue_saved: number;
}

const ITEMS_PER_PAGE = 50;

export const RecoveredUsersTable = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch recovered users data
  const { data: recoveredUsers, isLoading, refetch } = useQuery({
    queryKey: ['recovered-users', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recovery_logs')
        .select('*')
        .eq('owner_id', user?.id)
        .order('recovered_at', { ascending: false });
      
      if (error) throw error;
      return data as RecoveredUser[];
    },
    enabled: !!user?.id,
  });

  // Filter and paginate data
  const filteredUsers = useMemo(() => {
    if (!recoveredUsers) return [];
    
    return recoveredUsers.filter(user => {
      const matchesSearch = !searchTerm || 
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.recovery_reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [recoveredUsers, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Calculate total revenue saved
  const totalRevenueSaved = useMemo(() => {
    return filteredUsers.reduce((sum, user) => sum + (user.revenue_saved || 0), 0);
  }, [filteredUsers]);

  // CSV Export
  const handleDownloadCSV = () => {
    if (!filteredUsers.length) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const csvHeaders = ['User ID', 'Recovery Date', 'Recovery Reason', 'Revenue Saved'];
    const csvData = filteredUsers.map(user => [
      user.user_id,
      format(new Date(user.recovered_at), 'yyyy-MM-dd HH:mm'),
      user.recovery_reason,
      `$${user.revenue_saved.toFixed(2)}`
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recovered-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast({ title: "CSV exported successfully" });
  };

  if (isLoading) {
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

  // Empty state
  if (!recoveredUsers || recoveredUsers.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No recovered users yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              When high-risk users come back and engage again, they'll appear here with revenue saved metrics.
            </p>
          </div>
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
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recovered Users
            </CardTitle>
            <CardDescription>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} recovered • 
              ${totalRevenueSaved.toFixed(2)} total revenue saved
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search Control */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by User ID or recovery reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Recovery Date</TableHead>
                <TableHead>Recovery Reason</TableHead>
                <TableHead className="text-right">Revenue Saved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users match your search criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {user.user_id}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.recovered_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {user.recovery_reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${user.revenue_saved.toFixed(2)}
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
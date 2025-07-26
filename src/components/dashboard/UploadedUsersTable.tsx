import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Upload, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UploadedUser {
  id: string;
  user_id: string;
  plan: string;
  churn_score: number;
  churn_reason: string;
  last_login: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
  days_until_mature: number;
}

interface CSVUpload {
  id: string;
  filename: string;
  created_at: string;
  rows_processed: number;
  status: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

interface UploadedUsersTableProps {
  onUserSelect?: (user: UploadedUser | null) => void;
}

export const UploadedUsersTable = ({ onUserSelect }: UploadedUsersTableProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch users data
  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ['uploaded-users', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UploadedUser[];
    },
    enabled: !!user?.id,
  });

  // Fetch latest CSV upload info
  const { data: latestUpload } = useQuery({
    queryKey: ['latest-csv-upload', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as CSVUpload | null;
    },
    enabled: !!user?.id,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('id', userId)
        .eq('owner_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-users'] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    if (!userData) return [];
    
    return userData.filter(user => {
      const matchesSearch = user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.plan?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || user.risk_level === riskFilter;
      
      return matchesSearch && matchesRisk;
    });
  }, [userData, searchTerm, riskFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const isNewUser = (daysUntilMature: number) => daysUntilMature > 0 && daysUntilMature <= 7;

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const handleDownloadCSV = () => {
    if (!filteredUsers.length) return;
    
    const headers = ['User ID', 'Plan', 'Churn Score', 'Risk Level', 'Last Login', 'Churn Reason'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.user_id,
        user.plan || '',
        user.churn_score || '',
        user.risk_level || '',
        user.last_login ? format(new Date(user.last_login), 'yyyy-MM-dd') : '',
        `"${user.churn_reason || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uploaded-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (usersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Uploaded Users
            </CardTitle>
            <CardDescription>
              {latestUpload ? (
                <span>
                  Last upload: <strong>{latestUpload.filename}</strong> on {format(new Date(latestUpload.created_at), 'MMM d, yyyy at h:mm a')} 
                  ({latestUpload.rows_processed} users)
                </span>
              ) : (
                "No CSV uploads found"
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadCSV} disabled={!filteredUsers.length}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Reupload
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by User ID or Plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>

          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
        </div>

        {/* Table - Responsive Design */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">User ID</TableHead>
                <TableHead className="min-w-[60px]">Plan</TableHead>
                <TableHead className="min-w-[80px]">Churn Score</TableHead>
                <TableHead className="min-w-[80px]">Risk Level</TableHead>
                <TableHead className="min-w-[90px] hidden sm:table-cell">Last Login</TableHead>
                <TableHead className="min-w-[150px] hidden md:table-cell">Churn Reason</TableHead>
                <TableHead className="min-w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.location.href = `/users/${userData.id}`}
                          className="text-primary hover:underline focus:outline-none text-sm truncate max-w-[100px]"
                          title={userData.user_id}
                        >
                          {userData.user_id}
                        </button>
                        {isNewUser(userData.days_until_mature) && (
                          <Badge variant="secondary" className="text-xs">NEW</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {userData.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium text-sm px-2 py-1 rounded ${
                        userData.churn_score > 0.75 ? 'bg-destructive/20 text-destructive' : 
                        userData.churn_score > 0.4 ? 'bg-secondary/20 text-secondary-foreground' : 
                        'bg-primary/20 text-primary'
                      }`}>
                        {userData.churn_score ? (userData.churn_score * 100).toFixed(1) + '%' : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeColor(userData.risk_level)} className="text-xs">
                        {userData.risk_level?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                      {userData.last_login ? format(new Date(userData.last_login), 'MMM d, yyyy') : 'Never'}
                    </TableCell>
                    <TableCell className="max-w-[150px] text-sm text-muted-foreground hidden md:table-cell">
                      <span className="truncate block" title={userData.churn_reason}>
                        {userData.churn_reason || 'No reason specified'}
                      </span>
                    </TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center gap-1">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => onUserSelect?.(userData)}
                           className="h-8 w-8 p-0"
                           title="Select for email preview"
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => deleteUserMutation.mutate(userData.id)}
                           disabled={deleteUserMutation.isPending}
                           className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
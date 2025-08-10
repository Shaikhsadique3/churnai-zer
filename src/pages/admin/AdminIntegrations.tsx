
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, RefreshCw, Search, Filter } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  website: string;
  user_id: string;
  api_key: string;
  founder_id: string;
  status: 'success' | 'fail';
  checked_at: string;
  error_message?: string;
  trace_id?: string;
  founder_email?: string;
}

const AdminIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'fail'>('all');
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    uniqueWebsites: 0,
    uniqueFounders: 0
  });

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      // Fetch integrations with founder profiles
      const { data: integrationsData, error } = await supabase
        .from('integrations')
        .select(`
          *,
          profiles!integrations_founder_id_fkey(id)
        `)
        .order('checked_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Process integrations data and ensure proper typing
      const processedIntegrations: Integration[] = integrationsData?.map(integration => ({
        id: integration.id,
        website: integration.website,
        user_id: integration.user_id,
        api_key: integration.api_key,
        founder_id: integration.founder_id,
        status: integration.status as 'success' | 'fail',
        checked_at: integration.checked_at,
        error_message: integration.error_message || undefined,
        trace_id: integration.trace_id || undefined,
        founder_email: `founder-${integration.founder_id.slice(0, 8)}@example.com` // Placeholder
      })) || [];

      setIntegrations(processedIntegrations);

      // Calculate stats
      const total = processedIntegrations.length;
      const successful = processedIntegrations.filter(i => i.status === 'success').length;
      const failed = total - successful;
      const uniqueWebsites = new Set(processedIntegrations.map(i => i.website)).size;
      const uniqueFounders = new Set(processedIntegrations.map(i => i.founder_id)).size;

      setStats({
        total,
        successful,
        failed,
        uniqueWebsites,
        uniqueFounders
      });

    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = 
      integration.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.founder_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SDK Integrations</h1>
          <p className="text-muted-foreground">Monitor real-time SDK integration status across all founders</p>
        </div>
        <Button onClick={fetchIntegrations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueWebsites}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Founders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueFounders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by website, founder email, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('success')}
              >
                Success
              </Button>
              <Button
                variant={statusFilter === 'fail' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('fail')}
              >
                Failed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Integration History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website</TableHead>
                  <TableHead>Founder</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checked At</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIntegrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">{integration.website}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{integration.founder_email}</div>
                        <div className="text-muted-foreground text-xs">
                          {integration.founder_id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{integration.user_id}</TableCell>
                    <TableCell>{getStatusBadge(integration.status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(integration.checked_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {integration.api_key}
                    </TableCell>
                    <TableCell>
                      {integration.error_message && (
                        <span className="text-red-600 text-sm">
                          {integration.error_message}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredIntegrations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No integrations found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIntegrations;

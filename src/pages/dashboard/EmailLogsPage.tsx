import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Search, Filter, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EmailLog {
  id: string;
  target_email: string;
  target_user_id: string | null;
  template_id: string | null;
  playbook_id: string | null;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  email_data: any;
  created_at: string;
  email_templates?: {
    name: string;
    subject: string;
  };
  playbooks?: {
    name: string;
  };
}

export const EmailLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch email logs
  const { data: emailLogs, isLoading } = useQuery({
    queryKey: ['email-logs', searchTerm, statusFilter],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let query = supabase
        .from('email_logs')
        .select(`
          *,
          email_templates(name, subject),
          playbooks(name)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.ilike('target_email', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmailLog[];
    },
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!emailLogs) return { total: 0, sent: 0, failed: 0, pending: 0, successRate: 0 };
    
    const total = emailLogs.length;
    const sent = emailLogs.filter(log => log.status === 'sent').length;
    const failed = emailLogs.filter(log => log.status === 'failed').length;
    const pending = emailLogs.filter(log => log.status === 'pending').length;
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    return { total, sent, failed, pending, successRate };
  }, [emailLogs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">📊 Email Logs</h1>
          <p className="text-muted-foreground">Track all your automated emails</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-20 rounded-lg"></div>
          ))}
        </div>
        <div className="animate-pulse bg-muted h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">📊 Email Logs</h1>
        <p className="text-muted-foreground">Track all your automated emails and their performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successfully Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">{stats.successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Delivery issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">In queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>Detailed view of all email activities</CardDescription>
        </CardHeader>
        <CardContent>
          {emailLogs?.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Email Logs</h3>
              <p className="text-muted-foreground">
                Email logs will appear here once you start sending automated emails
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Playbook</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.target_email}</div>
                          {log.target_user_id && (
                            <div className="text-sm text-muted-foreground">
                              User ID: {log.target_user_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.email_templates ? (
                          <div>
                            <div className="font-medium">{log.email_templates.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-48">
                              {log.email_templates.subject}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Manual Email</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.playbooks?.name || (
                          <span className="text-muted-foreground">Direct Send</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {log.sent_at ? (
                          <div className="text-sm">
                            {format(new Date(log.sent_at), 'MMM dd, yyyy')}
                            <br />
                            <span className="text-muted-foreground">
                              {format(new Date(log.sent_at), 'HH:mm')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {log.opened_at && (
                            <Badge variant="outline" className="text-xs">Opened</Badge>
                          )}
                          {log.clicked_at && (
                            <Badge variant="outline" className="text-xs">Clicked</Badge>
                          )}
                          {log.email_data?.test_email && (
                            <Badge variant="secondary" className="text-xs">Test</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
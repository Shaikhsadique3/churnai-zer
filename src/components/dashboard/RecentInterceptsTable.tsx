import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface RecentIntercept {
  id: string;
  user_id: string;
  plan: string;
  offer_type: string;
  outcome: 'success' | 'failed' | 'pending';
  revenue_saved: number;
  created_at: string;
  customer_segment?: string;
}

interface RecentInterceptsTableProps {
  data: RecentIntercept[];
}

export const RecentInterceptsTable: React.FC<RecentInterceptsTableProps> = ({ data }) => {
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const planColors: Record<string, string> = {
      'Enterprise': 'bg-purple-100 text-purple-800',
      'Pro': 'bg-blue-100 text-blue-800',
      'Basic': 'bg-gray-100 text-gray-800',
      'Free': 'bg-green-100 text-green-800'
    };

    return (
      <Badge 
        variant="outline" 
        className={planColors[plan] || 'bg-gray-100 text-gray-800'}
      >
        {plan}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Intercepts</CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest cancel protection attempts and outcomes
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Offer Type</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Revenue Saved</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No recent intercepts found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((intercept) => (
                  <TableRow key={intercept.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{intercept.user_id}</span>
                        {intercept.customer_segment && (
                          <span className="text-xs text-muted-foreground">
                            {intercept.customer_segment}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(intercept.plan)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{intercept.offer_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOutcomeIcon(intercept.outcome)}
                        {getOutcomeBadge(intercept.outcome)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {intercept.outcome === 'success' && intercept.revenue_saved > 0 ? (
                        <span className="text-green-600">
                          {formatCurrency(intercept.revenue_saved)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(intercept.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <span>Showing {data.length} recent intercepts</span>
            <div className="flex gap-4">
              <span>
                Success: {data.filter(i => i.outcome === 'success').length}
              </span>
              <span>
                Failed: {data.filter(i => i.outcome === 'failed').length}
              </span>
              <span>
                Pending: {data.filter(i => i.outcome === 'pending').length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
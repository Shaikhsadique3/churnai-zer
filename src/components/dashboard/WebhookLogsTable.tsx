import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Eye, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebhookLog {
  id: string;
  webhook_url: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  triggered_at: string;
  success: boolean;
  error_message: string | null;
  target_user_id: string;
  playbook_id: string | null;
}

export const WebhookLogsTable = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadWebhookLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading webhook logs:', error);
        toast({
          title: "Error",
          description: "Failed to load webhook logs",
          variant: "destructive",
        });
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
      toast({
        title: "Error",
        description: "Failed to load webhook logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWebhookLogs();
  }, []);

  const getStatusBadge = (log: WebhookLog) => {
    if (log.success) {
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🔗 Webhook Activity
            </CardTitle>
            <CardDescription>Monitor webhook deliveries and troubleshoot issues</CardDescription>
          </div>
          <Button onClick={loadWebhookLogs} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No webhook deliveries yet</p>
            <p className="text-sm">Webhook logs will appear here when churn data is sent to your external tools</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {logs.filter(log => log.success).length}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {logs.filter(log => !log.success).length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {logs.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Webhook URL</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Triggered At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {getStatusBadge(log)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.target_user_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm max-w-[200px] truncate">
                          {log.webhook_url}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyWebhookUrl(log.webhook_url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {log.response_status ? (
                          <Badge variant={log.response_status < 300 ? "default" : "destructive"}>
                            {log.response_status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No response</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(log.triggered_at)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Webhook Delivery Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about this webhook delivery
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Status</h4>
                                {getStatusBadge(log)}
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Response Code</h4>
                                <p className="text-sm">{log.response_status || 'N/A'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Target User</h4>
                                <p className="text-sm font-mono">{log.target_user_id}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Triggered At</h4>
                                <p className="text-sm">{formatDate(log.triggered_at)}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Webhook URL</h4>
                              <div className="bg-muted p-3 rounded text-sm font-mono break-all">
                                {log.webhook_url}
                              </div>
                            </div>

                            {log.error_message && (
                              <div>
                                <h4 className="font-medium mb-2 text-red-600">Error Message</h4>
                                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                                  {log.error_message}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Payload Sent</h4>
                              <ScrollArea className="h-48 w-full border rounded">
                                <pre className="p-4 text-xs">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>

                            {log.response_body && (
                              <div>
                                <h4 className="font-medium mb-2">Response Body</h4>
                                <ScrollArea className="h-32 w-full border rounded">
                                  <pre className="p-4 text-xs">
                                    {log.response_body}
                                  </pre>
                                </ScrollArea>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
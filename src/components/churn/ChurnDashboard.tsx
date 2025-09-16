import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessingStatus {
  status: 'received' | 'processing' | 'done' | 'failed';
  progress?: number;
  message?: string;
  analysis?: {
    total_customers: number;
    high_risk_percentage: number;
    churn_rate: number;
    top_churn_reasons: string[];
  };
}

export const ChurnDashboard = () => {
  const { uploadId } = useParams();
  const [status, setStatus] = useState<ProcessingStatus>({ status: 'received' });
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(true);
  const { toast } = useToast();

  const checkProcessingStatus = async () => {
    if (!uploadId) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-status', {
        body: { upload_id: uploadId }
      });

      if (error) throw error;

      if (data.status === 'done' || data.status === 'failed') {
        setPollingActive(false);
      }

      // Get instant summary if processing is complete
      if (data.status === 'done') {
        try {
          const { data: summaryData } = await supabase.functions.invoke('get-instant-summary', {
            body: { upload_id: uploadId }
          });
          
          if (summaryData && summaryData.status !== 'processing') {
            setStatus({
              status: 'done',
              analysis: summaryData
            });
          }
        } catch (summaryError) {
          console.warn('Could not fetch summary:', summaryError);
          setStatus({ status: 'done' });
        }
      } else {
        setStatus({ 
          status: data.status,
          progress: getProgressByStatus(data.status)
        });
      }

    } catch (error: any) {
      console.error('Status check error:', error);
      if (error.message?.includes('not found')) {
        setStatus({ status: 'failed', message: 'Upload not found' });
        setPollingActive(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressByStatus = (status: string): number => {
    switch (status) {
      case 'received': return 15;
      case 'processing': return 65;
      case 'done': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  useEffect(() => {
    checkProcessingStatus();

    if (pollingActive) {
      const interval = setInterval(checkProcessingStatus, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [uploadId, pollingActive]);

  const handleDownloadReport = () => {
    if (uploadId) {
      window.open(`https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/download-report/${uploadId}`, '_blank');
    }
  };

  const handleHealthCheck = async () => {
    try {
      const { data } = await supabase.functions.invoke('health');
      toast({
        title: "System Status",
        description: `Status: ${data.status} - Version: ${data.version}`,
        variant: data.status === 'healthy' ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: "Health Check Failed",
        description: "System may be experiencing issues",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading churn analysis dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Churn Analysis Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Real-time processing status and insights
          </p>
          <Button variant="outline" size="sm" onClick={handleHealthCheck} className="mt-2">
            System Health
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Processing Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status.status === 'processing' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                {status.status === 'done' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {status.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-500" />}
                {status.status === 'received' && <Clock className="h-5 w-5 text-yellow-500" />}
                Processing Status
              </CardTitle>
              <CardDescription>
                Current status of your churn analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={status.status === 'done' ? 'default' : 'secondary'}>
                    {status.status === 'received' && 'Queued for Processing'}
                    {status.status === 'processing' && 'Analyzing Customer Data...'}
                    {status.status === 'done' && 'Analysis Complete'}
                    {status.status === 'failed' && 'Processing Failed'}
                  </Badge>
                  {status.progress && (
                    <span className="text-sm text-muted-foreground">
                      {status.progress}% Complete
                    </span>
                  )}
                </div>
                
                {status.progress && (
                  <Progress value={status.progress} className="w-full" />
                )}

                {status.status === 'processing' && (
                  <p className="text-sm text-muted-foreground">
                    ⚡ Processing typically takes 30-90 seconds for most datasets
                  </p>
                )}

                {status.message && (
                  <p className="text-sm text-red-600">{status.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          {status.analysis && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status.analysis.total_customers}</div>
                  <p className="text-xs text-muted-foreground">customers analyzed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {status.analysis.high_risk_percentage}%
                  </div>
                  <p className="text-xs text-muted-foreground">need immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {status.analysis.churn_rate}%
                  </div>
                  <p className="text-xs text-muted-foreground">predicted churn rate</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Churn Reasons */}
          {status.analysis?.top_churn_reasons && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Top Churn Risk Factors
                </CardTitle>
                <CardDescription>
                  Primary reasons driving customer churn in your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {status.analysis.top_churn_reasons.slice(0, 5).map((reason, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm">{reason}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Download Report */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Download Your Churn Audit Report</CardTitle>
              <CardDescription>
                Professional PDF report with insights, recommendations, and action plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Complete risk distribution analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Top 10 high-risk customers (anonymized)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Actionable retention playbook
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Industry benchmarks and quick wins
                  </li>
                </ul>

                <Button 
                  onClick={handleDownloadReport}
                  disabled={status.status !== 'done'}
                  className="w-full"
                  size="lg"
                >
                  {status.status === 'done' ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Churn Audit Report
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Report Will Be Available When Processing Completes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about your analysis? Contact us at support@churnaizer.com
          </p>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportStatus {
  status: 'received' | 'processing' | 'done' | 'failed';
  free_report_url: string | null;
  payment_status: 'created' | 'paid' | 'failed' | null;
}

export const ChurnReport = () => {
  const { uploadId } = useParams();
  const [searchParams] = useSearchParams();
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();

  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    if (paymentStatus === 'success') {
      toast({
        title: "Payment successful!",
        description: "Your full report is being generated and will be emailed to you shortly."
      });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "You can still download your free report and upgrade later.",
        variant: "destructive"
      });
    }
  }, [paymentStatus, toast]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!uploadId) return;

      try {
        const { data, error } = await supabase.functions.invoke('check-status', {
          body: { upload_id: uploadId }
        });

        if (error) throw error;
        setReportStatus(data);
      } catch (error: any) {
        console.error('Status check error:', error);
        toast({
          title: "Error checking status",
          description: "Please refresh the page to try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Poll status every 10 seconds if still processing
    const interval = setInterval(() => {
      if (reportStatus?.status === 'processing' || reportStatus?.status === 'received') {
        checkStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [uploadId, reportStatus?.status, toast]);

  const handleUnlockFullReport = async () => {
    if (!uploadId) return;

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { upload_id: uploadId }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.checkout_url, '_blank');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return 'Analysis queued';
      case 'processing':
        return 'Analyzing your data...';
      case 'done':
        return 'Analysis complete';
      case 'failed':
        return 'Analysis failed';
      default:
        return 'Unknown status';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading report status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Report Not Found</h1>
            <p className="text-muted-foreground">The requested report could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Your Churn Audit Report
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your analysis progress and download reports
          </p>
        </div>

        <div className="grid gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(reportStatus.status)}
                Analysis Status
              </CardTitle>
              <CardDescription>
                Current status of your churn analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={reportStatus.status === 'done' ? 'default' : 'secondary'}>
                    {getStatusText(reportStatus.status)}
                  </Badge>
                  {reportStatus.status === 'processing' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      This usually takes 2-5 minutes. We'll email you when it's ready.
                    </p>
                  )}
                  {reportStatus.status === 'failed' && (
                    <p className="text-sm text-red-600 mt-2">
                      Something went wrong during analysis. Please contact support.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Free Report Card */}
          <Card>
            <CardHeader>
              <CardTitle>Free Churn Audit Report</CardTitle>
              <CardDescription>
                Basic analysis with risk distribution and top insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Risk distribution overview
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Top churn reasons identified
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Top 10 high-risk customers
                  </li>
                </ul>
                
                {reportStatus.free_report_url ? (
                  <Button asChild className="w-full">
                    <a href={reportStatus.free_report_url} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download Free Report
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    {reportStatus.status === 'failed' ? 'Report Failed' : 'Report Not Ready'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Full Report Card */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Full Churn Audit Report</CardTitle>
                  <CardDescription>
                    Complete analysis with segmentation, benchmarks, and action plans
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground">$99</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Everything in free report
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Detailed customer segmentation by plan, revenue, and activity
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Industry benchmarks and competitive analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    90-day retention action plan with quick wins
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Recommended retention playbook and email templates
                  </li>
                </ul>

                {reportStatus.payment_status === 'paid' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">✓ Full report purchased!</p>
                    <p className="text-green-700 text-sm">
                      Your comprehensive report is being generated and will be emailed to you within 10 minutes.
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleUnlockFullReport}
                    disabled={checkoutLoading || reportStatus.status !== 'done'}
                    className="w-full"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening checkout...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Unlock Full Report - $99
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about your report? Contact us at support@churnaudit.com
          </p>
        </div>
      </div>
    </div>
  );
};
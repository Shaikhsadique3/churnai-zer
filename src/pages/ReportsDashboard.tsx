import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ReportData {
  id: string;
  filename: string;
  status: string;
  created_at: string;
  email: string;
  csv_url?: string;
  user_id?: string;
}

interface UploadProgress {
  uploadId: string;
  progress: number;
  stage: string;
}

export const ReportsDashboard = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('churn_uploads')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error loading reports",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user?.id, fetchReports]);

  // Poll for status updates on processing reports
  useEffect(() => {
    const processingReports = reports.filter(r => r.status === 'processing' || r.status === 'received');
    
    if (processingReports.length === 0) return;

    const interval = setInterval(async () => {
      for (const report of processingReports) {
        try {
          const { data } = await supabase.functions.invoke('check-status', {
            body: { upload_id: report.id }
          });

          if (data?.status && data.status !== report.status) {
            // Status changed, refresh the reports list
            fetchReports();
            
            if (data.status === 'done') {
              toast({
                title: "Report ready!",
                description: `Your analysis for ${report.filename} is complete.`
              });
            }
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [reports, fetchReports, toast]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !user?.email) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file only.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress({ uploadId: '', progress: 10, stage: 'Uploading file...' });

    try {
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('enhanced-churn-upload', {
        body: formData
      });

      if (error) throw error;

      setUploadProgress({ uploadId: data.upload_id, progress: 100, stage: 'Upload complete!' });
      
      toast({
        title: "Upload successful!",
        description: "Your CSV has been uploaded and analysis has started."
      });

      // Refresh reports list to show new upload
      setTimeout(() => {
        fetchReports();
        setUploadProgress(null);
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  }, [user?.email, toast, fetchReports]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: uploading
  });

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
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'done':
        return 'Complete';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      window.open(`https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/download-report/${reportId}`, '_blank');
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const inProgressReports = reports.filter(r => r.status === 'processing' || r.status === 'received');
  const completedReports = reports.filter(r => r.status === 'done');
  const failedReports = reports.filter(r => r.status === 'failed');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Reports Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload CSV files and manage your churn analysis reports
            </p>
          </div>
          <Button onClick={fetchReports} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Upload New CSV
            </CardTitle>
            <CardDescription>
              Upload a customer data CSV file to generate a new churn analysis report
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadProgress ? (
              <div className="space-y-4">
                <Progress value={uploadProgress.progress} className="w-full" />
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{uploadProgress.stage}</span>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
                } ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-primary mx-auto" />
                    <p className="text-lg">Drop your CSV file here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-lg">Drag & drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse (max 10MB)</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports in Progress */}
        {inProgressReports.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Reports in Progress ({inProgressReports.length})
              </CardTitle>
              <CardDescription>
                Your uploads are being processed. This typically takes 2-5 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inProgressReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.status)}
                      <div>
                        <p className="font-medium">{report.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Started {formatDate(report.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {getStatusText(report.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Reports */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Reports ({completedReports.length})
            </CardTitle>
            <CardDescription>
              Your finished churn analysis reports ready for download
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No completed reports yet</p>
                <p className="text-muted-foreground">
                  Upload a CSV file above to generate your first churn analysis report
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{report.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed {formatDate(report.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/report/${report.id}`, '_blank')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDownload(report.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Reports */}
        {failedReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Failed Reports ({failedReports.length})
              </CardTitle>
              <CardDescription>
                These reports encountered errors during processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">{report.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Failed {formatDate(report.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">
                      Failed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
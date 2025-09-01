
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Download,
  Info
} from 'lucide-react';

export const CSVUploadPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCsvFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    } 
  });

  const uploadCSVMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const fileExt = file.name.split('.').pop();
      const filePath = `csv_uploads/${session.user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('csv-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Call function to process the CSV file with churn prediction
      const { error: processError } = await supabase.functions.invoke('churn-csv-handler', {
        body: {
          fileName: filePath,
          userId: session.user.id
        }
      });

      if (processError) {
        console.error("Error processing CSV:", processError);
        // Optionally delete the uploaded file if processing fails
        await supabase.storage.from('csv-uploads').remove([filePath]);
        throw processError;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "CSV file uploaded and AI analysis completed! Check your dashboard for insights.",
      });
      queryClient.invalidateQueries({ queryKey: ['csv-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-predictions'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['retention-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['churn-clusters'] });
      setCsvFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const downloadTemplate = () => {
    const requiredHeaders = [
      'user_id',
      'plan', 
      'last_login',
      'avg_session_duration',
      'billing_status',
      'monthly_revenue',
      'feature_usage_count',
      'support_tickets'
    ];
    
    const optionalHeaders = [
      'feature_adopted',
      'cancellation_reason'
    ];
    
    const allHeaders = [...requiredHeaders, ...optionalHeaders];
    
    const sampleRows = [
      [
        'user_001',
        'Pro',
        '2025-01-15',
        '25.5',
        'Active',
        '99.00',
        '12',
        '1',
        'dashboard,analytics,reports',
        ''
      ],
      [
        'user_002',
        'Free',
        '2024-12-20',
        '5.2',
        'Active',
        '0',
        '3',
        '0',
        'dashboard',
        ''
      ],
      [
        'user_003',
        'Enterprise',
        '2025-01-10',
        '45.8',
        'Failed',
        '299.00',
        '28',
        '3',
        'dashboard,analytics,reports,api,integrations',
        'Too expensive for our current budget'
      ]
    ];
    
    const csvContent = [
      allHeaders.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'churnaizer-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const CSVUploader = () => (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            AI-Powered Cancel-Intent Predictor
          </CardTitle>
          <CardDescription>
            Upload customer data to get ML-powered churn predictions, retention insights, and actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Churn Prediction</div>
                <div className="text-sm text-blue-700">AI-powered risk scoring</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Feature Analytics</div>
                <div className="text-sm text-green-700">Retention impact analysis</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">Churn Clustering</div>
                <div className="text-sm text-orange-700">Reason categorization</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Fields Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            CSV Format Guide
          </CardTitle>
          <CardDescription>Required and optional fields for maximum insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required fields:</strong> user_id, plan, last_login, avg_session_duration, billing_status, monthly_revenue, feature_usage_count, support_tickets
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Optional fields for enhanced analytics:</strong>
              <br />• <strong>feature_adopted</strong> - Comma-separated list (e.g., "dashboard,reports,api") for Feature-Retention Fit analysis
              <br />• <strong>cancellation_reason</strong> - Free text for churn reason clustering and insights
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Customer Data</CardTitle>
          <CardDescription>Drag and drop or click to select your CSV file</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div {...getRootProps()} className="relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center hover:border-primary transition-colors min-h-[200px]">
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
            {
              isDragActive ?
                <p className="text-center text-lg">Drop the files here ...</p> :
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground mb-2">
                    Drop your CSV file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports .csv and .txt files up to 10MB
                  </p>
                </div>
            }
            {csvFile && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {csvFile.name}
                </Badge>
              </div>
            )}
          </div>
          <div className="mt-6">
            <Button 
              onClick={() => {
                if (csvFile) {
                  uploadCSVMutation.mutate(csvFile);
                } else {
                  toast({
                    title: "No File Selected",
                    description: "Please select a CSV file to upload.",
                    variant: "destructive",
                  });
                }
              }} 
              disabled={uploading} 
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing AI Analysis...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Analyze with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  interface CSVRecord {
    id: string;
    filename: string;
    created_at: string;
    status: string;
    rows_processed?: number;
    rows_failed?: number;
  }

  const { data: csvHistory = [], isLoading } = useQuery({
    queryKey: ['csv-history'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as CSVRecord[];
    },
  });

  const CSVHistoryTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Upload History</CardTitle>
        <CardDescription>Track your CSV uploads and processing status</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processed</TableHead>
              <TableHead>Failed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading history...</p>
                </TableCell>
              </TableRow>
            ) : csvHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No uploads yet. Upload your first CSV to get started!</p>
                </TableCell>
              </TableRow>
            ) : (
              csvHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.filename}</TableCell>
                  <TableCell>{format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}</TableCell>
                  <TableCell>
                    <Badge variant={
                      record.status === 'completed' ? 'default' : 
                      record.status === 'processing' ? 'secondary' : 
                      'destructive'
                    }>
                      {record.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">{record.rows_processed || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${(record.rows_failed || 0) > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {record.rows_failed || 0}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout 
      title="Cancel-Intent Predictor" 
      description="Upload customer data to predict cancel intent using AI and get actionable retention insights"
      icon={<Target className="h-8 w-8 text-primary" />}
    >
      <CSVUploader />
      <CSVHistoryTable />
    </PageLayout>
  );
};

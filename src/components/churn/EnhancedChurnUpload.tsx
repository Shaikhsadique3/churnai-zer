import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Mail, 
  Loader2, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CSVPreview {
  columns: string[];
  rows: Array<Record<string, any>>;
  total_rows: number;
  validation_errors: string[];
}

interface ProcessingStage {
  stage: 'uploading' | 'validating' | 'processing' | 'predicting' | 'complete';
  progress: number;
  message: string;
}

export const EnhancedChurnUpload = () => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage | null>(null);
  const [instantSummary, setInstantSummary] = useState<any>(null);
  const [reportReady, setReportReady] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file only.",
          variant: "destructive"
        });
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 20MB.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      await previewCSV(selectedFile);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1
  });

  const previewCSV = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('csv-preview', {
        body: formData
      });

      if (error) throw error;
      setCsvPreview(data);
      
      if (data.validation_errors?.length > 0) {
        toast({
          title: "CSV Validation Issues",
          description: `Found ${data.validation_errors.length} issues. Check the preview below.`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      toast({
        title: "Preview failed",
        description: error.message || "Could not preview CSV file.",
        variant: "destructive"
      });
    }
  };

  const generateReport = async () => {
    if (!email || !file || !csvPreview) {
      toast({
        title: "Missing information",
        description: "Please provide email, upload a valid CSV file, and ensure preview is loaded.",
        variant: "destructive"
      });
      return;
    }

    // Start processing stages
    setProcessingStage({ stage: 'uploading', progress: 10, message: 'Uploading your data securely...' });

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file);

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('enhanced-churn-upload', {
        body: formData
      });

      if (uploadError) throw uploadError;
      setUploadId(uploadData.upload_id);

      // Processing stages
      setProcessingStage({ stage: 'validating', progress: 25, message: 'Validating and cleaning data...' });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessingStage({ stage: 'processing', progress: 50, message: 'Running AI churn analysis...' });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setProcessingStage({ stage: 'predicting', progress: 75, message: 'Generating predictions and insights...' });

      // Get instant summary
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('get-instant-summary', {
        body: { upload_id: uploadData.upload_id }
      });

      if (summaryError) throw summaryError;
      setInstantSummary(summaryData);

      setProcessingStage({ stage: 'complete', progress: 100, message: 'Analysis complete!' });
      setReportReady(true);

      toast({
        title: "Analysis complete!",
        description: "Your churn audit has been completed. Check the summary below."
      });

    } catch (error: any) {
      console.error('Processing error:', error);
      setProcessingStage(null);
      toast({
        title: "Analysis failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `user_id,email,plan_type,monthly_revenue,last_login_days_ago,total_logins,support_tickets,feature_usage_score
user_001,user1@example.com,Premium,99,2,45,1,8.5
user_002,user2@example.com,Basic,29,15,12,3,4.2
user_003,user3@example.com,Premium,99,1,67,0,9.1
user_004,user4@example.com,Free,0,45,2,2,1.3
user_005,user5@example.com,Basic,29,7,28,1,6.8`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_customer_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Upload Your Customer Data → Get Churn Insights
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Upload your CSV file and get instant AI-powered churn analysis with actionable recommendations
          </p>
          <Button variant="outline" onClick={downloadSampleCSV} className="mb-4">
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Customer Data
              </CardTitle>
              <CardDescription>
                Drag and drop your CSV file or browse to upload. We'll provide an instant preview and analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Your Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="founder@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!processingStage}
                />
                <p className="text-sm text-muted-foreground">
                  We'll send your detailed report to this email address
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Customer Data CSV File
                </Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
                  } ${processingStage ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <input {...getInputProps()} disabled={!!processingStage} />
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-lg font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-green-600">
                        ✓ File loaded successfully. Click "Generate Report" to start analysis.
                      </p>
                    </div>
                  ) : isDragActive ? (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-lg">Drop your CSV file here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-lg">Drag & drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse (max 20MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CSV Preview */}
              {csvPreview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Data Preview
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {csvPreview.total_rows} total rows
                    </span>
                  </div>
                  
                  {csvPreview.validation_errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Validation Issues</span>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {csvPreview.validation_errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            {csvPreview.columns.map((column, index) => (
                              <th key={index} className="px-4 py-2 text-left font-medium">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.rows.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-t">
                              {csvPreview.columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-4 py-2">
                                  {row[column]?.toString() || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-muted px-4 py-2 text-xs text-muted-foreground">
                      Showing first 5 rows of {csvPreview.total_rows} total rows
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Report Button */}
              <Button 
                onClick={generateReport}
                className="w-full"
                size="lg"
                disabled={!file || !csvPreview || !!processingStage || csvPreview.validation_errors.length > 0}
              >
                {processingStage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {processingStage.message}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Generate Churn Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Processing Progress */}
          {processingStage && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Your Data</CardTitle>
                <CardDescription>
                  AI analysis in progress - this typically takes 2-5 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={processingStage.progress} className="w-full" />
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{processingStage.message}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instant Summary */}
          {instantSummary && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Instant Analysis Summary</CardTitle>
                <CardDescription className="text-green-700">
                  Here's a quick overview of your churn analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">{instantSummary.total_customers}</div>
                    <div className="text-sm text-green-600">Total Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{instantSummary.high_risk_percentage}%</div>
                    <div className="text-sm text-green-600">High Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{instantSummary.medium_risk_percentage}%</div>
                    <div className="text-sm text-green-600">Medium Risk</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-800">Top Churn Reasons:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {instantSummary.top_churn_reasons?.map((reason: string, index: number) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                {reportReady && uploadId && (
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => navigate(`/report/${uploadId}`)}
                  >
                    View Detailed Report & Download PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Benefits & Trust */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>What You'll Get</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Identify risky customers before they churn
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI-powered retention playbook with email templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Industry benchmarks and competitive insights
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    90-day action plan with quick wins
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Safety & Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    All files automatically deleted within 24 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Customer IDs are anonymized in reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Enterprise-grade security and encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    GDPR and SOC 2 compliant data handling
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
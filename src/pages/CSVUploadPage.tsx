import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { DynamicHead } from "@/components/common/DynamicHead";
import { logApiSuccess, logApiFailure } from "@/utils/apiLogger";

interface UploadResult {
  success: boolean;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  message?: string;
  analysis_id?: string;
}

const CSVUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('founder_profile')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const requiredColumns = [
    'user_id',
    'plan',
    'last_login',
    'avg_session_duration',
    'billing_status',
    'monthly_revenue',
    'feature_usage_count',
    'support_tickets'
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        previewCSV(selectedFile);
      }
    }
  });

  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 6); // First 5 rows + header
      const data = lines.map(line => line.split(',').map(cell => cell.trim()));
      setPreviewData(data);
    };
    reader.readAsText(file);
  };

  const validateColumns = (headers: string[]): { valid: boolean; missing: string[] } => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const missing = requiredColumns.filter(col => 
      !normalizedHeaders.includes(col.toLowerCase())
    );
    return { valid: missing.length === 0, missing };
  };

  const handleUpload = async () => {
    if (!file || !user || loadingProfile) return;

    const isFirstTimeOnboarding = profile && !profile.onboarding_completed;

    // If it's not first-time onboarding, prevent demo data upload
    if (!isFirstTimeOnboarding) {
      const headers = requiredColumns.join(',');
      const sampleDataContent = [
        'user_123,Pro,2024-01-15,25,Active,99.00,15,2',
        'user_456,Free,2023-12-20,8,Overdue,0.00,3,0',
        'user_789,Enterprise,2024-01-20,45,Active,299.00,25,1'
      ];
      const fullSampleCSVContent = [headers, ...sampleDataContent].join('\n');

      const fileContent = await file.text();

      if (fileContent.trim() === fullSampleCSVContent.trim()) {
        toast({
          title: "Demo Data Restricted",
          description: "Demo data upload is only allowed during initial onboarding. Please upload your own customer data.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
    }

    setUploading(true);
    try {
      const headers = requiredColumns.join(',');
      const sampleDataContent = [
        'user_123,Pro,2024-01-15,25,Active,99.00,15,2',
        'user_456,Free,2023-12-20,8,Overdue,0.00,3,0',
        'user_789,Enterprise,2024-01-20,45,Active,299.00,25,1'
      ];
      // Original demo data check (only applies if not in first-time onboarding and demo data is restricted)
      // This block is now inside the `if (!isFirstTimeOnboarding)` block above
      // and will only execute if the user is NOT in first-time onboarding.

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('csv-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Process CSV via edge function
      const payload = {
        fileName,
        userId: user.id
      };
      console.log("Request sent:", payload);
      
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('churn-csv-handler', {
        body: payload
      });

      if (error) {
        console.log("Response error:", error);
        logApiFailure('churn-csv-handler', 'POST', Date.now() - startTime);
        throw error;
      }
      
      console.log("Response received:", data);
      logApiSuccess('churn-csv-handler', 'POST', Date.now() - startTime);

      setUploadResult(data);
      
      if (data.success) {
        toast({
          title: "Upload Successful",
          description: `Processed ${data.processed_rows} customers successfully`,
        });
      } else {
        toast({
          title: "Upload Issues",
          description: data.message || "Some rows failed to process",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = requiredColumns.join(',');
    const sampleData = [
      'user_123,Pro,2024-01-15,25,Active,99.00,15,2',
      'user_456,Free,2023-12-20,8,Overdue,0.00,3,0',
      'user_789,Enterprise,2024-01-20,45,Active,299.00,25,1'
    ];
    
    const csvContent = [headers, ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'churn_prediction_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to upload and analyze your customer data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <DynamicHead 
        title="CSV Upload - Churn Prediction Analysis"
        description="Upload your customer data CSV file to get AI-powered churn predictions and insights"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Upload Customer Data for Churn Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your CSV file and get instant AI-powered churn predictions for your customers
            </p>
          </div>

          {/* Template Download */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Need a Template?
              </CardTitle>
              <CardDescription>
                Download our CSV template with the required columns and sample data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Customer Data
              </CardTitle>
              <CardDescription>
                Upload a CSV file with customer information for churn analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg">Drop your CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">Drag & drop your CSV file here, or click to select</p>
                    <p className="text-sm text-muted-foreground">Supports CSV files up to 50MB</p>
                  </div>
                )}
              </div>

              {file && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  
                  {previewData.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <tbody>
                            {previewData.map((row, i) => (
                              <tr key={i} className={i === 0 ? 'font-medium' : ''}>
                                {row.map((cell, j) => (
                                  <td key={j} className="pr-4 py-1 whitespace-nowrap">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {previewData.length > 0 && (
                        <div className="mt-4">
                          {(() => {
                            const validation = validateColumns(previewData[0]);
                            return validation.valid ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">All required columns found</span>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 text-red-600">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p>Missing required columns:</p>
                                  <ul className="list-disc list-inside ml-2">
                                    {validation.missing.map(col => (
                                      <li key={col}>{col}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required Columns */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Required Columns</CardTitle>
              <CardDescription>
                Your CSV must include these columns for accurate predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {requiredColumns.map(col => (
                  <div key={col} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-mono">{col}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload Button */}
          {file && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !file}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing CSV...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Analyze Customer Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{uploadResult.total_rows}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.processed_rows}</div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.failed_rows}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
                
                {uploadResult.message && (
                  <p className="text-sm text-muted-foreground mb-4">{uploadResult.message}</p>
                )}
                
                {uploadResult.success && uploadResult.analysis_id && (
                  <Button asChild>
                    <a href={`/dashboard?analysis=${uploadResult.analysis_id}`}>
                      View Churn Analysis Results
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default CSVUploadPage;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

interface SimpleCSVUploaderProps {
  onUploadComplete?: () => void;
}

interface UploadResult {
  rows_processed: number;
  rows_success: number;
  rows_failed: number;
  error_details?: Array<{
    row: number;
    user_id: string;
    error: string;
  }>;
  message?: string;
}

const REQUIRED_COLUMNS = [
  'customer_name',
  'customer_email', 
  'signup_date',
  'last_active_date',
  'plan',
  'billing_status',
  'monthly_revenue',
  'support_tickets_opened',
  'email_opens_last30days',
  'number_of_logins_last30days'
];

export function SimpleCSVUploader({ onUploadComplete }: SimpleCSVUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Preview first 5 rows
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (results) => {
        setPreview(results.data);
      },
      error: (error) => {
        toast({
          title: "File parsing error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const validateColumns = (headers: string[]): { valid: boolean; missing: string[] } => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const missing = REQUIRED_COLUMNS.filter(required => 
      !normalizedHeaders.some(header => header === required.toLowerCase())
    );
    
    return { valid: missing.length === 0, missing };
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadResult(null);

    try {
      // Parse the entire CSV
      Papa.parse(selectedFile, {
        header: true,
        complete: async (results) => {
          const headers = Object.keys(results.data[0] || {});
          const validation = validateColumns(headers);

          if (!validation.valid) {
            toast({
              title: "Missing required columns",
              description: `Missing: ${validation.missing.join(', ')}`,
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }

          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            toast({
              title: "Authentication required",
              description: "Please log in to upload data",
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }

          try {
            // Call the new edge function
            const { data, error } = await supabase.functions.invoke('churn-csv-handler', {
              body: {
                data: results.data,
                filename: selectedFile.name
              }
            });

            if (error) {
              throw error;
            }

            setUploadResult(data);
            
            if (data.rows_success > 0) {
              toast({
                title: "Upload successful!",
                description: data.message || `Processed ${data.rows_success} rows successfully`,
              });
              onUploadComplete?.();
            }

            if (data.rows_failed > 0) {
              toast({
                title: "Some rows failed",
                description: `${data.rows_failed} rows had errors. Check details below.`,
                variant: "destructive"
              });
            }

          } catch (apiError: any) {
            console.error('Upload API error:', apiError);
            toast({
              title: "Upload failed",
              description: apiError.message || "Failed to process CSV file",
              variant: "destructive"
            });
          }

          setIsProcessing(false);
        },
        error: (error) => {
          toast({
            title: "File parsing error",
            description: error.message,
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = REQUIRED_COLUMNS.join(',');
    const sampleRow = [
      'Alice Johnson',
      'alice@example.com',
      '2024-01-15',
      '2025-01-20',
      'Free',
      'Active',
      '0',
      '2',
      '8',
      '15'
    ].join(',');
    
    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            <h3 className="text-lg font-semibold">CSV Upload & Churn Prediction</h3>
          </div>
          
          <Alert>
            <AlertDescription>
              Upload a CSV file with customer data to get churn predictions. Required columns: {REQUIRED_COLUMNS.length} fields including customer_name, customer_email, signup_date, etc.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="w-full cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose CSV File
                  </span>
                </Button>
              </label>
            </div>
            
            <Button variant="ghost" onClick={downloadTemplate}>
              Download Template
            </Button>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </AlertDescription>
              </Alert>

              {preview.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preview (first 5 rows):</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-muted">
                          {Object.keys(preview[0] || {}).map((header) => (
                            <th key={header} className="border p-2 text-left">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="border p-2">{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Upload & Predict Churn"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {uploadResult && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {uploadResult.rows_success > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">Upload Results</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{uploadResult.rows_processed}</div>
                <div className="text-sm text-blue-700">Total Rows</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uploadResult.rows_success}</div>
                <div className="text-sm text-green-700">Successful</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{uploadResult.rows_failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
            </div>

            {uploadResult.error_details && uploadResult.error_details.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Error Details:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadResult.error_details.map((error, index) => (
                    <div key={index} className="text-sm bg-red-50 p-2 rounded">
                      Row {error.row} ({error.user_id}): {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
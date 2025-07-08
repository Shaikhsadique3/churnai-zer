import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertCircle, CheckCircle, Download, FileText, X } from "lucide-react";
import Papa from "papaparse";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVUploadPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (result: any) => void;
}

interface ValidationError {
  row: number;
  user_id: string;
  error: string;
  action: string;
}

interface UploadResult {
  status: 'success' | 'error' | 'processing';
  processed?: number;
  failed?: number;
  total?: number;
  message?: string;
  validation_errors?: ValidationError[];
  missing_columns?: string[];
  preview?: any[];
  timestamp?: string;
}

const REQUIRED_COLUMNS = [
  'user_id', 'days_since_signup', 'monthly_revenue', 'subscription_plan',
  'number_of_logins_last30days', 'active_features_used', 'support_tickets_opened',
  'last_payment_status', 'email_opens_last30days', 'last_login_days_ago', 'billing_issue_count'
];

const CSVUploadPanel = ({ open, onOpenChange, onUploadComplete }: CSVUploadPanelProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadResult(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file extension
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        setUploadResult({
          status: 'error',
          message: 'Please upload a valid CSV file (.csv extension required)'
        });
        return;
      }
      
      // Validate file size (max 5MB as per requirements)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadResult({
          status: 'error',
          message: 'File size too large. Please upload a CSV file smaller than 5MB'
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null);
      
      // Auto-preview first few rows
      previewCSV(selectedFile);
    }
  };

  const previewCSV = (csvFile: File) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      preview: 3, // Only preview first 3 rows
      transformHeader: normalizeHeader,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setUploadResult({
            status: 'processing',
            preview: results.data,
            message: `Preview: ${results.data.length} rows shown`
          });
          setShowPreview(true);
        }
      },
      error: (error) => {
        console.error('Preview error:', error);
      }
    });
  };

  const normalizeHeader = (header: string): string => {
    return header.toLowerCase()
                 .trim()
                 .replace(/^\uFEFF/, '') // Remove BOM
                 .replace(/[""'']/g, ''); // Remove quotes
  };

  const validateCSVColumns = (headers: string[]): { valid: boolean; missing: string[] } => {
    const normalizedHeaders = headers.map(normalizeHeader);
    const normalizedRequired = REQUIRED_COLUMNS.map(c => c.toLowerCase());
    
    const missing = normalizedRequired.filter(required => 
      !normalizedHeaders.some(header => header === required)
    );
    
    return {
      valid: missing.length === 0,
      missing: missing.map(col => REQUIRED_COLUMNS.find(req => req.toLowerCase() === col) || col)
    };
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadResult(null);

    try {
      // Parse CSV file with enhanced configuration
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        transformHeader: normalizeHeader,
        complete: async (results) => {
          setUploadProgress(30);
          
          try {
            // Check if file has data
            if (!results.data || results.data.length === 0) {
              setUploadResult({
                status: 'error',
                message: 'The CSV file appears to be empty or contains no valid data rows'
              });
              setIsUploading(false);
              return;
            }

            setUploadProgress(40);

            // Check for parsing errors
            if (results.errors && results.errors.length > 0) {
              const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
              if (criticalErrors.length > 0) {
                setUploadResult({
                  status: 'error',
                  message: 'CSV file format is invalid. Please ensure it uses comma delimiters and proper formatting'
                });
                setIsUploading(false);
                return;
              }
            }

            setUploadProgress(50);

            // Validate CSV structure
            const validation = validateCSVColumns(results.meta.fields || []);
            
            if (!validation.valid) {
              setUploadResult({
                status: 'error',
                message: `Your CSV is missing key columns needed for accurate churn detection: ${validation.missing.join(', ')}`,
                missing_columns: validation.missing
              });
              setIsUploading(false);
              return;
            }

            setUploadProgress(70);

            // Get auth session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              throw new Error('Not authenticated');
            }

            setUploadProgress(80);

            // Call process-csv function
            const { data, error } = await supabase.functions.invoke('process-csv', {
              body: {
                csvData: results.data,
                filename: file.name
              }
            });

            if (error) throw error;

            setUploadProgress(100);

            const finalResult: UploadResult = {
              ...data,
              timestamp: new Date().toISOString()
            };

            setUploadResult(finalResult);
            
            if (data.validation_errors && data.validation_errors.length > 0) {
              toast({
                title: "Upload completed with warnings",
                description: `${data.processed} rows processed, ${data.failed} failed. Check validation errors below.`,
                variant: "destructive"
              });
            } else {
              toast({
                title: "Upload successful",
                description: `Successfully processed ${data.processed} rows with AI churn predictions.`,
              });
            }

            onUploadComplete(finalResult);
            
          } catch (error) {
            console.error('Upload error:', error);
            setUploadResult({
              status: 'error',
              message: error instanceof Error ? error.message : 'Upload failed',
              timestamp: new Date().toISOString()
            });
            toast({
              title: "Upload failed",
              description: "There was an error processing your CSV file.",
              variant: "destructive"
            });
          } finally {
            setIsUploading(false);
          }
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          toast({
            title: "Invalid CSV file",
            description: "Could not parse the CSV file. Please check the file format.",
            variant: "destructive"
          });
          setIsUploading(false);
        }
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your file.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        user_id: 'USR-001',
        days_since_signup: 45,
        monthly_revenue: 89.99,
        subscription_plan: 'Pro',
        number_of_logins_last30days: 22,
        active_features_used: 6,
        support_tickets_opened: 0,
        last_payment_status: 'Success',
        email_opens_last30days: 12,
        last_login_days_ago: 2,
        billing_issue_count: 0
      },
      {
        user_id: 'USR-002',
        days_since_signup: 3,
        monthly_revenue: 0,
        subscription_plan: 'Free Trial',
        number_of_logins_last30days: 3,
        active_features_used: 1,
        support_tickets_opened: 0,
        last_payment_status: 'Success',
        email_opens_last30days: 2,
        last_login_days_ago: 1,
        billing_issue_count: 0
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-churn-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Upload Customer Data for Churn Analysis
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with customer data to analyze churn risk using AI model v5. 
            Maximum file size: 5MB. Required columns listed below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* File Upload Section */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="csvFile" className="text-sm font-medium">Select CSV File</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleTemplate}
                className="text-xs"
              >
                <Download className="mr-1 h-3 w-3" />
                Download Template
              </Button>
            </div>
            <Input
              ref={fileInputRef}
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
            
            {/* Required Columns Info */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Required columns:</strong> user_id, days_since_signup, monthly_revenue, subscription_plan, 
                number_of_logins_last30days, active_features_used, support_tickets_opened, 
                last_payment_status, email_opens_last30days, last_login_days_ago, billing_issue_count
              </AlertDescription>
            </Alert>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Preview Section */}
          {showPreview && uploadResult?.preview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preview (First 3 rows)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="border rounded-md overflow-x-auto max-h-32">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(uploadResult.preview[0] || {}).map((key) => (
                        <th key={key} className="p-2 text-left font-medium">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.preview.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {Object.values(row as Record<string, any>).map((value, cellIdx) => (
                          <td key={cellIdx} className="p-2 truncate max-w-[100px]">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && !showPreview && (
            <div className="space-y-3">
              {uploadResult.status === 'error' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div><strong>Upload Error:</strong> {uploadResult.message}</div>
                      {uploadResult.missing_columns && (
                        <div>
                          <strong>Missing columns:</strong> {uploadResult.missing_columns.join(', ')}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : uploadResult.status === 'success' ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div><strong>Upload Complete!</strong></div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>✅ Processed: <strong>{uploadResult.processed}</strong></div>
                        <div>❌ Failed: <strong>{uploadResult.failed}</strong></div>
                        <div>📊 Total: <strong>{uploadResult.total}</strong></div>
                      </div>
                      {uploadResult.timestamp && (
                        <div className="text-xs text-muted-foreground">
                          ⏱️ {new Date(uploadResult.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    {uploadResult.validation_errors && uploadResult.validation_errors.length > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-2">
                        <strong className="text-sm">Validation Errors:</strong>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {uploadResult.validation_errors.slice(0, 5).map((error, idx) => (
                            <div key={idx} className="text-xs bg-muted p-2 rounded">
                              <strong>Row {error.row}:</strong> {error.error}
                            </div>
                          ))}
                          {uploadResult.validation_errors.length > 5 && (
                            <div className="text-xs text-muted-foreground">
                              +{uploadResult.validation_errors.length - 5} more errors
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {uploadResult?.status === 'success' && (
                <Button variant="outline" onClick={resetState}>
                  Upload Another
                </Button>
              )}
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading || uploadResult?.status === 'success'}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadPanel;
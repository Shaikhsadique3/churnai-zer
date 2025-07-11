import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Papa from "papaparse";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

const CSVUploadModal = ({ open, onOpenChange, onUploadComplete }: CSVUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();

  const requiredColumns = [
    'user_id', 'days_since_signup', 'monthly_revenue', 'subscription_plan',
    'number_of_logins_last30days', 'active_features_used', 'support_tickets_opened',
    'last_payment_status', 'email_opens_last30days', 'last_login_days_ago', 'billing_issue_count'
  ];

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
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadResult({
          status: 'error',
          message: 'File size too large. Please upload a CSV file smaller than 10MB'
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const validateCSVColumns = (headers: string[]): { valid: boolean; missing: string[] } => {
    // Normalize headers: trim whitespace, lowercase, remove BOM
    const normalizedHeaders = headers.map(h => 
      h.toLowerCase()
       .trim()
       .replace(/^\uFEFF/, '') // Remove BOM
       .replace(/[""'']/g, '') // Remove quotes
    );
    
    const normalizedRequired = requiredColumns.map(c => c.toLowerCase());
    
    const missing = normalizedRequired.filter(required => 
      !normalizedHeaders.some(header => header === required)
    );
    
    return {
      valid: missing.length === 0,
      missing: missing.map(col => requiredColumns.find(req => req.toLowerCase() === col) || col)
    };
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Parse CSV file with enhanced configuration
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        transformHeader: (header) => {
          // Normalize headers during parsing
          return header.toLowerCase()
                      .trim()
                      .replace(/^\uFEFF/, '') // Remove BOM
                      .replace(/[""'']/g, ''); // Remove quotes
        },
        complete: async (results) => {
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

            // Get auth session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
              throw new Error('Not authenticated');
            }

            // Call process-csv function
            const { data, error } = await supabase.functions.invoke('process-csv', {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              },
              body: {
                csvData: results.data,
                filename: file.name
              }
            });

            if (error) throw error;

            setUploadResult(data);
            
            if (data.validation_errors && data.validation_errors.length > 0) {
              toast({
                title: "Upload completed with warnings",
                description: `${data.processed} rows processed, ${data.failed} failed. Check validation errors below.`,
                variant: "destructive"
              });
            } else {
              toast({
                title: "Upload successful",
                description: `Successfully processed ${data.processed} rows with enhanced churn predictions.`,
              });
            }

            onUploadComplete();
            
          } catch (error) {
            console.error('Upload error:', error);
            setUploadResult({
              status: 'error',
              message: error instanceof Error ? error.message : 'Upload failed'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Customer Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with customer data to analyze churn risk using AI model v5. 
            Required columns: user_id, days_since_signup, monthly_revenue, subscription_plan, 
            number_of_logins_last30days, active_features_used, support_tickets_opened, 
            last_payment_status, email_opens_last30days, last_login_days_ago, billing_issue_count.
            <div className="mt-2">
              <a 
                href="/sample-churn-data.csv" 
                download 
                className="text-primary hover:underline text-sm"
              >
                📋 Download sample CSV template
              </a>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>User Lifecycle Detection:</strong> Users with &lt;7 days since signup will be tagged as "New User" 
              with limited prediction accuracy. Users with 15+ days get full confidence predictions.
            </AlertDescription>
          </Alert>

          {uploadResult && (
            <div className="space-y-2">
              {uploadResult.status === 'error' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Upload Error:</strong> {uploadResult.message}
                    {uploadResult.missing_columns && (
                      <div className="mt-2">
                        <strong>Missing columns:</strong> {uploadResult.missing_columns.join(', ')}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Upload Complete:</strong> {uploadResult.processed} rows processed, {uploadResult.failed} failed
                    
                    {uploadResult.validation_errors && uploadResult.validation_errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <strong>Validation Errors:</strong>
                        {uploadResult.validation_errors.slice(0, 3).map((error: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            Row {error.row}: {error.error}
                          </div>
                        ))}
                        {uploadResult.validation_errors.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{uploadResult.validation_errors.length - 3} more errors
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
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

export default CSVUploadModal;
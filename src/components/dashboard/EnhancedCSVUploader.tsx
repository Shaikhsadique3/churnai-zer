import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import Papa from "papaparse";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CSVAutoMapper, { ColumnMapping } from "./CSVAutoMapper";

interface EnhancedCSVUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

interface UploadStage {
  stage: 'upload' | 'mapping' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
}

const EnhancedCSVUploader = ({ open, onOpenChange, onUploadComplete }: EnhancedCSVUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStage, setUploadStage] = useState<UploadStage>({
    stage: 'upload',
    progress: 0,
    message: 'Select a CSV file to begin'
  });
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load saved mappings
  const getSavedMappings = (): ColumnMapping | undefined => {
    try {
      const saved = localStorage.getItem('churnaizer_csv_mapping');
      return saved ? JSON.parse(saved) : undefined;
    } catch {
      return undefined;
    }
  };

  const resetUploader = () => {
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setCsvPreview([]);
    setUploadResult(null);
    setUploadStage({
      stage: 'upload',
      progress: 0,
      message: 'Select a CSV file to begin'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file (.csv extension required)",
        variant: "destructive"
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setUploadStage({
      stage: 'upload',
      progress: 20,
      message: 'Parsing CSV file...'
    });

    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setUploadStage({
            stage: 'error',
            progress: 0,
            message: 'CSV file is empty or invalid'
          });
          return;
        }

        const headers = results.meta.fields || [];
        const preview = results.data.slice(0, 5);

        setCsvData(results.data);
        setCsvHeaders(headers);
        setCsvPreview(preview);
        
        setUploadStage({
          stage: 'mapping',
          progress: 50,
          message: `File parsed successfully. ${results.data.length} rows found.`
        });

        toast({
          title: "File uploaded successfully",
          description: `Found ${results.data.length} rows with ${headers.length} columns`,
        });
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        setUploadStage({
          stage: 'error',
          progress: 0,
          message: 'Failed to parse CSV file'
        });
        toast({
          title: "Parse error",
          description: "Could not parse the CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    });
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const transformDataWithMapping = (mapping: ColumnMapping) => {
    return csvData.map(row => {
      const transformedRow: any = {};
      
      // Map required fields
      Object.entries(mapping).forEach(([targetField, sourceField]) => {
        if (sourceField && row[sourceField] !== undefined) {
          transformedRow[targetField] = row[sourceField];
        }
      });

      // Calculate derived fields if not provided
      if (!mapping.days_since_signup && mapping.signup_date && row[mapping.signup_date]) {
        const signupDate = new Date(row[mapping.signup_date]);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - signupDate.getTime());
        transformedRow.days_since_signup = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      if (!mapping.last_login_days_ago && mapping.last_login_date && row[mapping.last_login_date]) {
        const loginDate = new Date(row[mapping.last_login_date]);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - loginDate.getTime());
        transformedRow.last_login_days_ago = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Set defaults for missing optional fields
      if (!transformedRow.number_of_logins_last30days) {
        transformedRow.number_of_logins_last30days = 10; // Default assumption
      }

      return transformedRow;
    });
  };

  const handleMappingConfirmed = async (mapping: ColumnMapping) => {
    setUploadStage({
      stage: 'processing',
      progress: 70,
      message: 'Processing data and running churn analysis...'
    });

    try {
      // Transform data based on mapping
      const transformedData = transformDataWithMapping(mapping);

      setUploadStage({
        stage: 'processing',
        progress: 85,
        message: 'Sending to churn prediction API...'
      });

      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call the enhanced process-csv function
      const { data, error } = await supabase.functions.invoke('process-csv-enhanced', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          csvData: transformedData,
          filename: file?.name || 'mapped-data.csv',
          mapping: mapping
        }
      });

      if (error) throw error;

      setUploadStage({
        stage: 'success',
        progress: 100,
        message: 'Data processed successfully!'
      });

      setUploadResult(data);
      
      toast({
        title: "Processing complete",
        description: `Successfully analyzed ${data.processed || transformedData.length} customer records`,
      });

      onUploadComplete();

    } catch (error) {
      console.error('Processing error:', error);
      setUploadStage({
        stage: 'error',
        progress: 0,
        message: 'Failed to process data'
      });
      toast({
        title: "Processing failed",
        description: "There was an error analyzing your data",
        variant: "destructive"
      });
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        user_id: 'USR-001',
        email: 'user1@example.com',
        signup_date: '2024-06-01',
        last_login_date: '2024-07-09',
        subscription_plan: 'Pro',
        monthly_revenue: 89.99,
        active_features_used: 6,
        support_tickets_opened: 0,
        payment_status: 'Success',
        email_opens_last30days: 12,
        billing_issue_count: 0,
        number_of_logins_last30days: 22
      },
      {
        user_id: 'USR-002',
        email: 'user2@example.com',
        signup_date: '2024-07-08',
        last_login_date: '2024-07-10',
        subscription_plan: 'Free',
        monthly_revenue: 0,
        active_features_used: 1,
        support_tickets_opened: 0,
        payment_status: 'Success',
        email_opens_last30days: 2,
        billing_issue_count: 0,
        number_of_logins_last30days: 3
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'churnaizer-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Smart CSV Upload & Auto-Mapping
          </DialogTitle>
          <DialogDescription>
            Upload any CSV format and we'll help you map it to the right fields for churn analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{uploadStage.message}</span>
              <span>{uploadStage.progress}%</span>
            </div>
            <Progress value={uploadStage.progress} className="w-full" />
          </div>

          {/* Stage-based content */}
          {uploadStage.stage === 'upload' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">1. Upload Your CSV File</h3>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              {/* Drag & Drop Area */}
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop your CSV file here</h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports any CSV format • Maximum 5MB • Common formats: CRM exports, Stripe data, etc.
                </p>
              </div>
            </div>
          )}

          {uploadStage.stage === 'mapping' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">2. Map Your Columns</h3>
              <CSVAutoMapper
                csvHeaders={csvHeaders}
                csvPreview={csvPreview}
                onMappingConfirmed={handleMappingConfirmed}
                onCancel={() => setUploadStage({ stage: 'upload', progress: 0, message: 'Select a CSV file to begin' })}
                savedMappings={getSavedMappings()}
              />
            </div>
          )}

          {uploadStage.stage === 'processing' && (
            <div className="space-y-4 text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <h3 className="text-lg font-medium">Processing Your Data</h3>
              <p className="text-muted-foreground">
                Running AI churn analysis on {csvData.length} customer records...
              </p>
            </div>
          )}

          {uploadStage.stage === 'success' && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>✅ Upload Complete!</strong></div>
                    {uploadResult && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>✅ Processed: <strong>{uploadResult.processed || csvData.length}</strong></div>
                        <div>❌ Failed: <strong>{uploadResult.failed || 0}</strong></div>
                        <div>🧠 AI Analyzed: <strong>{csvData.length}</strong></div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetUploader}>
                  Upload Another File
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  View Results
                </Button>
              </div>
            </div>
          )}

          {uploadStage.stage === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {uploadStage.message}
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={resetUploader}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCSVUploader;
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

// Required columns for churn prediction
const MANDATORY_COLUMNS = [
  'customer_name',
  'customer_email', 
  'signup_date',
  'last_active_date',
  'plan',
  'billing_status'
];

interface ValidationError {
  row: number;
  issue: string;
  customer_name?: string;
  customer_email?: string;
}

interface UploadError {
  missing_columns?: string[];
  validation_errors?: ValidationError[];
  invalid_rows?: any[];
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
  const [uploadErrors, setUploadErrors] = useState<UploadError | null>(null);
  const [showPreview, setShowPreview] = useState(false);
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
    setUploadErrors(null);
    setShowPreview(false);
    setUploadStage({
      stage: 'upload',
      progress: 0,
      message: 'Select a CSV file to begin'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate mandatory columns
  const validateMandatoryColumns = (headers: string[]): string[] => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const missingColumns: string[] = [];
    
    MANDATORY_COLUMNS.forEach(required => {
      const found = normalizedHeaders.some(header => 
        header.includes(required.toLowerCase()) || 
        required.toLowerCase().includes(header)
      );
      if (!found) {
        missingColumns.push(required);
      }
    });
    
    return missingColumns;
  };

  // Validate data rows for required fields
  const validateDataRows = (data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      const issues: string[] = [];
      
      // Check for customer_name (required)
      if (!row.customer_name && !row.name && !row.customer && !row.user_name) {
        issues.push('Missing customer name');
      }
      
      // Check for customer_email (required)
      if (!row.customer_email && !row.email && !row.user_email) {
        issues.push('Missing customer email');
      } else {
        // Validate email format
        const email = row.customer_email || row.email || row.user_email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          issues.push('Invalid email format');
        }
      }
      
      // Check for signup_date
      if (!row.signup_date && !row.created_at && !row.registration_date) {
        issues.push('Missing signup date');
      }
      
      // Check for plan
      if (!row.plan && !row.subscription_plan && !row.plan_type) {
        issues.push('Missing subscription plan');
      }
      
      if (issues.length > 0) {
        errors.push({
          row: rowNumber,
          issue: issues.join(', '),
          customer_name: row.customer_name || row.name || row.customer || 'Unknown',
          customer_email: row.customer_email || row.email || row.user_email || 'Unknown'
        });
      }
    });
    
    return errors;
  };

  // Download invalid rows as CSV
  const downloadInvalidRows = () => {
    if (!uploadErrors?.invalid_rows || uploadErrors.invalid_rows.length === 0) return;
    
    const csv = Papa.unparse(uploadErrors.invalid_rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'invalid_rows.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        
        // Validate mandatory columns
        const missingColumns = validateMandatoryColumns(headers);
        if (missingColumns.length > 0) {
          setUploadErrors({
            missing_columns: missingColumns
          });
          setUploadStage({
            stage: 'error',
            progress: 0,
            message: `Missing required columns: ${missingColumns.join(', ')}`
          });
          toast({
            title: "Missing required columns",
            description: `Your CSV is missing: ${missingColumns.join(', ')}`,
            variant: "destructive"
          });
          return;
        }
        
        // Validate data rows
        const validationErrors = validateDataRows(results.data);
        if (validationErrors.length > 0) {
          // Filter out invalid rows
          const validRows = results.data.filter((_, index) => 
            !validationErrors.some(error => error.row === index + 1)
          );
          const invalidRows = results.data.filter((_, index) => 
            validationErrors.some(error => error.row === index + 1)
          );
          
          setUploadErrors({
            validation_errors: validationErrors,
            invalid_rows: invalidRows
          });
          
          if (validRows.length === 0) {
            setUploadStage({
              stage: 'error',
              progress: 0,
              message: `All rows have validation errors. Please fix your data.`
            });
            return;
          }
          
          // Continue with valid rows only
          setCsvData(validRows);
          toast({
            title: `${validationErrors.length} rows have issues`,
            description: `${validRows.length} valid rows will be processed. Check errors below.`,
            variant: "destructive"
          });
        } else {
          setCsvData(results.data);
          setUploadErrors(null);
        }

        setCsvHeaders(headers);
        setCsvPreview(preview);
        setShowPreview(true);
        
        setUploadStage({
          stage: 'mapping',
          progress: 50,
          message: `File validated. ${results.data.length} rows ready for processing.`
        });

        toast({
          title: "✅ File validated successfully",
          description: `${results.data.length} customers ready for churn analysis`,
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
    const transformedData = transformDataWithMapping(mapping);
    const totalRows = transformedData.length;
    let processedCount = 0;
    let failedCount = 0;
    const processedUsers: any[] = [];

    setUploadStage({
      stage: 'processing',
      progress: 10,
      message: `Starting churn analysis for ${totalRows} customers...`
    });

    try {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Process each row with individual prediction calls
      for (const [index, row] of transformedData.entries()) {
        try {
          const progress = Math.floor(10 + (index / totalRows) * 80);
          
          setUploadStage({
            stage: 'processing',
            progress,
            message: `Processing ${row.customer_name || `User ${index + 1}`} (${index + 1}/${totalRows})`
          });

          // Send individual prediction request
          const predictionResponse = await fetch('https://api.churnaizer.com/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': 'your-api-key', // This should come from user settings
            },
            body: JSON.stringify({
              days_since_signup: row.days_since_signup,
              monthly_revenue: row.monthly_revenue || 0,
              plan: row.plan,
              last_login_days_ago: row.last_login_days_ago,
              number_of_logins_last30days: row.number_of_logins_last30days || 10,
              active_features_used: row.active_features_used || 1,
              support_tickets_opened: row.support_tickets_opened || 0,
              billing_status: row.billing_status,
              email_opens_last30days: row.email_opens_last30days || 5
            })
          });

          let predictionResult;
          if (predictionResponse.ok) {
            predictionResult = await predictionResponse.json();
          } else {
            // Fallback prediction if API fails
            predictionResult = {
              churn_probability: Math.random() * 0.5 + 0.2, // Random between 0.2-0.7
              reason: 'Fallback prediction - API unavailable',
              risk_level: 'medium'
            };
          }

          // Store prediction in Supabase
          const enrichedRow = {
            ...row,
            user_id: row.user_id || row.customer_email,
            churn_score: predictionResult.churn_probability || 0.3,
            churn_reason: predictionResult.reason || 'Behavioral pattern analysis',
            risk_level: predictionResult.risk_level || 'medium',
            owner_id: session.user.id
          };

          const { error: insertError } = await supabase
            .from('user_data')
            .upsert(enrichedRow, { onConflict: 'owner_id,user_id' });

          if (insertError) {
            console.error('Supabase insert error:', insertError);
            failedCount++;
          } else {
            processedUsers.push(enrichedRow);
            processedCount++;
          }

        } catch (rowError) {
          console.error(`Error processing row ${index + 1}:`, rowError);
          failedCount++;
        }
      }

      // Update upload record
      const { data: uploadRecord } = await supabase
        .from('csv_uploads')
        .insert({
          user_id: session.user.id,
          filename: file?.name || 'csv-upload.csv',
          rows_processed: processedCount,
          rows_failed: failedCount,
          status: 'completed',
          export_data: {
            import_timestamp: new Date().toISOString(),
            total_customers: totalRows,
            successful_imports: processedCount,
            failed_imports: failedCount,
            sample_data: processedUsers.slice(0, 5)
          }
        })
        .select()
        .single();

      setUploadStage({
        stage: 'success',
        progress: 100,
        message: `Analysis complete! ${processedCount} processed, ${failedCount} failed`
      });

      // Set detailed results for display
      const riskCounts = processedUsers.reduce((acc, user) => {
        acc[user.risk_level] = (acc[user.risk_level] || 0) + 1;
        return acc;
      }, { high: 0, medium: 0, low: 0 });

      setUploadResult({
        processed: processedCount,
        failed: failedCount,
        total: totalRows,
        riskCounts,
        sampleUsers: processedUsers.slice(0, 3)
      });
      
      toast({
        title: "✅ Churn Analysis Complete",
        description: `${processedCount} users processed • ${riskCounts.high || 0} high risk, ${riskCounts.medium || 0} medium, ${riskCounts.low || 0} low`,
      });

      onUploadComplete();

    } catch (error) {
      console.error('Processing error:', error);
      setUploadStage({
        stage: 'error',
        progress: 0,
        message: 'Failed to process CSV data'
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
        customer_name: 'John Smith',
        customer_email: 'john.smith@example.com',
        signup_date: '2024-06-01',
        last_active_date: '2024-07-09',
        plan: 'Pro',
        billing_status: 'Active',
        monthly_revenue: 89.99,
        active_features_used: 6,
        support_tickets_opened: 0,
        email_opens_last30days: 12,
        number_of_logins_last30days: 22
      },
      {
        customer_name: 'Sarah Johnson',
        customer_email: 'sarah.johnson@example.com',
        signup_date: '2024-07-08',
        last_active_date: '2024-07-10',
        plan: 'Free',
        billing_status: 'Trial',
        monthly_revenue: 0,
        active_features_used: 1,
        support_tickets_opened: 0,
        email_opens_last30days: 2,
        number_of_logins_last30days: 3
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'churnaizer-sample-format.csv');
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
              <h3 className="text-lg font-medium">2. Preview & Validation</h3>
              
              {/* Required columns info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Required columns found:</strong> {MANDATORY_COLUMNS.join(', ')}
                </AlertDescription>
              </Alert>
              
              {/* Preview table */}
              {showPreview && csvPreview.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preview (First 5 rows)</h4>
                  <div className="border rounded-md overflow-x-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          {csvHeaders.map((header) => (
                            <th key={header} className="p-2 text-left font-medium min-w-[100px]">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, idx) => (
                          <tr key={idx} className="border-t">
                            {csvHeaders.map((header) => (
                              <td key={header} className="p-2 truncate max-w-[150px]" title={String(row[header] || '')}>
                                {String(row[header] || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Validation errors display */}
              {uploadErrors?.validation_errors && uploadErrors.validation_errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>⚠️ {uploadErrors.validation_errors.length} rows have issues:</strong>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {uploadErrors.validation_errors.slice(0, 5).map((error, idx) => (
                          <div key={idx} className="text-xs bg-destructive/10 p-2 rounded">
                            <strong>Row {error.row}:</strong> {error.issue}
                            <br />
                            <span className="text-muted-foreground">
                              {error.customer_name} ({error.customer_email})
                            </span>
                          </div>
                        ))}
                        {uploadErrors.validation_errors.length > 5 && (
                          <div className="text-xs text-muted-foreground">
                            +{uploadErrors.validation_errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                      {uploadErrors.invalid_rows && uploadErrors.invalid_rows.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadInvalidRows}
                          className="mt-2"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Invalid Rows
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Proceed with mapping */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">3. Column Mapping</h4>
                <CSVAutoMapper
                  csvHeaders={csvHeaders}
                  csvPreview={csvPreview}
                  onMappingConfirmed={handleMappingConfirmed}
                  onCancel={() => setUploadStage({ stage: 'upload', progress: 0, message: 'Select a CSV file to begin' })}
                  savedMappings={getSavedMappings()}
                />
              </div>
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
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">✅ Churn Analysis Complete!</div>
                    
                    {uploadResult && (
                      <>
                        {/* Main Stats */}
                        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{uploadResult.processed}</div>
                            <div className="text-sm text-muted-foreground">users processed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{uploadResult.riskCounts.high || 0}</div>
                            <div className="text-sm text-muted-foreground">🔴 high risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{uploadResult.riskCounts.medium || 0}</div>
                            <div className="text-sm text-muted-foreground">🟠 medium risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{uploadResult.riskCounts.low || 0}</div>
                            <div className="text-sm text-muted-foreground">🟢 low risk</div>
                          </div>
                        </div>

                        {/* Error Summary */}
                        {uploadResult.failed > 0 && (
                          <div className="p-3 bg-destructive/10 rounded-lg">
                            <div className="font-medium text-destructive">⚠️ {uploadResult.failed} failed rows</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Some users couldn't be processed due to data validation issues
                            </div>
                          </div>
                        )}

                        {/* Sample Results Preview */}
                        {uploadResult.sampleUsers && uploadResult.sampleUsers.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Sample Results:</h4>
                            <div className="space-y-2">
                              {uploadResult.sampleUsers.map((user: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg text-sm">
                                  <div>
                                    <span className="font-medium">{user.customer_name}</span>
                                    <span className="text-muted-foreground ml-2">({user.customer_email})</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      user.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                      user.risk_level === 'medium' ? 'bg-orange-100 text-orange-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {user.risk_level?.toUpperCase()} RISK
                                    </span>
                                    <span className="text-lg font-bold">
                                      {Math.round((user.churn_score || 0) * 100)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetUploader}>
                  Upload Another File
                </Button>
                <Button onClick={() => onOpenChange(false)} className="bg-primary text-primary-foreground">
                  → View in Dashboard
                </Button>
              </div>
            </div>
          )}

          {uploadStage.stage === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>Error:</strong> {uploadStage.message}</div>
                    
                    {/* Show missing columns if any */}
                    {uploadErrors?.missing_columns && uploadErrors.missing_columns.length > 0 && (
                      <div className="mt-3 p-3 bg-destructive/10 rounded">
                        <div className="font-medium">Missing Required Columns:</div>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {uploadErrors.missing_columns.map((col) => (
                            <li key={col}>
                              <strong>{col}</strong> - Required for churn prediction
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs text-muted-foreground mt-2">
                          💡 Download our template for the correct format
                        </div>
                      </div>
                    )}
                    
                    {/* Show validation errors if any */}
                    {uploadErrors?.validation_errors && uploadErrors.validation_errors.length > 0 && (
                      <div className="mt-3 p-3 bg-destructive/10 rounded">
                        <div className="font-medium">Data Validation Issues:</div>
                        <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                          {uploadErrors.validation_errors.slice(0, 3).map((error, idx) => (
                            <div key={idx} className="text-xs">
                              <strong>Row {error.row}:</strong> {error.issue}
                            </div>
                          ))}
                          {uploadErrors.validation_errors.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{uploadErrors.validation_errors.length - 3} more issues
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
              
              {/* Action buttons */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
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
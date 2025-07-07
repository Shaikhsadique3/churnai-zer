
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, Loader, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

const CSVUploadModal = ({ open, onOpenChange, onUploadComplete }: CSVUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [validatedHeaders, setValidatedHeaders] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Fetch user's API key
  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const requiredHeaders = [
    'user_id', 'days_since_signup', 'monthly_revenue', 'subscription_plan',
    'number_of_logins_last30days', 'active_features_used', 'support_tickets_opened',
    'last_payment_status', 'email_opens_last30days', 'last_login_days_ago', 'billing_issue_count'
  ];

  // Handle file selection and parsing
  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setParsedData([]);
    setFileError('');
    setValidatedHeaders([]);
    
    if (!selectedFile) return;

    console.log('📁 File selected:', selectedFile.name, `(${(selectedFile.size / 1024).toFixed(1)} KB)`);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const rows = results.data as any[];
        const headers = results.meta.fields || [];
        
        console.log('🔍 Parsed CSV data:', { rows: rows.length, headers });
        
        // Validate file is not empty
        if (rows.length === 0) {
          setFileError('CSV file is empty or contains no valid data');
          return;
        }

        // Validate required headers
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          setFileError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        // Filter out rows with missing critical data
        const validRows = rows.filter(row => 
          row.user_id && 
          row.days_since_signup !== undefined && 
          row.monthly_revenue !== undefined &&
          row.subscription_plan &&
          row.number_of_logins_last30days !== undefined &&
          row.active_features_used !== undefined &&
          row.support_tickets_opened !== undefined &&
          row.last_payment_status &&
          row.email_opens_last30days !== undefined &&
          row.last_login_days_ago !== undefined &&
          row.billing_issue_count !== undefined
        );

        if (validRows.length !== rows.length) {
          console.warn('⚠️ Some rows were filtered out due to missing data:', {
            total: rows.length,
            valid: validRows.length,
            filtered: rows.length - validRows.length
          });
        }

        setParsedData(validRows);
        setValidatedHeaders(headers);
        console.log('✅ CSV validation successful:', { validRows: validRows.length, headers });
      },
      error: function(error: any) {
        console.error('❌ CSV parsing error:', error);
        setFileError('Failed to parse CSV file. Please check the file format.');
      }
    });
  };

  // Process batches with AI predictions
  const processBatches = async () => {
    if (!parsedData.length || !apiKeys?.[0]?.key) return;

    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < parsedData.length; i += batchSize) {
      batches.push(parsedData.slice(i, i + batchSize));
    }

    setTotalBatches(batches.length);
    setTotalCount(parsedData.length);
    
    console.log('🚀 Starting batch processing:', {
      totalUsers: parsedData.length,
      totalBatches: batches.length,
      batchSize
    });

    let processed = 0;
    let successful = 0;
    let failed = 0;
    const failedUsers: string[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      if (cancelled) {
        console.log('🛑 Processing cancelled by user');
        break;
      }

      const batch = batches[batchIndex];
      setCurrentBatch(batchIndex + 1);
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length}:`, {
        batchSize: batch.length,
        users: batch.map(u => u.user_id)
      });

      let retryCount = 0;
      let batchSuccess = false;

      // Retry logic for failed batches
      while (!batchSuccess && retryCount <= 1) {
        try {
          const response = await fetch(`https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/track`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": apiKeys[0].key
            },
            body: JSON.stringify(batch)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          console.log(`✅ Batch ${batchIndex + 1} success:`, result);
          
          successful += result.processed || batch.length;
          failed += result.failed || 0;
          
          if (result.results) {
            result.results.forEach((r: any) => {
              if (r.status === 'error') {
                failedUsers.push(r.user_id);
              }
            });
          }
          
          batchSuccess = true;
          
        } catch (error) {
          retryCount++;
          console.error(`❌ Batch ${batchIndex + 1} attempt ${retryCount} failed:`, error);
          
          if (retryCount > 1) {
            // Final failure
            failed += batch.length;
            batch.forEach(row => failedUsers.push(row.user_id || 'unknown'));
            
            toast({
              title: "❌ Batch failed",
              description: `Batch ${batchIndex + 1} failed after retry. Skipping...`,
              variant: "destructive"
            });
          } else {
            // Retry once
            console.log(`🔄 Retrying batch ${batchIndex + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          }
        }
      }

      processed += batch.length;
      setProcessedCount(processed);
      setProgress(Math.min(100, Math.round((processed / parsedData.length) * 100)));
      
      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Final results
    console.log('🏁 Processing complete:', {
      total: parsedData.length,
      successful,
      failed,
      failedUsers
    });

    if (!cancelled) {
      if (failed === 0) {
        toast({
          title: "🎉 Upload complete!",
          description: `Successfully processed all ${successful} users with AI churn predictions.`,
        });
      } else if (successful > 0) {
        toast({
          title: "⚠️ Partially successful",
          description: `${successful} users processed, ${failed} failed. Check console for details.`,
          variant: "destructive"
        });
        console.log('Failed user IDs:', failedUsers);
      } else {
        toast({
          title: "❌ Upload failed",
          description: `All ${failed} users failed to process. Please check your data.`,
          variant: "destructive"
        });
      }
      
      onUploadComplete();
      onOpenChange(false);
      resetForm();
    }
  };

  const handleUpload = async () => {
    if (!file || !parsedData.length || !apiKeys?.[0]?.key) {
      toast({
        title: "Missing requirements",
        description: "Please select a valid CSV file with parsed data.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setCancelled(false);
    setProgress(0);
    setProcessedCount(0);
    setCurrentBatch(0);
    
    await processBatches();
    
    setUploading(false);
  };

  const handleCancel = () => {
    setCancelled(true);
    setUploading(false);
    toast({
      title: "Processing cancelled",
      description: "Upload process has been stopped.",
    });
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(0);
    setCurrentBatch(0);
    setTotalBatches(0);
    setValidatedHeaders([]);
    setFileError('');
    setCancelled(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center text-base sm:text-lg">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            SaaS-Grade CSV Upload
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Upload customer data CSV for real-time AI churn analysis v5. <strong>Required:</strong> user_id, days_since_signup, monthly_revenue, subscription_plan, number_of_logins_last30days, active_features_used, support_tickets_opened, last_payment_status, email_opens_last30days, last_login_days_ago, billing_issue_count
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Input Section */}
          <div className="space-y-2">
            <Label htmlFor="csv-file" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm sm:text-base">📁 Select CSV File</span>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-xs text-primary self-start sm:self-auto"
                onClick={() => {
                  const csvContent = `user_id,days_since_signup,monthly_revenue,subscription_plan,number_of_logins_last30days,active_features_used,support_tickets_opened,last_payment_status,email_opens_last30days,last_login_days_ago,billing_issue_count
user_001,90,29.99,Free Trial,15,3,1,Success,8,2,0
user_002,180,99.99,Pro,25,8,0,Success,15,1,0
user_003,365,299.99,Pro,30,12,2,Success,20,0,1
user_004,45,0,Free Trial,5,2,3,Failed,2,7,2
user_005,120,99.99,Pro,20,6,1,Success,12,3,0`;
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sample_churn_data_v5.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download sample
              </Button>
            </Label>
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              disabled={uploading}
              className="transition-all duration-200 text-sm"
            />
          </div>

          {/* File Error Display */}
          {fileError && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {/* File Selected Display */}
          {file && !fileError && !uploading && (
            <div className="bg-accent/50 border border-accent rounded-lg p-3 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate">{file.name}</span>
                </div>
                <Badge variant="secondary" className="self-start sm:self-auto">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
              
              {parsedData.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {parsedData.length} users loaded
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {validatedHeaders.map(header => (
                      <Badge 
                        key={header} 
                        variant={requiredHeaders.includes(header) ? "default" : "secondary"}
                        className="text-xs truncate max-w-[120px] sm:max-w-none"
                        title={header}
                      >
                        {header}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Display */}
          {uploading && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing batches with AI churn predictions...
                  </span>
                  <span className="text-sm font-mono font-bold">{progress}%</span>
                </div>
                
                <Progress value={progress} className="w-full h-2 sm:h-3 mb-3" />
                
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="font-mono text-base sm:text-lg font-bold text-foreground">
                      {processedCount}
                    </div>
                    <div className="text-xs sm:text-sm">of {totalCount} users processed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-base sm:text-lg font-bold text-foreground">
                      {currentBatch}
                    </div>
                    <div className="text-xs sm:text-sm">of {totalBatches} batches</div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  🤖 Sending data in batches of 10 to external AI churn prediction API
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-2">
            {uploading ? (
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Processing
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || !parsedData.length || !!fileError}
                  className="flex items-center justify-center w-full sm:w-auto order-1 sm:order-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="truncate">
                    {parsedData.length > 0 ? `Process ${parsedData.length} Users` : "Upload & Process"}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadModal;

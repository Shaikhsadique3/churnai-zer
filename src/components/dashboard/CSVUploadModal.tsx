
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
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


  const handleUpload = async () => {
    if (!file || !user || !apiKeys?.[0]?.key) {
      toast({
        title: "Missing requirements", 
        description: "Please ensure you have a file selected and API key available.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setProcessedCount(0);
    
    try {
      // Parse CSV client-side with header validation
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          const rows = results.data as any[];
          
          // Validate file is not empty
          if (rows.length === 0) {
            toast({
              title: "Empty file",
              description: "The CSV file appears to be empty. Please check your file.",
              variant: "destructive"
            });
            setUploading(false);
            return;
          }

          // Validate required headers are present
          const requiredHeaders = ['user_id', 'plan', 'usage_score', 'last_login'];
          const fileHeaders = results.meta.fields || [];
          const missingHeaders = requiredHeaders.filter(header => !fileHeaders.includes(header));
          
          if (missingHeaders.length > 0) {
            toast({
              title: "Invalid CSV headers",
              description: `Missing required columns: ${missingHeaders.join(', ')}. Please ensure your CSV has: user_id, plan, usage_score, last_login`,
              variant: "destructive"
            });
            setUploading(false);
            return;
          }

          const total = rows.length;
          setTotalCount(total);
          
          const batchSize = 10;
          let processed = 0;
          let successful = 0;
          let failed = 0;
          const failedRows: string[] = [];
          
          // Process in batches of 10
          for (let i = 0; i < total; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            
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
                console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, errorText);
                failed += batch.length;
                batch.forEach(row => failedRows.push(row.user_id || 'unknown'));
              } else {
                const result = await response.json();
                successful += result.processed || 0;
                failed += result.failed || 0;
                
                // Track failed users from the batch response
                if (result.results) {
                  result.results.forEach((r: any) => {
                    if (r.status === 'error') {
                      failedRows.push(r.user_id);
                    }
                  });
                }
              }

              processed += batch.length;
              setProcessedCount(processed);
              setProgress(Math.min(100, Math.round((processed / total) * 100)));
              
            } catch (batchError) {
              console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, batchError);
              failed += batch.length;
              batch.forEach(row => failedRows.push(row.user_id || 'unknown'));
              processed += batch.length;
              setProcessedCount(processed);
              setProgress(Math.min(100, Math.round((processed / total) * 100)));
            }
          }
          
          // Show completion message
          if (failed === 0) {
            toast({
              title: "🎉 Successfully uploaded all users!",
              description: `${successful} users processed with churn predictions.`,
            });
          } else if (successful > 0) {
            toast({
              title: "⚠️ Partially successful upload",
              description: `${successful} users succeeded, ${failed} failed. Check console for failed user IDs.`,
              variant: "destructive"
            });
            console.log('Failed user IDs:', failedRows);
          } else {
            toast({
              title: "❌ Upload failed",
              description: `All ${failed} users failed to process. Please check your data and try again.`,
              variant: "destructive"
            });
          }
          
          // Refresh the dashboard data and close modal
          onUploadComplete();
          onOpenChange(false);
          resetForm();
        },
        error: function(error) {
          console.error('CSV parsing error:', error);
          toast({
            title: "CSV parsing failed",
            description: "Please check your CSV format and try again. Ensure it's a valid CSV file.",
            variant: "destructive",
          });
          setUploading(false);
        }
      });
      
    } catch (error) {
      console.error('CSV upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error processing your file.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload CSV File
          </DialogTitle>
          <DialogDescription>
            Upload customer data CSV with required columns: <strong>user_id, plan, usage_score, last_login</strong>. 
            Data will be processed in batches of 10 with real-time churn predictions from external AI model.
            <br />
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs text-blue-600"
              onClick={() => {
                const csvContent = `user_id,plan,usage_score,last_login
user_001,Free,45,2024-01-15T10:00:00Z
user_002,Pro,120,2024-01-20T15:30:00Z
user_003,Enterprise,200,2024-01-10T09:15:00Z
user_004,Free,25,2024-01-05T14:22:00Z
user_005,Pro,180,2024-01-22T11:45:00Z`;
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample_customer_data.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download sample CSV format
            </Button>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </div>
          
          {!apiKeys?.[0]?.key && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 mb-2">
                ⚠️ No API key found for your account. An API key is required for churn predictions.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  try {
                    const { data, error } = await supabase
                      .from('api_keys')
                      .insert([{
                        user_id: user?.id,
                        key: `cg_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                        name: 'Default API Key'
                      }])
                      .select();
                    
                    if (error) throw error;
                    
                    toast({
                      title: "API key generated",
                      description: "Your API key has been created successfully.",
                    });
                    
                    // Refresh the api keys query
                    window.location.reload();
                  } catch (error) {
                    toast({
                      title: "Failed to generate API key",
                      description: error.message || "Please try again.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Generate API Key
              </Button>
            </div>
          )}
          
          {file && !uploading && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <FileText className="h-4 w-4" />
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
          
          {uploading && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing batches with AI churn predictions...</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full h-3" />
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {processedCount} of {totalCount} users processed
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Sending data in batches of 10 to external churn prediction API
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Processing..." : "Upload & Process"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadModal;

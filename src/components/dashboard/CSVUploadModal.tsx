
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
      // Parse CSV client-side
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          const rows = results.data as any[];
          const total = rows.length;
          setTotalCount(total);
          
          const batchSize = 10;
          let processed = 0;
          
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
                throw new Error(`Batch ${Math.floor(i/batchSize) + 1} failed`);
              }

              const result = await response.json();
              processed += result.processed || batch.length;
              setProcessedCount(processed);
              setProgress(Math.min(100, Math.round((processed / total) * 100)));
              
            } catch (batchError) {
              console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, batchError);
              // Continue with next batch even if one fails
              processed += batch.length;
              setProcessedCount(processed);
              setProgress(Math.min(100, Math.round((processed / total) * 100)));
            }
          }
          
          toast({
            title: "🎉 CSV uploaded successfully!",
            description: `${processed} users tracked with churn predictions.`,
          });
          
          onUploadComplete();
          onOpenChange(false);
          resetForm();
        },
        error: function(error) {
          console.error('CSV parsing error:', error);
          toast({
            title: "CSV parsing failed",
            description: "Please check your CSV format and try again.",
            variant: "destructive",
          });
        }
      });
      
    } catch (error) {
      console.error('CSV upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error processing your file.",
        variant: "destructive",
      });
    } finally {
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
            Upload customer data CSV with columns: user_id, plan, usage, last_login. 
            Data will be processed in batches with real-time churn predictions.
            <br />
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs text-blue-600"
              onClick={() => {
                const csvContent = `user_id,plan,usage,last_login
user_001,Free,45,2024-01-15T10:00:00Z
user_002,Pro,120,2024-01-20T15:30:00Z
user_003,Enterprise,200,2024-01-10T09:15:00Z`;
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
                  <span>Processing batches...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              <div className="text-sm text-gray-600 text-center">
                {processedCount} of {totalCount} users processed
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

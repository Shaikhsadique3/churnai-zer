
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

interface CSVRow {
  user_id: string;
  plan: string;
  usage: number;
  last_login?: string;
}

type PlanType = 'Free' | 'Pro' | 'Enterprise';
type RiskLevel = 'low' | 'medium' | 'high';

const CSVUploadModal = ({ open, onOpenChange, onUploadComplete }: CSVUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, failed: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      return {
        user_id: row.user_id || row.userid || '',
        plan: row.plan || 'Free',
        usage: parseInt(row.usage || '0'),
        last_login: row.last_login || row.lastlogin || null,
      };
    }).filter(row => row.user_id);
  };

  const validatePlan = (plan: string): PlanType => {
    const validPlans: PlanType[] = ['Free', 'Pro', 'Enterprise'];
    return validPlans.includes(plan as PlanType) ? (plan as PlanType) : 'Free';
  };

  const processRow = async (row: CSVRow) => {
    try {
      // Simulate AI API call for churn prediction
      const mockChurnScore = Math.random();
      const riskLevel: RiskLevel = mockChurnScore > 0.7 ? 'high' : mockChurnScore > 0.4 ? 'medium' : 'low';
      
      const { error } = await supabase
        .from('user_data')
        .upsert({
          owner_id: user?.id!,
          user_id: row.user_id,
          plan: validatePlan(row.plan),
          usage: row.usage,
          last_login: row.last_login ? new Date(row.last_login).toISOString() : null,
          churn_score: mockChurnScore,
          risk_level: riskLevel,
        }, {
          onConflict: 'owner_id,user_id'
        });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error processing row:', error);
      return { success: false, error };
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    
    try {
      // Record upload start
      const { data: uploadRecord } = await supabase
        .from('csv_uploads')
        .insert({
          user_id: user.id,
          filename: file.name,
          status: 'processing'
        })
        .select()
        .single();
      
      const csvText = await file.text();
      const rows = parseCSV(csvText);
      
      setProgress({ processed: 0, failed: 0, total: rows.length });
      
      let processed = 0;
      let failed = 0;
      
      // Process rows in batches
      for (let i = 0; i < rows.length; i += 10) {
        const batch = rows.slice(i, i + 10);
        const results = await Promise.all(batch.map(processRow));
        
        results.forEach(result => {
          if (result.success) {
            processed++;
          } else {
            failed++;
          }
        });
        
        setProgress({ processed, failed, total: rows.length });
      }
      
      // Update upload record
      if (uploadRecord) {
        await supabase
          .from('csv_uploads')
          .update({
            rows_processed: processed,
            rows_failed: failed,
            status: 'completed'
          })
          .eq('id', uploadRecord.id);
      }
      
      toast({
        title: "Upload completed",
        description: `Processed ${processed} rows successfully. ${failed} rows failed.`,
      });
      
      onUploadComplete();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your file.",
        variant: "destructive",
      });
    }
    
    setUploading(false);
  };

  const resetForm = () => {
    setFile(null);
    setProgress({ processed: 0, failed: 0, total: 0 });
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
            Upload your customer data in CSV format. Required columns: user_id, plan, usage, last_login
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{progress.processed}/{progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                />
              </div>
              {progress.failed > 0 && (
                <div className="flex items-center space-x-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{progress.failed} rows failed</span>
                </div>
              )}
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

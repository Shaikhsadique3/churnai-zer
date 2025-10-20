import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function DataUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const mergeWithAuditId = searchParams.get("mergeWith");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // File type validation
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    // File size validation (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    // Parse and validate CSV content
    try {
      const csvContent = await selectedFile.text();
      const lines = csvContent.trim().split('\n');
      
      // Validate minimum rows
      if (lines.length < 2) {
        toast({
          title: "Invalid CSV",
          description: "CSV must contain headers and at least one data row",
          variant: "destructive",
        });
        return;
      }

      // Validate row count (max 10,000)
      if (lines.length > 10001) {
        toast({
          title: "Too many rows",
          description: "Maximum 10,000 rows allowed",
          variant: "destructive",
        });
        return;
      }

      // Sanitize CSV to prevent injection attacks
      const sanitizedLines = lines.map(line => {
        return line.split(',').map(cell => {
          const trimmed = cell.trim();
          // Prefix cells starting with formula characters with single quote
          if (/^[=+\-@]/.test(trimmed)) {
            return `'${trimmed}`;
          }
          return trimmed;
        }).join(',');
      });

      // Validate headers (case-insensitive)
      const headers = sanitizedLines[0].toLowerCase().split(',').map(h => h.trim());
      const validMetrics = [
        'ttfv', 'time_to_first_value', 'onboarding_completion', 'activation_rate',
        'login_frequency', 'feature_usage', 'session_duration', 'engagement_score',
        'nps_score', 'csat_score', 'feedback_count', 'support_tickets',
        'renewal_rate', 'churn_rate', 'winback_rate', 'upsell_rate',
        'health_score', 'csm_touchpoints', 'escalation_count', 'retention_rate'
      ];

      const foundMetrics = headers.filter(h => validMetrics.includes(h));
      if (foundMetrics.length === 0) {
        toast({
          title: "No valid metrics found",
          description: "CSV must contain at least one retention metric column",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      toast({
        title: "File validated",
        description: `Found ${foundMetrics.length} retention metric(s)`,
      });
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "Could not validate CSV file",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      let auditId = mergeWithAuditId;
      
      // If merging, load existing audit
      if (mergeWithAuditId) {
        const { data: existingAudit } = await supabase
          .from("audits")
          .select("*")
          .eq("id", mergeWithAuditId)
          .single();
        
        if (!existingAudit) throw new Error("Original audit not found");
      } else {
        // Create new audit
        const { data: newAudit, error: auditError } = await supabase
          .from("audits")
          .insert({
            user_id: null,
            email: email || null,
            audit_mode: "data"
          })
          .select()
          .single();

        if (auditError) throw auditError;
        auditId = newAudit.id;
      }

      // Read CSV file
      const csvContent = await file.text();

      // Process CSV via edge function
      const { data, error } = await supabase.functions.invoke("process-csv-audit", {
        body: { 
          auditId, 
          csvContent,
          mergeMode: !!mergeWithAuditId 
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Found ${data.metricsFound} retention metrics. Accuracy: ${data.accuracy}%`,
      });

      navigate(`/results/${auditId}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold">
              {mergeWithAuditId ? "Boost Your Accuracy" : "Upload Your Data"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mergeWithAuditId 
                ? "Add data to get a more accurate retention score"
                : "Get instant retention insights from your metrics"
              }
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="csv">CSV File</Label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg border-border hover:border-primary transition-colors">
                  <div className="space-y-2 text-center">
                    {file ? (
                      <div className="flex items-center gap-2 text-primary">
                        <FileText className="h-8 w-8" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    )}
                    <div className="flex text-sm text-muted-foreground">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                      >
                        <span>Upload a file</span>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".csv"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">CSV up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium">Expected CSV Format</p>
                  <p className="text-muted-foreground">
                    Include columns like: ttfv, login_frequency, nps_score, renewal_rate, health_score, etc.
                  </p>
                  <p className="text-muted-foreground">
                    Accuracy increases with more metrics: 60% base + 5% per metric (max 90%)
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Processing..." : "Analyze Data"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
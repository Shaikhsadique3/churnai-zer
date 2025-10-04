import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Link as LinkIcon, Loader2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";

interface DataUploadTabProps {
  onAnalysisComplete: (results: any, uspContent: string, websiteLink: string) => void;
}

export function DataUploadTab({ onAnalysisComplete }: DataUploadTabProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uspContent, setUspContent] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive"
        });
        return;
      }
      setCsvFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!csvFile || !uspContent || !websiteLink) {
      toast({
        title: "Missing information",
        description: "Please provide all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Parse CSV file
      const parsedData = await new Promise<any[]>((resolve, reject) => {
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        });
      });

      if (parsedData.length === 0) {
        throw new Error("CSV file is empty");
      }

      console.log(`Parsed ${parsedData.length} customer records`);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Call rules-based prediction endpoint
      const { data, error } = await supabase.functions.invoke('rules-based-churn-prediction', {
        body: { customers: parsedData },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Analysis complete!",
        description: `Processed ${data.analytics.total_customers} customers successfully`
      });

      onAnalysisComplete(data, uspContent, websiteLink);

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to process customer data",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer CSV Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Customer Data CSV
            </CardTitle>
            <CardDescription>
              Upload CSV with: customer_id, monthly_revenue, payment_status, days_since_signup, 
              last_login_days_ago, logins_last30days, active_features_used, tickets_opened, NPS_score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {csvFile ? csvFile.name : "Click to upload CSV file"}
                  </p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product USP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Product USP
            </CardTitle>
            <CardDescription>
              Describe your product's unique selling points, features, and benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Our AI-powered analytics platform helps businesses reduce churn by 40% through predictive insights and automated retention campaigns..."
              value={uspContent}
              onChange={(e) => setUspContent(e.target.value)}
              className="min-h-[140px] resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Website Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Your Website Link
          </CardTitle>
          <CardDescription>
            This will be used as the CTA in retention emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="url"
            placeholder="https://yourproduct.com"
            value={websiteLink}
            onChange={(e) => setWebsiteLink(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Analyze Button */}
      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={handleAnalyze}
          disabled={!csvFile || !uspContent || !websiteLink || isProcessing}
          className="min-w-[200px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyze Churn Risk
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
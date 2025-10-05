import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Link as LinkIcon, Loader2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";

interface UploadTabProps {
  onUploadComplete: (data: any) => void;
  onPredictionsComplete: (data: any) => void;
}

export function UploadTab({ onUploadComplete, onPredictionsComplete }: UploadTabProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uspFile, setUspFile] = useState<File | null>(null);
  const [websiteLink, setWebsiteLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUspUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.txt')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a TXT file",
          variant: "destructive"
        });
        return;
      }
      setUspFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!csvFile || !uspFile || !websiteLink) {
      toast({
        title: "Missing information",
        description: "Please provide all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Read USP file
      const uspText = await uspFile.text();

      // Parse CSV file
      const csvText = await csvFile.text();
      const parsedData = await new Promise<any[]>((resolve, reject) => {
        Papa.parse(csvText, {
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

      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Create upload record
      const { data: uploadData, error: uploadError } = await supabase
        .from('uploads')
        .insert({
          user_id: session.user.id,
          csv_filename: csvFile.name,
          usp_filename: uspFile.name,
          csv_url: '', // Not storing file, just processing
          usp_text: uspText,
          website_link: websiteLink,
          status: 'processing'
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      toast({
        title: "Processing...",
        description: "Analyzing customer data and predicting churn risk"
      });

      // Call prediction endpoint
      const { data: predictionData, error: predictionError } = await supabase.functions.invoke('predict', {
        body: { 
          upload_id: uploadData.id,
          csv_data: parsedData 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (predictionError) throw predictionError;

      toast({
        title: "Analysis complete!",
        description: `Processed ${predictionData.analytics.total_customers} customers successfully`
      });

      onUploadComplete({
        upload_id: uploadData.id,
        usp_text: uspText,
        website_link: websiteLink
      });
      
      onPredictionsComplete(predictionData);

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
              Required columns: customer_id, monthly_revenue, payment_status, days_since_signup, 
              last_login_days_ago, logins_last30days, active_features_used, tickets_opened, NPS_score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
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
          </CardContent>
        </Card>

        {/* Product USP Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Product USP File (.txt)
            </CardTitle>
            <CardDescription>
              Plain text file describing your product features, benefits, and unique selling points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Input
                type="file"
                accept=".txt"
                onChange={handleUspUpload}
                className="hidden"
                id="usp-upload"
              />
              <label htmlFor="usp-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {uspFile ? uspFile.name : "Click to upload TXT file"}
                </p>
              </label>
            </div>
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
          disabled={!csvFile || !uspFile || !websiteLink || isProcessing}
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

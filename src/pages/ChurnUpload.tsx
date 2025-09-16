import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ChurnUpload = () => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file only.",
          variant: "destructive"
        });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB for reliable processing.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !file) {
      toast({
        title: "Missing information",
        description: "Please provide both email and CSV file.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-csv', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Upload successful!",
        description: "Your file has been uploaded and processing has started."
      });

      navigate(`/report/${data.upload_id}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Upload Your Customer Data
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your CSV file to get started with your free churn audit
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Data Upload
            </CardTitle>
            <CardDescription>
              Provide your email and upload your customer data CSV file. We'll analyze it and send you a comprehensive churn audit report.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Your Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="founder@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  We'll send your report to this email address
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Customer Data CSV File
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Upload your customer data in CSV format (max 10MB)
                </p>
                {file && (
                  <p className="text-sm text-green-600">
                    ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Include customer ID, email, plan type, last login date</li>
                  <li>• Add usage metrics, billing data, support tickets</li>
                  <li>• Include engagement scores if available</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Start Analysis
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Your data is secure and will only be used for churn analysis. We follow industry-standard security practices.
          </p>
        </div>
      </div>
    </div>
  );
};
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";

interface UploadResult {
  success: boolean;
  processed: number;
  errors: number;
  errorDetails: string[];
}

export default function UploadCSV() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const processCSV = async (csvData: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-feature-events', {
        body: { csvData }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setUploadResult(null);

    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            setProgress(30);
            
            if (results.errors.length > 0) {
              throw new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
            }

            setProgress(60);

            // Process the data
            const result = await processCSV(results.data);
            
            setProgress(100);
            setUploadResult(result);

            if (result.success) {
              toast({
                title: "✅ CSV processed successfully",
                description: `Processed ${result.processed} events with ${result.errors} errors.`,
              });
            } else {
              toast({
                title: "⚠️ Processing completed with errors",
                description: `${result.errors} errors occurred during processing.`,
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('Processing error:', error);
            toast({
              title: "❌ Processing failed",
              description: error instanceof Error ? error.message : "Unknown error occurred",
              variant: "destructive",
            });
            setUploadResult({
              success: false,
              processed: 0,
              errors: 1,
              errorDetails: [error instanceof Error ? error.message : "Unknown error"]
            });
          } finally {
            setUploading(false);
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast({
            title: "❌ CSV parsing failed",
            description: error.message,
            variant: "destructive",
          });
          setUploading(false);
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "❌ Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setUploading(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const downloadTemplate = () => {
    const templateData = [
      {
        user_id: "user_123",
        feature_name: "Dashboard View",
        event_date: "2024-01-15T10:30:00Z",
        plan: "Pro"
      },
      {
        user_id: "user_456", 
        feature_name: "Export Data",
        event_date: "2024-01-15T11:45:00Z",
        plan: "Free"
      },
      {
        user_id: "user_789",
        feature_name: "API Access",
        event_date: "2024-01-15T14:20:00Z",
        plan: "Enterprise"
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature_events_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Feature Events</h1>
          <p className="text-muted-foreground">Import your user feature adoption data to generate insights</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload your feature events data in CSV format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                  ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {isDragActive ? (
                  <p className="text-lg">Drop the CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">Drag & drop a CSV file here</p>
                    <p className="text-sm text-muted-foreground">or click to select a file</p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">Processing CSV file...</p>
                </div>
              )}

              {uploadResult && (
                <Alert className="mt-4">
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {uploadResult.success 
                      ? `Successfully processed ${uploadResult.processed} events`
                      : `Processing failed: ${uploadResult.errorDetails.join(', ')}`
                    }
                    {uploadResult.errors > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Errors ({uploadResult.errors}):</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {uploadResult.errorDetails.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {uploadResult.errorDetails.length > 5 && (
                            <li>... and {uploadResult.errorDetails.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                CSV Format Requirements
              </CardTitle>
              <CardDescription>
                Your CSV file should include these columns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-600">Required Columns:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• <code>user_id</code> - Unique identifier for the user</li>
                    <li>• <code>feature_name</code> - Name of the feature adopted</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-600">Optional Columns:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• <code>event_date</code> - When the feature was adopted (ISO format)</li>
                    <li>• <code>plan</code> - User's subscription plan (Free, Pro, Enterprise, etc.)</li>
                    <li>• Any additional fields will be stored as metadata</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={downloadTemplate} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Data Format</CardTitle>
            <CardDescription>Example of how your CSV data should be structured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">user_id</th>
                    <th className="text-left p-2 font-medium">feature_name</th>
                    <th className="text-left p-2 font-medium">event_date</th>
                    <th className="text-left p-2 font-medium">plan</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="p-2">user_123</td>
                    <td className="p-2">Dashboard View</td>
                    <td className="p-2">2024-01-15T10:30:00Z</td>
                    <td className="p-2">Pro</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">user_456</td>
                    <td className="p-2">Export Data</td>
                    <td className="p-2">2024-01-15T11:45:00Z</td>
                    <td className="p-2">Free</td>
                  </tr>
                  <tr>
                    <td className="p-2">user_789</td>
                    <td className="p-2">API Access</td>
                    <td className="p-2">2024-01-15T14:20:00Z</td>
                    <td className="p-2">Enterprise</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
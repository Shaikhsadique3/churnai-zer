import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Clock, CheckCircle } from "lucide-react";
import EnhancedCSVUploader from "@/components/dashboard/EnhancedCSVUploader";
import UploadHistorySection from "@/components/dashboard/UploadHistorySection";
import { ApiTestComponent } from "@/components/dashboard/ApiTestComponent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const CSVUploadPage = () => {
  const { user } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch upload statistics
  const { data: uploadStats } = useQuery({
    queryKey: ['upload-stats', user?.id],
    queryFn: async () => {
      const { data: uploads, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;

      const totalUploads = uploads?.length || 0;
      const totalProcessed = uploads?.reduce((sum, upload) => sum + (upload.rows_processed || 0), 0) || 0;
      const successfulUploads = uploads?.filter(upload => upload.status === 'completed').length || 0;

      return { totalUploads, totalProcessed, successfulUploads };
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">📂 CSV Upload & Analysis</h1>
        <p className="text-muted-foreground">Import and analyze your customer data</p>
      </div>

      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats?.totalUploads || 0}</div>
            <p className="text-xs text-muted-foreground">CSV files processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Processed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats?.totalProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">Customer records analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uploadStats?.totalUploads ? 
                Math.round((uploadStats.successfulUploads / uploadStats.totalUploads) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Uploads completed successfully</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section and API Test */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New CSV File
              </CardTitle>
              <CardDescription>
                Import your customer data for churn analysis using your secure API connection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Smart CSV Upload with Real AI Predictions</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload any CSV format and get real churn predictions using your AI model API.
                  </p>
                  <Button onClick={() => setUploadModalOpen(true)} size="lg">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose CSV File
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">🚀 Secure AI Integration:</p>
                  <ul className="text-xs space-y-1">
                    <li>🔒 <strong>Secure API calls:</strong> Your API key is stored safely in Supabase</li>
                    <li>📊 <strong>Batch processing:</strong> Faster predictions for large datasets</li>
                    <li>🤖 <strong>Real predictions:</strong> Uses https://ai-model-rumc.onrender.com/</li>
                    <li>📈 <strong>Auto-mapping:</strong> Works with any CSV format</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <ApiTestComponent />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Required CSV Columns</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <p>• customer_name</p>
              <p>• customer_email</p>
              <p>• signup_date</p>
              <p>• last_active_date</p>
              <p>• plan</p>
              <p>• billing_status</p>
              <p>• monthly_revenue</p>
              <p>• active_features_used</p>
              <p>• support_tickets_opened</p>
              <p>• email_opens_last30days</p>
              <p>• number_of_logins_last30days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload History */}
      <UploadHistorySection />

      <EnhancedCSVUploader 
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
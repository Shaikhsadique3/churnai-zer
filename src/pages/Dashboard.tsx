import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UploadTab } from "@/components/dashboard/UploadTab";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { EmailsTab } from "@/components/dashboard/EmailsTab";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { BarChart3, Upload, Mail } from "lucide-react";

export default function Dashboard() {
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [uploadData, setUploadData] = useState<any>(null);

  const handleUploadComplete = (data: any) => {
    setUploadId(data.upload_id);
    setUploadData(data);
  };

  const handlePredictionsComplete = (data: any) => {
    setPredictions(data.predictions);
    setAnalytics(data.analytics);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Churn Prediction Dashboard
          </h1>
          <p className="text-gray-600">
            Upload customer data, analyze churn risk, and generate personalized retention emails
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mx-auto">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Data
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              disabled={!analytics}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="emails" 
              disabled={!predictions}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="p-6">
              <UploadTab 
                onUploadComplete={handleUploadComplete}
                onPredictionsComplete={handlePredictionsComplete}
              />
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            {analytics && predictions && (
              <AnalyticsTab 
                analytics={analytics}
                predictions={predictions}
              />
            )}
          </TabsContent>

          <TabsContent value="emails">
            {predictions && uploadData && (
              <EmailsTab 
                predictions={predictions}
                uploadData={uploadData}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

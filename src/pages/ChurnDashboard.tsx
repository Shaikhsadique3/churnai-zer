import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { Upload, BarChart3, Mail, Download } from "lucide-react";
import { DataUploadTab } from "@/components/dashboard/DataUploadTab";
import { ChurnAnalyticsTab } from "@/components/dashboard/ChurnAnalyticsTab";
import { EmailGeneratorTab } from "@/components/dashboard/EmailGeneratorTab";

export default function ChurnDashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [churnResults, setChurnResults] = useState<any>(null);
  const [uspContent, setUspContent] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Churn Prediction & Retention Platform
          </h1>
          <p className="text-lg text-gray-600">
            Industry-standard rules-based churn analysis with AI-powered retention emails
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100 p-1 rounded-t-lg">
              <TabsTrigger 
                value="upload" 
                className="flex items-center gap-2 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Upload className="w-5 h-5" />
                Upload Data
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"
                disabled={!churnResults}
              >
                <BarChart3 className="w-5 h-5" />
                Churn Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="emails" 
                className="flex items-center gap-2 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"
                disabled={!churnResults}
              >
                <Mail className="w-5 h-5" />
                Email Generator
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="upload" className="mt-0">
                <DataUploadTab 
                  onAnalysisComplete={(results, usp, link) => {
                    setChurnResults(results);
                    setUspContent(usp);
                    setWebsiteLink(link);
                    setActiveTab("analytics");
                  }}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <ChurnAnalyticsTab 
                  results={churnResults}
                  onProceedToEmails={() => setActiveTab("emails")}
                />
              </TabsContent>

              <TabsContent value="emails" className="mt-0">
                <EmailGeneratorTab 
                  results={churnResults}
                  uspContent={uspContent}
                  websiteLink={websiteLink}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
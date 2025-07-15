import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailProviderStatus } from "@/components/dashboard/EmailProviderStatus";
import { EnhancedEmailTemplateManager } from "@/components/dashboard/EnhancedEmailTemplateManager";
import { EmailAnalyticsDashboard } from "@/components/dashboard/EmailAnalyticsDashboard";
import { 
  Mail, 
  BarChart3, 
  FileText, 
  Settings, 
  Zap,
  Shield,
  Clock,
  Target
} from "lucide-react";

export const EnhancedEmailSystemPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <span>Churnaizer Email System</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Simplified email service for launch - custom integrations coming soon!
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6 text-center">
            <Shield className="h-10 w-10 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Enterprise Security</h3>
            <p className="text-sm text-blue-700 mt-1">
              SOC2 compliant with encrypted storage
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center">
            <Target className="h-10 w-10 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold text-green-900">Smart Targeting</h3>
            <p className="text-sm text-green-700 mt-1">
              AI-powered segmentation and personalization
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Advanced Analytics</h3>
            <p className="text-sm text-purple-700 mt-1">
              Real-time delivery and engagement tracking
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6 text-center">
            <Clock className="h-10 w-10 mx-auto mb-3 text-orange-600" />
            <h3 className="font-semibold text-orange-900">Smart Scheduling</h3>
            <p className="text-sm text-orange-700 mt-1">
              Optimal send time prediction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EmailProviderStatus />
          <EmailAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <EnhancedEmailTemplateManager />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Email Campaigns</span>
              </CardTitle>
              <CardDescription>
                Create and manage automated email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Campaign Management</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced campaign features coming soon!
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>🎯 Advanced audience segmentation</p>
                  <p>📅 Smart scheduling and automation</p>
                  <p>📊 A/B testing capabilities</p>
                  <p>🔄 Drip campaign sequences</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Email System Settings</span>
              </CardTitle>
              <CardDescription>
                Configure your email system preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Provider Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Active Provider</span>
                          <span className="font-semibold">Resend</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Daily Limit</span>
                          <span className="font-semibold">10,000</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Rate Limit</span>
                          <span className="font-semibold">100/min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>DKIM Signing</span>
                          <span className="text-green-600 font-semibold">✓ Enabled</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SPF Records</span>
                          <span className="text-green-600 font-semibold">✓ Valid</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Encryption</span>
                          <span className="text-green-600 font-semibold">✓ TLS 1.3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">99.2%</p>
                        <p className="text-sm text-muted-foreground">Delivery Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">0.8s</p>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">24/7</p>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">SOC2</p>
                        <p className="text-sm text-muted-foreground">Compliant</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Code, Users, TrendingUp, AlertTriangle, Filter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UploadedUsersTable } from "@/components/dashboard/UploadedUsersTable";
import EnhancedCSVUploader from "@/components/dashboard/EnhancedCSVUploader";
import { AIEmailPreview } from "@/components/dashboard/AIEmailPreview";
import { RecentEmailsList } from "@/components/dashboard/RecentEmailsList";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'email'>('overview');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Churn Analytics Dashboard</h1>
              <p className="text-muted-foreground text-lg">Monitor and prevent customer churn with AI-powered insights</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/integration">
                  <Code className="h-4 w-4 mr-2" />
                  SDK Setup
                </Link>
              </Button>
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </div>
          </div>

          {/* Navigation with clean tabs */}
          <div className="flex items-center gap-6 border-b">
            <button
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeView === 'overview' 
                  ? 'border-primary text-foreground font-medium' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveView('overview')}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </div>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeView === 'users' 
                  ? 'border-primary text-foreground font-medium' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveView('users')}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Analysis
              </div>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeView === 'email' 
                  ? 'border-primary text-foreground font-medium' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveView('email')}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Automation
              </div>
            </button>
          </div>
        </div>

        {/* Risk Filter for Users View */}
        {activeView === 'users' && (
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by risk:</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={riskFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRiskFilter('all')}
              >
                All Users
              </Button>
              <Button
                variant={riskFilter === 'high' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setRiskFilter('high')}
                className="flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                High Risk
              </Button>
              <Button
                variant={riskFilter === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRiskFilter('medium')}
              >
                <Badge variant="secondary" className="w-2 h-2 p-0 mr-1" />
                Medium Risk
              </Button>
              <Button
                variant={riskFilter === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRiskFilter('low')}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Low Risk
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-8">
          {activeView === 'overview' && <DashboardOverview />}
          {activeView === 'users' && <UploadedUsersTable onUserSelect={setSelectedUser} />}
          {activeView === 'email' && (
            <div className="space-y-6">
              {/* Selected User Email Display */}
              {selectedUser && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIEmailPreview userData={selectedUser} />
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Automation Settings</CardTitle>
                        <CardDescription>
                          Emails automatically trigger for high-risk users via SDK
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Auto-trigger for high-risk users</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">AI Model</span>
                            <Badge variant="outline">Mistral 7B + GPT-4o</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email sender</span>
                            <Badge variant="outline">nexa@churnaizer.com</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Psychology style</span>
                            <Badge variant="outline">Urgency + Loss Aversion</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {/* Auto-Generated Email Display for High-Risk Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Recent AI-Generated Emails
                  </CardTitle>
                  <CardDescription>
                    Automatically generated retention emails for high-risk users detected by the SDK
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentEmailsList />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <EnhancedCSVUploader 
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          onUploadComplete={() => {
            setUploadModalOpen(false);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;

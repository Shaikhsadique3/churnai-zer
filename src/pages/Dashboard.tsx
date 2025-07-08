
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UploadedUsersTable } from "@/components/dashboard/UploadedUsersTable";
import CSVUploadModal from "@/components/dashboard/CSVUploadModal";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'users'>('overview');

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        userEmail={user?.email || ''}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant={activeView === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveView('overview')}
          >
            📊 Dashboard Overview
          </Button>
          <Button
            variant={activeView === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveView('users')}
          >
            👥 Uploaded Users
          </Button>
          <Button onClick={() => setUploadModalOpen(true)} className="ml-auto">
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>

        {/* Conditional Content */}
        {activeView === 'overview' && <DashboardOverview />}
        {activeView === 'users' && <UploadedUsersTable />}

        {/* Quick Actions (always visible) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Code className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                API Integration
              </CardTitle>
              <CardDescription className="text-sm">
                Integrate ChurnGuard with your application using our API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/integration">
                <Button variant="outline" className="w-full">
                  View Integration Guide
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                🔗 Automations
              </CardTitle>
              <CardDescription className="text-sm">
                Set up automated email campaigns and webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <CSVUploadModal 
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={() => {
          setUploadModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;

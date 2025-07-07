
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Code, LogOut, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import UserDataTable from "@/components/dashboard/UserDataTable";
import CSVUploadModal from "@/components/dashboard/CSVUploadModal";
import { ChurnTrendChart } from "@/components/dashboard/ChurnTrendChart";
import { WeeklyReportCard } from "@/components/dashboard/WeeklyReportCard";
import { ChurnScoreTable } from "@/components/dashboard/ChurnScoreTable";
import { ChurnReasonTable } from "@/components/dashboard/ChurnReasonTable";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch user data
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const stats = {
    total: userData?.length || 0,
    high: userData?.filter(u => u.risk_level === 'high').length || 0,
    medium: userData?.filter(u => u.risk_level === 'medium').length || 0,
    low: userData?.filter(u => u.risk_level === 'low').length || 0,
  };

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
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Enhanced Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ChurnTrendChart />
          <WeeklyReportCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ChurnScoreTable />
          <ChurnReasonTable />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Upload Customer Data
              </CardTitle>
              <CardDescription className="text-sm">
                Import your customer data via CSV file for bulk analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setUploadModalOpen(true)} className="w-full">
                Upload CSV File
              </Button>
            </CardContent>
          </Card>

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
        </div>

        {/* User Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Customer Analytics</CardTitle>
            <CardDescription className="text-sm">
              Monitor your customers and their churn risk levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <UserDataTable data={userData || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </main>

      <CSVUploadModal 
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={() => {
          refetch();
          setUploadModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;

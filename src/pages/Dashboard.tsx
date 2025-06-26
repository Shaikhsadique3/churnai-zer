
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        userEmail={user?.email || ''}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Customer Data
              </CardTitle>
              <CardDescription>
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
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                API Integration
              </CardTitle>
              <CardDescription>
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
            <CardTitle>Customer Analytics</CardTitle>
            <CardDescription>
              Monitor your customers and their churn risk levels
            </CardDescription>
          </CardHeader>
          <CardContent>
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

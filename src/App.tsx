
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";

// Pages
import Index from "./pages/Index";
import { AnalyticsDashboard } from "./pages/dashboard/AnalyticsDashboard";
import { CSVUploadPage } from "./pages/dashboard/CSVUploadPage";
import { EmailAutomationPage } from "./pages/dashboard/EmailAutomationPage";
import { RecoveredUsersPage } from "./pages/dashboard/RecoveredUsersPage";
import { UsersPage } from "./pages/UsersPage";
import IntegrationPage from "./pages/IntegrationPage";
import ProfilePage from "./pages/ProfilePage";
import Auth from "./pages/Auth";

// Components
import { MainLayout } from "@/components/layout/MainLayout";
import PrivateRoute from "@/components/auth/PrivateRoute";
import PublicRoute from "@/components/auth/PublicRoute";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route 
                  path="/auth" 
                  element={
                    <PublicRoute>
                      <Auth />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <MainLayout><AnalyticsDashboard /></MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/dashboard/csv-upload" 
                  element={
                    <PrivateRoute>
                      <MainLayout><CSVUploadPage /></MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/dashboard/email-automation" 
                  element={
                    <PrivateRoute>
                      <MainLayout><EmailAutomationPage /></MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/dashboard/recovered-users" 
                  element={
                    <PrivateRoute>
                      <MainLayout><RecoveredUsersPage /></MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <PrivateRoute>
                      <MainLayout><UsersPage /></MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/integration" 
                  element={
                    <PrivateRoute>
                      <MainLayout><IntegrationPage /></MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <MainLayout><ProfilePage /></MainLayout>
                    </PrivateRoute>
                  } 
                />
                
                {/* Catch all route - redirect to landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

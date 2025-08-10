
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import { AnalyticsDashboard } from "./pages/dashboard/AnalyticsDashboard";
import { CSVUploadPage } from "./pages/dashboard/CSVUploadPage";
import { EmailAutomationPage } from "./pages/dashboard/EmailAutomationPage";
import { RecoveredUsersPage } from "./pages/dashboard/RecoveredUsersPage";
import { UsersPage } from "./pages/UsersPage";
import IntegrationPage from "./pages/IntegrationPage";
import { MainLayout } from "@/components/layout/MainLayout";

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
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                
                {/* Dashboard routes with sidebar */}
                <Route path="/dashboard" element={<MainLayout><AnalyticsDashboard /></MainLayout>} />
                <Route path="/dashboard/csv-upload" element={<MainLayout><CSVUploadPage /></MainLayout>} />
                <Route path="/dashboard/email-automation" element={<MainLayout><EmailAutomationPage /></MainLayout>} />
                <Route path="/dashboard/recovered-users" element={<MainLayout><RecoveredUsersPage /></MainLayout>} />
                <Route path="/users" element={<MainLayout><UsersPage /></MainLayout>} />
                <Route path="/integration" element={<MainLayout><IntegrationPage /></MainLayout>} />
                
                {/* Redirect any unknown routes to analytics dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

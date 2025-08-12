
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import { AnalyticsDashboard } from "./pages/dashboard/AnalyticsDashboard";
import { CSVUploadPage } from "./pages/dashboard/CSVUploadPage";
import { EmailAutomationPage } from "./pages/dashboard/EmailAutomationPage";
import { RecoveredUsersPage } from "./pages/dashboard/RecoveredUsersPage";
import { UsersPage } from "./pages/UsersPage";
import IntegrationPage from "./pages/IntegrationPage";
import ProfilePage from "./pages/ProfilePage";
import { MainLayout } from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// Protected routes wrapper
const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout><AnalyticsDashboard /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/csv-upload" element={
        <ProtectedRoute>
          <MainLayout><CSVUploadPage /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/email-automation" element={
        <ProtectedRoute>
          <MainLayout><EmailAutomationPage /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/recovered-users" element={
        <ProtectedRoute>
          <MainLayout><RecoveredUsersPage /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <MainLayout><UsersPage /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/integration" element={
        <ProtectedRoute>
          <MainLayout><IntegrationPage /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout><ProfilePage /></MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// App content with auth routing logic
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Index />} />
        
        {/* Protected dashboard routes */}
        <Route path="/dashboard/*" element={<ProtectedRoutes />} />
        <Route path="/users" element={
          <ProtectedRoute>
            <MainLayout><UsersPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/integration" element={
          <ProtectedRoute>
            <MainLayout><IntegrationPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout><ProfilePage /></MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Redirect logic based on auth status */}
        <Route path="*" element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
        } />
      </Routes>
    </SidebarProvider>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

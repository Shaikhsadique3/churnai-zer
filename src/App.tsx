
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Integration from "./pages/Integration";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardOverviewPage } from "./pages/dashboard/DashboardOverviewPage";
import { CSVUploadPage } from "./pages/dashboard/CSVUploadPage";
import { UploadedUsersPage } from "./pages/dashboard/UploadedUsersPage";
import { UserDetailPage } from "./pages/dashboard/UserDetailPage";
import { ChurnReportsPage } from "./pages/dashboard/ChurnReportsPage";
import { AutomationsPage } from "./pages/dashboard/AutomationsPage";
import { PlaybooksBuilderPage } from "./pages/dashboard/PlaybooksBuilderPage";
import { EmailTemplatesPage } from "./pages/dashboard/EmailTemplatesPage";
import { EmailLogsPage } from "./pages/dashboard/EmailLogsPage";
import { IntegrationsPage } from "./pages/dashboard/IntegrationsPage";
import { EmailProviderVerificationPage } from "./pages/dashboard/EmailProviderVerificationPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverviewPage />} />
              <Route path="csv-upload" element={<CSVUploadPage />} />
              <Route path="users" element={<UploadedUsersPage />} />
              <Route path="users/:userId" element={<UserDetailPage />} />
              <Route path="reports" element={<ChurnReportsPage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="automations/playbooks" element={<AutomationsPage />} />
              <Route path="automations/playbooks-builder" element={<PlaybooksBuilderPage />} />
              <Route path="automations/emails" element={<AutomationsPage />} />
              <Route path="email-templates" element={<EmailTemplatesPage />} />
              <Route path="email-logs" element={<EmailLogsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="integrations/email-verification" element={<EmailProviderVerificationPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route 
              path="/integration" 
              element={
                <ProtectedRoute>
                  <Integration />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

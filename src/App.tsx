
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

// Import pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Docs from "@/pages/Docs";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import RefundPolicy from "@/pages/RefundPolicy";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

// Dashboard pages
import DashboardOverview from "@/pages/dashboard/DashboardOverview";
import CSVUploadPage from "@/pages/dashboard/CSVUploadPage";
import EmailAutomationPage from "@/pages/dashboard/EmailAutomationPage";
import RecoveredUsersPage from "@/pages/dashboard/RecoveredUsersPage";
import UpgradePage from "@/pages/dashboard/UpgradePage";
import UsersPage from "@/pages/UsersPage";
import IntegrationPage from "@/pages/IntegrationPage";
import ProfilePage from "@/pages/ProfilePage";

// Admin pages
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Route components
import PrivateRoute from "@/components/auth/PrivateRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import AdminRoute from "@/components/auth/AdminRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardOverview /></PrivateRoute>} />
            <Route path="/dashboard/csv-upload" element={<PrivateRoute><CSVUploadPage /></PrivateRoute>} />
            <Route path="/dashboard/email-automation" element={<PrivateRoute><EmailAutomationPage /></PrivateRoute>} />
            <Route path="/dashboard/recovered-users" element={<PrivateRoute><RecoveredUsersPage /></PrivateRoute>} />
            <Route path="/dashboard/upgrade" element={<PrivateRoute><UpgradePage /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
            <Route path="/integration" element={<PrivateRoute><IntegrationPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

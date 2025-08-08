
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Public pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';
import NotAuthorized from './pages/NotAuthorized';

// Dashboard pages
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CSVUploadPage } from './pages/dashboard/CSVUploadPage';
import Integration from './pages/Integration';
import FounderProfile from './pages/dashboard/FounderProfile';
import AIEmailCampaignsPage from './pages/dashboard/AIEmailCampaignsPage';

// Admin pages
import AdminLogin from './pages/AdminLogin';
import { AdminLayout } from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminInbox from './pages/admin/AdminInbox';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/docs" element={<Documentation />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardOverview />} />
                  <Route path="csv-upload" element={<CSVUploadPage />} />
                  <Route path="sdk" element={<Integration />} />
                  <Route path="email-logs" element={<AIEmailCampaignsPage />} />
                  <Route path="profile" element={<FounderProfile />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="panel" element={<AdminPanel />} />
                  <Route path="announcements" element={<AdminAnnouncements />} />
                  <Route path="blogs" element={<AdminBlogs />} />
                  <Route path="inbox" element={<AdminInbox />} />
                </Route>

                {/* Error Routes */}
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

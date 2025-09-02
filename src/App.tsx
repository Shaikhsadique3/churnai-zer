import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import FeatureAdoptionDashboard from '@/pages/FeatureAdoptionDashboard';
import UploadCSV from '@/pages/UploadCSV';
import Auth from '@/pages/Auth';
import CSVUploadPage from '@/pages/CSVUploadPage';
import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import SettingsPage from '@/pages/SettingsPage';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Documentation from '@/pages/Documentation';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import RefundPolicy from '@/pages/RefundPolicy';
import NotFound from '@/pages/NotFound';
import NotAuthorized from '@/pages/NotAuthorized';
import AdminLogin from '@/pages/AdminLogin';
import AdminPanel from '@/pages/AdminPanel';
import ProfilePage from '@/pages/ProfilePage';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<FeatureAdoptionDashboard />} />
            
            {/* Redirect authenticated users to dashboard */}
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            
            {/* Auth routes - only accessible when not logged in */}
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />

            {/* Dashboard Routes - All protected with DashboardLayout */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardOverview />
                </DashboardLayout>
              </PrivateRoute>
            } />
            <Route path="/upload" element={
              <PrivateRoute>
                <UploadCSV />
              </PrivateRoute>
            } />

            {/* Profile & Settings */}
            <Route path="/profile" element={
              <PrivateRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </PrivateRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />

            {/* Error routes */}
            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
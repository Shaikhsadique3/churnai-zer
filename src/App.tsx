import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import NotFound from '@/pages/NotFound';
import { ChurnReport } from '@/pages/ChurnReport';
import { ChurnDashboard as ChurnAnalysisDashboard } from '@/components/churn/ChurnDashboard';
import { EnhancedChurnUpload } from '@/components/churn/EnhancedChurnUpload';
import { ReportsDashboard } from '@/pages/ReportsDashboard';
import ProfilePage from '@/pages/ProfilePage';
import ChurnDashboard from '@/pages/ChurnDashboard';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Churn Audit Service - Core Routes */}
            <Route path="/upload" element={<EnhancedChurnUpload />} />
            <Route path="/report/:uploadId" element={<ChurnReport />} />
            <Route path="/analysis/:uploadId" element={<ChurnAnalysisDashboard />} />
            
            {/* New SaaS Dashboard - Protected */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <ChurnDashboard />
              </PrivateRoute>
            } />
            
            {/* Reports Dashboard - Protected */}
            <Route path="/reports" element={
              <PrivateRoute>
                <ReportsDashboard />
              </PrivateRoute>
            } />
            
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

            {/* User Profile */}
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />

            {/* Error routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
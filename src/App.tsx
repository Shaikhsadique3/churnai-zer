
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
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
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { CSVUploadPage } from '@/pages/dashboard/CSVUploadPage';
import { EmailAutomationPage } from '@/pages/dashboard/EmailAutomationPage';
import { RecoveredUsersPage } from '@/pages/dashboard/RecoveredUsersPage';
import UpgradePage from '@/pages/dashboard/UpgradePage';
import { UsersPage } from '@/pages/UsersPage';
import IntegrationPage from '@/pages/IntegrationPage';
import { AnalyticsDashboard } from '@/pages/dashboard/AnalyticsDashboard';
import { AutomationsPage } from '@/pages/dashboard/AutomationsPage';
import { PlaybooksBuilderPage } from '@/pages/dashboard/PlaybooksBuilderPage';
import { AIEmailCampaignsPage } from '@/pages/dashboard/AIEmailCampaignsPage';
import { UserDetailPage } from '@/pages/dashboard/UserDetailPage';
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage';
import FeatureGuide from '@/pages/dashboard/FeatureGuide';
import DashboardDocumentation from '@/pages/dashboard/DashboardDocumentation';
import { UploadedUsersPage } from '@/pages/dashboard/UploadedUsersPage';
import OnboardingForm from '@/pages/dashboard/OnboardingForm';
import FounderProfile from '@/pages/dashboard/FounderProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PrivateRoute from '@/components/auth/PrivateRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import BlogIndex from '@/pages/blog/BlogIndex';
import BlogPost from '@/pages/blog/BlogPost';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminBlogs from '@/pages/admin/AdminBlogs';
import AdminInbox from '@/pages/admin/AdminInbox';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
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
            
            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="csv-upload" element={<CSVUploadPage />} />
              <Route path="email-automation" element={<EmailAutomationPage />} />
              <Route path="recovered-users" element={<RecoveredUsersPage />} />
              <Route path="upgrade" element={<UpgradePage />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="playbooks" element={<PlaybooksBuilderPage />} />
              <Route path="ai-email-campaigns" element={<AIEmailCampaignsPage />} />
              <Route path="user/:userId" element={<UserDetailPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="guide" element={<FeatureGuide />} />
              <Route path="documentation" element={<DashboardDocumentation />} />
              <Route path="uploaded-users" element={<UploadedUsersPage />} />
            </Route>
            
            {/* Other protected routes */}
            <Route path="/users" element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            } />
            <Route path="/integration" element={
              <PrivateRoute>
                <IntegrationPage />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/onboarding" element={
              <PrivateRoute>
                <OnboardingForm />
              </PrivateRoute>
            } />
            <Route path="/founder-profile" element={
              <PrivateRoute>
                <FounderProfile />
              </PrivateRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="inbox" element={<AdminInbox />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="integrations" element={<AdminIntegrations />} />
            </Route>
            
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

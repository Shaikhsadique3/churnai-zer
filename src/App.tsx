
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';
import NotFound from './pages/NotFound';
import NotAuthorized from './pages/NotAuthorized';
import Documentation from './pages/Documentation';
import BlogIndex from './pages/blog/BlogIndex';
import BlogPost from './pages/blog/BlogPost';
import { CSVUploadPage } from './pages/dashboard/CSVUploadPage';
import { EmailAutomationPage } from './pages/dashboard/EmailAutomationPage';
import { AutomationsPage } from './pages/dashboard/AutomationsPage';
import { PlaybooksBuilderPage } from './pages/dashboard/PlaybooksBuilderPage';
import AIEmailCampaignsPage from './pages/dashboard/AIEmailCampaignsPage';
import { UploadedUsersPage } from './pages/dashboard/UploadedUsersPage';
import { RecoveredUsersPage } from './pages/dashboard/RecoveredUsersPage';
import { UserDetailPage } from './pages/dashboard/UserDetailPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import OnboardingForm from './pages/dashboard/OnboardingForm';
import FounderProfile from './pages/dashboard/FounderProfile';
import FeatureGuide from './pages/dashboard/FeatureGuide';
import DashboardDocumentation from './pages/dashboard/DashboardDocumentation';
import Integration from './pages/Integration';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminInbox from './pages/admin/AdminInbox';
import { AdminLayout } from './components/layout/AdminLayout';
import { MainLayout } from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { AnalyticsDashboard } from "@/pages/dashboard/AnalyticsDashboard";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";

const AdminLogin = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <p>Admin authentication coming soon</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing and auth pages */}
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/documentation" element={<Documentation />} />

        {/* Blog routes */}
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Protected dashboard routes - now using MainLayout */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardOverview /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><MainLayout><AnalyticsDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/csv-upload" element={<ProtectedRoute><MainLayout><CSVUploadPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/email-automation" element={<ProtectedRoute><MainLayout><EmailAutomationPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/automations" element={<ProtectedRoute><MainLayout><AutomationsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/playbooks" element={<ProtectedRoute><MainLayout><PlaybooksBuilderPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/campaigns" element={<ProtectedRoute><MainLayout><AIEmailCampaignsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/user-predictions" element={<ProtectedRoute><MainLayout><UploadedUsersPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/recovered-users" element={<ProtectedRoute><MainLayout><RecoveredUsersPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/user/:id" element={<ProtectedRoute><MainLayout><UserDetailPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/notifications" element={<ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/onboarding" element={<ProtectedRoute><MainLayout><OnboardingForm /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><MainLayout><FounderProfile /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/guide" element={<ProtectedRoute><MainLayout><FeatureGuide /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard/docs" element={<ProtectedRoute><MainLayout><DashboardDocumentation /></MainLayout></ProtectedRoute>} />

        {/* Integration route */}
        <Route path="/integration" element={<ProtectedRoute><MainLayout><Integration /></MainLayout></ProtectedRoute>} />
        
        {/* Users route - mapped to the same component as user-predictions */}
        <Route path="/users" element={<ProtectedRoute><MainLayout><UploadedUsersPage /></MainLayout></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/panel" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AdminLayout><AdminAnnouncements /></AdminLayout></AdminRoute>} />
        <Route path="/admin/blogs" element={<AdminRoute><AdminLayout><AdminBlogs /></AdminLayout></AdminRoute>} />
        <Route path="/admin/inbox" element={<AdminRoute><AdminLayout><AdminInbox /></AdminLayout></AdminRoute>} />

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

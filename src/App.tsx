import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Index } from './pages/Index';
import { Pricing } from './pages/Pricing';
import { Auth } from './pages/Auth';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { RefundPolicy } from './pages/RefundPolicy';
import { NotFound } from './pages/NotFound';
import { NotAuthorized } from './pages/NotAuthorized';
import { Documentation } from './pages/Documentation';
import { BlogIndex } from './pages/blog/BlogIndex';
import { BlogPost } from './pages/blog/BlogPost';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { CSVUploadPage } from './pages/dashboard/CSVUploadPage';
import { EmailAutomationPage } from './pages/dashboard/EmailAutomationPage';
import { AutomationsPage } from './pages/dashboard/AutomationsPage';
import { PlaybooksBuilderPage } from './pages/dashboard/PlaybooksBuilderPage';
import { AIEmailCampaignsPage } from './pages/dashboard/AIEmailCampaignsPage';
import { UploadedUsersPage } from './pages/dashboard/UploadedUsersPage';
import { RecoveredUsersPage } from './pages/dashboard/RecoveredUsersPage';
import { UserDetailPage } from './pages/dashboard/UserDetailPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { OnboardingForm } from './pages/dashboard/OnboardingForm';
import { FounderProfile } from './pages/dashboard/FounderProfile';
import { FeatureGuide } from './pages/dashboard/FeatureGuide';
import { DashboardDocumentation } from './pages/dashboard/DashboardDocumentation';
import { Integration } from './pages/Integration';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminBlogs } from './pages/admin/AdminBlogs';
import { AdminInbox } from './pages/admin/AdminInbox';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { AnalyticsDashboard } from "@/pages/dashboard/AnalyticsDashboard";

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

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardOverview /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/csv-upload" element={<ProtectedRoute><DashboardLayout><CSVUploadPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/email-automation" element={<ProtectedRoute><DashboardLayout><EmailAutomationPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/automations" element={<ProtectedRoute><DashboardLayout><AutomationsPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/playbooks" element={<ProtectedRoute><DashboardLayout><PlaybooksBuilderPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/campaigns" element={<ProtectedRoute><DashboardLayout><AIEmailCampaignsPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/user-predictions" element={<ProtectedRoute><DashboardLayout><UploadedUsersPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/recovered-users" element={<ProtectedRoute><DashboardLayout><RecoveredUsersPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/user/:id" element={<ProtectedRoute><DashboardLayout><UserDetailPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/notifications" element={<ProtectedRoute><DashboardLayout><NotificationsPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/onboarding" element={<ProtectedRoute><DashboardLayout><OnboardingForm /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><FounderProfile /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/guide" element={<ProtectedRoute><DashboardLayout><FeatureGuide /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard/docs" element={<ProtectedRoute><DashboardLayout><DashboardDocumentation /></DashboardLayout></ProtectedRoute>} />

        {/* Integration route */}
        <Route path="/integration" element={<ProtectedRoute><DashboardLayout><Integration /></DashboardLayout></ProtectedRoute>} />

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

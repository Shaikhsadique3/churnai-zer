
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { APP_CONFIG } from "./lib/config";
import DynamicHead from "./components/common/DynamicHead";
import WaitlistLanding from "./components/waitlist/WaitlistLanding";
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
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
// Blog pages
import BlogIndex from "./pages/blog/BlogIndex";
import BlogPost from "./pages/blog/BlogPost";
// Dashboard pages
import { UploadedUsersPage } from "./pages/dashboard/UploadedUsersPage";
import { RecoveredUsersPage } from "./pages/dashboard/RecoveredUsersPage";
import { NotificationsPage } from "./pages/dashboard/NotificationsPage";
import { EmailAutomationPage } from "./pages/EmailAutomationPage";
import { UserDetailPage } from "./pages/dashboard/UserDetailPage";
import FounderProfile from "./pages/dashboard/FounderProfile";
import OnboardingForm from "./pages/dashboard/OnboardingForm";
import DashboardDocumentation from "./pages/dashboard/DashboardDocumentation";
// Admin pages
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminInbox from "./pages/admin/AdminInbox";
import NotAuthorized from "./pages/NotAuthorized";
import AdminRoute from "./components/auth/AdminRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <DynamicHead />
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
              <Route path="/docs" element={<Documentation />} />
              <Route path="/onboarding" element={<OnboardingForm />} />
              {/* Blog routes */}
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                } 
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="inbox" element={<AdminInbox />} />
              </Route>
              <Route path="/not-authorized" element={<NotAuthorized />} />
              {/* Protected Main App Routes */}
              <Route 
                path="/integration" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Integration />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/integration/setup" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Integration />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              {/* Integration sub-routes - catch all integration paths */}
              <Route 
                path="/integration/*" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Integration />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <UploadedUsersPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
               <Route 
                 path="/automation" 
                 element={
                   <ProtectedRoute>
                     <DashboardLayout>
                       <EmailAutomationPage />
                     </DashboardLayout>
                   </ProtectedRoute>
                 } 
               />
               <Route 
                 path="/recovery" 
                 element={
                   <ProtectedRoute>
                     <DashboardLayout>
                       <RecoveredUsersPage />
                     </DashboardLayout>
                   </ProtectedRoute>
                 } 
               />
               <Route 
                 path="/notifications" 
                 element={
                   <ProtectedRoute>
                     <DashboardLayout>
                       <NotificationsPage />
                     </DashboardLayout>
                   </ProtectedRoute>
                 } 
               />
                <Route 
                  path="/users/:userId" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <UserDetailPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <FounderProfile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
               />
               <Route 
                 path="/dashboard/docs" 
                 element={
                   <ProtectedRoute>
                     <DashboardLayout>
                       <DashboardDocumentation />
                     </DashboardLayout>
                   </ProtectedRoute>
                 } 
               />
              {/* Redirect dashboard to integration for backwards compatibility */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Integration />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              {/* Redirect any dashboard subroutes to integration for backwards compatibility */}
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Integration />
                    </DashboardLayout>
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
};

export default App;

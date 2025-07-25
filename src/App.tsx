
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
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/layout/MainLayout";
// Blog pages
import BlogIndex from "./pages/blog/BlogIndex";
import BlogPost from "./pages/blog/BlogPost";
// Dashboard pages
import { UploadedUsersPage } from "./pages/dashboard/UploadedUsersPage";
import { UserDetailPage } from "./pages/dashboard/UserDetailPage";
// Admin pages
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
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
            {/* Blog routes */}
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* Protected Main App Routes */}
            <Route 
              path="/integration" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Integration />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/integration/setup" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Integration />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* Integration sub-routes - catch all integration paths */}
            <Route 
              path="/integration/*" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Integration />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UploadedUsersPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/:userId" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* Redirect dashboard to integration for backwards compatibility */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Integration />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            {/* Redirect any dashboard subroutes to integration for backwards compatibility */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Integration />
                  </MainLayout>
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


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
import { DashboardLayout } from "./components/layout/DashboardLayout";
// Dashboard pages
import { UploadedUsersPage } from "./pages/dashboard/UploadedUsersPage";
import { UserDetailPage } from "./pages/dashboard/UserDetailPage";
// Admin pages
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

// Multi-domain routing logic
const DomainRouter = () => {
  const domainType = APP_CONFIG.getDomainType();
  
  switch (domainType) {
    case 'main':
      // Main domain - Public landing page only
      return (
        <Routes>
          <Route path="/" element={<WaitlistLanding />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* Redirect all other routes to appropriate subdomains */}
          <Route path="/auth" element={<RedirectToDomain domain="auth" path="/auth" />} />
          <Route path="/dashboard/*" element={<RedirectToDomain domain="dashboard" path="/dashboard" />} />
          <Route path="/admin/*" element={<RedirectToDomain domain="admin" path="/admin" />} />
          <Route path="*" element={<WaitlistLanding />} />
        </Routes>
      );

    case 'auth':
      // Auth domain - Authentication flows only
      return (
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Auth />} />
        </Routes>
      );

    case 'dashboard':
      // Dashboard domain - Full user application
      return (
        <Routes>
          <Route path="/auth" element={<RedirectToDomain domain="auth" path="/auth" />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Integration />} />
            <Route path="users" element={<UploadedUsersPage />} />
            <Route path="users/:userId" element={<UserDetailPage />} />
          </Route>
          <Route path="*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
        </Routes>
      );

    case 'admin':
      // Admin domain - Administrative interface
      return (
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<AdminLogin />} />
        </Routes>
      );

    default:
      // Fallback domain (development) - Full application
      return (
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
          <Route path="/admin" element={<AdminPanel />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Integration />} />
            <Route path="users" element={<UploadedUsersPage />} />
            <Route path="users/:userId" element={<UserDetailPage />} />
            <Route path="*" element={<Integration />} />
          </Route>
          <Route 
            path="/integration" 
            element={
              <ProtectedRoute>
                <Integration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/integration/setup" 
            element={
              <ProtectedRoute>
                <Integration />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      );
  }
};

// Component to handle redirects between domains
const RedirectToDomain = ({ domain, path }: { domain: 'main' | 'auth' | 'dashboard' | 'admin'; path: string }) => {
  const currentPath = window.location.pathname;
  const fullPath = currentPath === '/' ? path : currentPath;
  
  // Redirect to the appropriate domain
  const targetUrl = APP_CONFIG.DOMAINS[domain.toUpperCase() as keyof typeof APP_CONFIG.DOMAINS];
  window.location.href = `${targetUrl}${fullPath}`;
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to {domain}...</p>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <DynamicHead />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DomainRouter />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

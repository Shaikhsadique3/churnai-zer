
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { APP_CONFIG } from "./lib/config";
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
// Simplified: Only Integration and User Data features
import { UploadedUsersPage } from "./pages/dashboard/UploadedUsersPage";
import { UserDetailPage } from "./pages/dashboard/UserDetailPage";

const queryClient = new QueryClient();

// Domain routing logic
const DomainRouter = () => {
  const isMainDomain = APP_CONFIG.isMainDomain();
  const isAuthDomain = APP_CONFIG.isAuthDomain();
  
  // If on main domain, show waitlist except for static pages
  if (isMainDomain && !isAuthDomain) {
    return (
      <Routes>
        <Route path="/" element={<WaitlistLanding />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        {/* Redirect protected routes to auth domain */}
        <Route path="/auth" element={<RedirectToAuth path="/auth" />} />
        <Route path="/dashboard/*" element={<RedirectToAuth path="/dashboard" />} />
        <Route path="/integration" element={<RedirectToAuth path="/integration" />} />
        <Route path="*" element={<WaitlistLanding />} />
      </Routes>
    );
  }
  
  // Full app routes for auth domain or development
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
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect dashboard index to integration */}
        <Route index element={<Integration />} />
        <Route path="users" element={<UploadedUsersPage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
        {/* Redirect all other dashboard routes to integration */}
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
};

// Component to handle redirects to auth domain
const RedirectToAuth = ({ path }: { path: string }) => {
  const currentPath = window.location.pathname;
  const fullPath = currentPath === '/' ? path : currentPath;
  
  // Redirect to auth domain
  window.location.href = `${APP_CONFIG.AUTH_DOMAIN}${fullPath}`;
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to app...</p>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
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


import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Enhanced route protection - check auth status on route change
  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      console.log('🔒 Protected route accessed without authentication, redirecting to /auth');
      // Force immediate redirect for better security
      window.location.href = '/auth';
    }
  }, [user, loading, location.pathname]);

  // Additional check for stale sessions
  useEffect(() => {
    const checkAuthStatus = () => {
      if (!loading && !user) {
        console.log('🔒 Auth status check failed, clearing any stale data and redirecting');
        // Clear any potential stale data
        localStorage.removeItem('supabase.auth.token');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        window.location.href = '/auth';
      }
    };

    // Check immediately and on focus
    checkAuthStatus();
    window.addEventListener('focus', checkAuthStatus);
    
    return () => {
      window.removeEventListener('focus', checkAuthStatus);
    };
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Store the attempted route for redirect after login
    const redirectTo = location.pathname !== '/auth' ? location.pathname : '/dashboard';
    return <Navigate to="/auth" state={{ from: redirectTo }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

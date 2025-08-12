
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check auth status on route change to prevent access to authenticated routes after logout
  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      console.log('🔒 Protected route accessed without authentication, redirecting to /auth');
    }
  }, [user, loading, location.pathname]);

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

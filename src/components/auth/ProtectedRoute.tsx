
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { hasValidSessionCookie, getCookie } from '@/lib/sessionUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set timeout for loading state to prevent infinite spinner
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('ProtectedRoute loading timeout reached');
        setLoadingTimeout(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Check for session cookie first (faster than waiting for Supabase)
  const hasSessionCookie = hasValidSessionCookie();

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no user and no session cookie, redirect to auth
  if (!user && !hasSessionCookie && !redirecting) {
    setRedirecting(true);
    console.log('No user or session cookie found, redirecting to auth');
    window.location.href = 'https://auth.churnaizer.com/auth';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If we have a session cookie but no user yet, show loading
  if (!user && hasSessionCookie && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If loading timeout reached and still no user, redirect
  if (loadingTimeout && !user && !redirecting) {
    setRedirecting(true);
    console.log('Loading timeout reached, redirecting to auth');
    window.location.href = 'https://auth.churnaizer.com/auth';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

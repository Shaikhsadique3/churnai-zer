
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: State check:', {
      user: !!user,
      loading,
      redirecting,
      domain: window.location.hostname,
      path: window.location.pathname
    });

    // Check localStorage for existing auth
    const storedToken = localStorage.getItem('churnaizer_auth_token');
    const storedUser = localStorage.getItem('churnaizer_auth_user');
    
    console.log('📱 ProtectedRoute: LocalStorage check:', {
      hasToken: !!storedToken,
      hasUser: !!storedUser
    });

    // Mark initial load as complete after a short delay
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
      console.log('✅ ProtectedRoute: Initial load marked complete');
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, loading, redirecting]);

  // If still in initial loading phase, show loading
  if (loading && !initialLoadComplete) {
    console.log('⏳ ProtectedRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check localStorage as fallback
  const storedToken = localStorage.getItem('churnaizer_auth_token');
  const hasStoredAuth = !!storedToken;

  console.log('🔍 ProtectedRoute: Final auth check:', {
    user: !!user,
    hasStoredAuth,
    shouldRedirect: !user && !hasStoredAuth && !redirecting
  });

  // If no user and no stored auth, redirect to auth
  if (!user && !hasStoredAuth && !redirecting && initialLoadComplete) {
    console.log('🚀 ProtectedRoute: Redirecting to auth domain');
    setRedirecting(true);
    
    // Use window.location.replace to avoid back button issues
    window.location.replace('https://auth.churnaizer.com/auth');
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If we have stored auth but no user yet, show loading
  if (!user && hasStoredAuth && !redirecting) {
    console.log('⏳ ProtectedRoute: Have stored auth, waiting for user...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('✅ ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;


import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { performSecureLogout, setupMultiTabLogoutListener } from '@/utils/authCleanup';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useSecureLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setSession } = useAuth();

  // Handle multi-tab logout coordination
  useEffect(() => {
    const cleanup = setupMultiTabLogoutListener(() => {
      // Force local state cleanup and redirect
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
    });

    return cleanup;
  }, [navigate, setUser, setSession]);

  const secureLogout = useCallback(async (showToast: boolean = true) => {
    try {
      // Show immediate loading state
      if (showToast) {
        toast({
          title: "Signing out...",
          description: "Clearing your session securely."
        });
      }

      // Perform the secure logout
      const result = await performSecureLogout();

      // Clear local auth state immediately regardless of backend result
      setUser(null);
      setSession(null);

      // Show appropriate feedback
      if (showToast) {
        if (result.success) {
          toast({
            title: "✅ Logged out successfully",
            description: "You have been securely signed out.",
            duration: 3000
          });
        } else {
          toast({
            title: "⚠️ Logout completed with warnings",
            description: "Local session cleared. Some remote cleanup may have failed.",
            duration: 4000
          });
        }
      }

      // Force redirect to login page
      window.location.href = '/auth';

    } catch (error) {
      console.error('Critical logout error:', error);
      
      // Emergency cleanup and redirect
      setUser(null);
      setSession(null);
      
      if (showToast) {
        toast({
          title: "❌ Logout error",
          description: "Emergency logout performed. Please clear your browser cache.",
          variant: "destructive",
          duration: 5000
        });
      }
      
      // Force redirect even on error
      window.location.href = '/auth';
    }
  }, [navigate, toast, setUser, setSession]);

  return { secureLogout };
};


import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { performSecureLogout, setupMultiTabLogoutListener } from '@/utils/authCleanup';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const useSecureLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setSession } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle multi-tab logout coordination
  useEffect(() => {
    const cleanup = setupMultiTabLogoutListener(() => {
      // Force local state cleanup and redirect
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
    });

    return cleanup;
  }, [setUser, setSession]);

  const secureLogout = useCallback(async (showToast: boolean = true) => {
    if (isLoggingOut) return; // Prevent duplicate logout calls
    
    try {
      setIsLoggingOut(true);
      
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

      // Show success message and redirect
      if (showToast) {
        if (result.success) {
          toast({
            title: "✅ Successfully logged out",
            description: "You have been securely signed out.",
            duration: 2000
          });
        } else {
          toast({
            title: "⚠️ Logout completed",
            description: "Local session cleared. Some remote cleanup may have failed.",
            duration: 2000
          });
        }
      }

      // Always redirect to auth page after logout
      setTimeout(() => {
        setIsLoggingOut(false);
        window.location.href = '/auth';
      }, showToast ? 1500 : 0);

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
          duration: 2000
        });
      }
      
      // Force redirect even on error
      setTimeout(() => {
        setIsLoggingOut(false);
        window.location.href = '/auth';
      }, showToast ? 1500 : 0);
    }
  }, [toast, setUser, setSession, isLoggingOut]);

  return { secureLogout, isLoggingOut };
};

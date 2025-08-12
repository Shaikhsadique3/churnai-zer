
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSecureLogout = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();

  const secureLogout = useCallback(async (showToast: boolean = true) => {
    try {
      // Show loading toast
      if (showToast) {
        toast({
          title: "Signing out...",
          description: "Clearing your session securely.",
          duration: 2000
        });
      }

      // Use the AuthContext signOut method
      await signOut();

      // Show success message
      if (showToast) {
        toast({
          title: "✅ Successfully logged out",
          description: "You have been securely signed out.",
          duration: 2000
        });
      }

    } catch (error) {
      console.error('Logout error:', error);
      
      if (showToast) {
        toast({
          title: "❌ Logout error",
          description: "Emergency logout performed. Redirecting...",
          variant: "destructive",
          duration: 2000
        });
      }
      
      // Force redirect even on error
      window.location.href = '/';
    }
  }, [toast, signOut]);

  return { secureLogout };
};

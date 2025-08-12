
import { supabase } from '@/integrations/supabase/client';

// Comprehensive auth state cleanup utility
export const cleanupAuthState = () => {
  try {
    // Clear all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith('supabase.auth.') || 
        key.includes('sb-') || 
        key.startsWith('churnaizer-') ||
        key === 'rememberMe'
      ) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (
        key.startsWith('supabase.auth.') || 
        key.includes('sb-') ||
        key.startsWith('churnaizer-')
      ) {
        sessionStorage.removeItem(key);
      }
    });

    console.log('✅ Auth state cleaned up successfully');
  } catch (error) {
    console.error('⚠️ Error during auth cleanup:', error);
  }
};

// Multi-tab logout coordination using localStorage events
export const triggerMultiTabLogout = () => {
  try {
    // Set a temporary logout flag that other tabs will detect
    localStorage.setItem('churnaizer-logout-trigger', Date.now().toString());
    // Remove it immediately (the event is what matters)
    localStorage.removeItem('churnaizer-logout-trigger');
  } catch (error) {
    console.error('⚠️ Error triggering multi-tab logout:', error);
  }
};

// Listen for logout events from other tabs
export const setupMultiTabLogoutListener = (onLogout: () => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'churnaizer-logout-trigger') {
      console.log('🔄 Logout detected from another tab');
      onLogout();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

// Secure logout function with comprehensive cleanup
export const performSecureLogout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Starting secure logout process...');

    // Step 1: Trigger multi-tab logout
    triggerMultiTabLogout();

    // Step 2: Clean up local storage immediately
    cleanupAuthState();

    // Step 3: Attempt backend session invalidation (non-blocking)
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ Backend session invalidated');
    } catch (backendError) {
      console.warn('⚠️ Backend logout failed, but continuing with local cleanup:', backendError);
      // Don't fail the entire logout process if backend fails
    }

    // Step 4: Clear any remaining memory references
    // Force garbage collection if available (development only)
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (gcError) {
        // Ignore GC errors
      }
    }

    console.log('✅ Secure logout completed successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error during secure logout:', error);
    
    // Even if logout fails, ensure local cleanup happened
    cleanupAuthState();
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown logout error'
    };
  }
};

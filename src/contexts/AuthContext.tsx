
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const isAuthenticated = !!session && !!user;

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          cleanupAuthState();
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setAuthInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          cleanupAuthState();
          setSession(null);
          setUser(null);
          setAuthInitialized(true);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          // Complete cleanup on sign out
          cleanupAuthState();
          setSession(null);
          setUser(null);
          
          // Only redirect if we're not already on a public route
          const currentPath = window.location.pathname;
          if (currentPath !== '/' && currentPath !== '/auth') {
            window.location.href = '/';
          }
        } else if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          
          // Only redirect to dashboard if we're on auth page
          const currentPath = window.location.pathname;
          if (currentPath === '/auth' || currentPath === '/') {
            window.location.href = '/dashboard';
          }
        } else if (session) {
          // Token refreshed or other auth events
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        if (!authInitialized) {
          setAuthInitialized(true);
          setLoading(false);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [authInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Starting signup process for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      console.log('Signup response:', { data, error });

      // If signup successful, trigger welcome and admin notification emails
      if (!error && data.user) {
        try {
          // Get the new session for the user
          const { data: { session } } = await supabase.auth.getSession();
          const authHeaders = session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`
          } : {};

          // Send welcome email using unified function
          await supabase.functions.invoke('send-auth-email', {
            headers: authHeaders,
            body: { 
              email: data.user.email,
              name: data.user.email?.split('@')[0],
              type: 'welcome'
            }
          });

          // Send admin notification
          await supabase.functions.invoke('send-admin-notification', {
            headers: authHeaders,
            body: {
              userEmail: data.user.email,
              userName: data.user.email?.split('@')[0],
              signupTime: data.user.created_at,
              referrer: document.referrer || 'Direct'
            }
          });

          console.log('Welcome and admin notification emails triggered');
        } catch (emailError) {
          console.error('Failed to send signup emails:', emailError);
          // Don't fail signup if emails fail
        }
      }
      
      return { error };
    } catch (err) {
      console.error('Network error during signup:', err);
      return { error: { message: 'Network error: Please check your internet connection and try again.' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🔄 Starting signOut...');
      setLoading(true);
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear local state
      setSession(null);
      setUser(null);
      
      console.log('✅ SignOut completed successfully');
      
      // Redirect to landing page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if signOut fails, clear local state and redirect
      cleanupAuthState();
      setSession(null);
      setUser(null);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Get current session (may be null for password reset)
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders = session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`
      } : {};

      // Use our unified auth email function
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        headers: authHeaders,
        body: { 
          email,
          type: 'reset'
        }
      });
      
      if (error) {
        console.error('Password reset function error:', error);
        return { error: { message: error.message } };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Password reset error:', err);
      return { error: { message: 'Network error: Please check your internet connection and try again.' } };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      return { error };
    } catch (err) {
      console.error('Password update error:', err);
      return { error: { message: 'Network error: Please check your internet connection and try again.' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    setUser,
    setSession,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

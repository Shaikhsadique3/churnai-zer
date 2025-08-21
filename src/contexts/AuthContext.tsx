
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
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

  const isAuthenticated = !!session && !!user;

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          cleanupAuthState();
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          cleanupAuthState();
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle redirects based on auth events
        const currentPath = window.location.pathname;
        
        if (event === 'SIGNED_OUT' || !session) {
          cleanupAuthState();
          // Only redirect if not already on public routes
          if (currentPath.startsWith('/dashboard') || currentPath === '/profile' || currentPath === '/users') {
            window.location.href = '/auth';
          }
        } else if (event === 'SIGNED_IN' && session) {
          // Only redirect if currently on auth pages
          if (currentPath === '/auth' || currentPath === '/') {
            window.location.href = '/dashboard';
          }
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        // Redirect will be handled by onAuthStateChange
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
      
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
          const { data: { session } } = await supabase.auth.getSession();
          const authHeaders = session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`
          } : {};

          // Send welcome email
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
        }

        // Redirect will be handled by onAuthStateChange
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
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
      console.log('Starting signOut...');
      setLoading(true);
      
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      setSession(null);
      setUser(null);
      
      console.log('SignOut completed successfully');
      window.location.href = '/';
      
    } catch (error) {
      console.error('Sign out error:', error);
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
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders = session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`
      } : {};

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
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Set loading timeout to prevent infinite spinner
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set cross-subdomain cookie for session sharing
        if (session?.access_token) {
          // Set secure cookie that works across subdomains
          document.cookie = `churnaizer_session=${session.access_token}; domain=.churnaizer.com; path=/; secure; samesite=none; max-age=86400`;
        } else {
          // Clear the session cookie
          document.cookie = `churnaizer_session=; domain=.churnaizer.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set cross-subdomain cookie for initial session
      if (session?.access_token) {
        document.cookie = `churnaizer_session=${session.access_token}; domain=.churnaizer.com; path=/; secure; samesite=none; max-age=86400`;
      }
      
      setLoading(false);
      clearTimeout(loadingTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://dashboard.churnaizer.com/',
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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://dashboard.churnaizer.com/'
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
    }
  };

  const signOut = async () => {
    try {
      // Clear cross-subdomain session cookie
      document.cookie = `churnaizer_session=; domain=.churnaizer.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      
      // Clear all auth-related data from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key === 'rememberMe' || key.includes('churnaizer')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force a clean state
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if signOut fails, clear local state and cookie
      document.cookie = `churnaizer_session=; domain=.churnaizer.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      setSession(null);
      setUser(null);
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
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ChurnaSDKProviderProps {
  children: React.ReactNode;
  apiKey: string;
}

export const ChurnaSDKProvider = ({ children, apiKey }: ChurnaSDKProviderProps) => {
  const { user } = useAuth();

  useEffect(() => {
    // Only load SDK once
    if (window.Churnaizer) return;

    const script = document.createElement('script');
    script.src = 'https://churnaizer.com/churnaizer-sdk.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Churnaizer SDK v1.0.0 loaded');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://churnaizer.com/churnaizer-sdk.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Auto-track user when they login
  useEffect(() => {
    if (!user || !window.Churnaizer || !apiKey) return;

    // Simple auto-tracking for logged-in users
    const userData = {
      user_id: user.id,
      customer_name: user.email?.split('@')[0] || 'Unknown',
      customer_email: user.email || '',
      days_since_signup: Math.floor((Date.now() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
      monthly_revenue: 0, // Would come from subscription data
      subscription_plan: 'Free',
      number_of_logins_last30days: 1,
      active_features_used: 1,
      support_tickets_opened: 0,
      last_payment_status: 'active',
      email_opens_last30days: 0,
      last_login_days_ago: 0,
      billing_issue_count: 0
    };

    window.Churnaizer.track(userData, apiKey, (result: any, error: any) => {
      if (error) {
        console.error('❌ Auto-track failed:', error);
        return;
      }
      console.log('✅ Auto-tracked user:', result);
    });
  }, [user, apiKey]);

  return <>{children}</>;
};

// Helper function for manual tracking
export const trackChurnPrediction = (userData: any, apiKey: string, callback?: (result: any, error: any) => void) => {
  if (!window.Churnaizer) {
    console.error('❌ Churnaizer SDK not loaded');
    return;
  }

  window.Churnaizer.track(userData, apiKey, callback);
};

// Global type declaration
declare global {
  interface Window {
    Churnaizer?: {
      track: (userData: any, apiKey: string, callback?: (result: any, error: any) => void) => void;
      trackBatch: (usersData: any[], apiKey: string, callback?: (results: any[], error: any) => void) => void;
      showBadge: (selector: string, result: any) => void;
      version: string;
      info: () => any;
    };
  }
}
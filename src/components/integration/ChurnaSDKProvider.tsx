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

  // Auto-track user when they login or perform high-value actions
  useEffect(() => {
    if (!user || !window.Churnaizer || !apiKey) return;

    // Only track if we have a valid user session with email and ID
    if (!user.id || !user.email) {
      console.warn('⚠️ Churnaizer: Skipping tracking - incomplete user session');
      return;
    }

    // Track real user data when they authenticate
    const userData = {
      user_id: user.id,
      customer_name: user.email?.split('@')[0] || 'Unknown',
      customer_email: user.email,
      days_since_signup: Math.floor((Date.now() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
      monthly_revenue: 0, // Would come from subscription/billing data
      subscription_plan: 'Free', // Would come from user profile or subscription table
      number_of_logins_last30days: 1, // Would come from analytics or activity logs
      active_features_used: 1, // Would track actual feature usage
      support_tickets_opened: 0, // Would come from support system
      last_payment_status: 'active', // Would come from billing system
      email_opens_last30days: 0, // Would come from email analytics
      last_login_days_ago: 0, // Current login
      billing_issue_count: 0 // Would come from billing system
    };

    console.log('🔁 Churnaizer: Auto-tracking authenticated user:', user.email);
    
    window.Churnaizer.track(userData, apiKey, (result: any, error: any) => {
      if (error) {
        console.error('❌ Auto-track failed:', error);
        return;
      }
      console.log('✅ Churn prediction for user:', user.email, '- Risk Level:', result?.risk_level, '- Score:', result?.churn_score);
    });
  }, [user, apiKey]);

  return <>{children}</>;
};

// Helper function for manual tracking in your app
export const trackChurnPrediction = (userData: any, apiKey: string, callback?: (result: any, error: any) => void) => {
  if (!window.Churnaizer) {
    console.error('❌ Churnaizer SDK not loaded');
    if (callback) callback(null, new Error('SDK not loaded'));
    return;
  }

  // Validate that we have a real user session before tracking
  if (!userData.user_id || !userData.customer_email) {
    console.warn('⚠️ Churnaizer: Skipping manual tracking - invalid user data');
    if (callback) callback(null, new Error('Invalid user data - user_id and customer_email required'));
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
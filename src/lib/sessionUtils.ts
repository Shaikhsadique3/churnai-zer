/**
 * Utility functions for managing cross-subdomain session cookies
 */

// Get cookie value by name
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Check if user has valid session cookie
export const hasValidSessionCookie = (): boolean => {
  const sessionCookie = getCookie('churnaizer_session');
  return Boolean(sessionCookie && sessionCookie.length > 0);
};

// Set cross-subdomain session cookie
export const setSessionCookie = (token: string): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `churnaizer_session=${token}; domain=.churnaizer.com; path=/; secure; samesite=none; max-age=86400`;
  }
};

// Clear cross-subdomain session cookie
export const clearSessionCookie = (): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `churnaizer_session=; domain=.churnaizer.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

// Validate session with Supabase
export const validateSessionWithSupabase = async (token: string): Promise<boolean> => {
  try {
    // Import supabase client inside function to avoid circular imports
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.auth.getUser(token);
    return !error && !!data.user;
  } catch {
    return false;
  }
};
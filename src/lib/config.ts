// App configuration for dual-domain setup
export const APP_CONFIG = {
  // Main domain for waitlist
  MAIN_DOMAIN: 'https://churnaizer.com',
  // Subdomain for full app
  AUTH_DOMAIN: 'https://auth.churnaizer.com',
  // Fallback for development
  FALLBACK_URL: 'https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app',
  
  // Check if we're on the main domain (waitlist)
  isMainDomain: () => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      return host === 'churnaizer.com' || host.includes('lovable.app');
    }
    return false;
  },
  
  // Check if we're on the auth subdomain (full app)
  isAuthDomain: () => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      return host === 'auth.churnaizer.com';
    }
    return false;
  },
  
  // Get the current appropriate URL
  getCurrentUrl: () => {
    if (typeof window !== 'undefined') {
      const currentHost = window.location.host;
      if (currentHost === 'churnaizer.com') {
        return APP_CONFIG.MAIN_DOMAIN;
      }
      if (currentHost === 'auth.churnaizer.com') {
        return APP_CONFIG.AUTH_DOMAIN;
      }
      if (currentHost.includes('lovable.app')) {
        return APP_CONFIG.FALLBACK_URL;
      }
    }
    return APP_CONFIG.FALLBACK_URL;
  },
  
  // Redirect to auth domain for protected routes
  redirectToAuth: (path: string = '') => {
    const authUrl = `${APP_CONFIG.AUTH_DOMAIN}${path}`;
    window.location.href = authUrl;
  }
};
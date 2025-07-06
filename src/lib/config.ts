// App configuration for consistent URL usage
export const APP_CONFIG = {
  // Use churnaizer.com as primary domain, fallback to Lovable subdomain
  APP_URL: 'https://churnaizer.com',
  FALLBACK_URL: 'https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app',
  
  // Get the current app URL (checks if we're on churnaizer.com or lovable subdomain)
  getCurrentUrl: () => {
    if (typeof window !== 'undefined') {
      const currentHost = window.location.host;
      if (currentHost.includes('churnaizer.com')) {
        return APP_CONFIG.APP_URL;
      }
      if (currentHost.includes('lovable.app')) {
        return APP_CONFIG.FALLBACK_URL;
      }
    }
    return APP_CONFIG.APP_URL; // Default to churnaizer.com
  }
};
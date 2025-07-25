// Multi-subdomain configuration for Churnaizer
export const APP_CONFIG = {
  // Domain configuration
  DOMAINS: {
    MAIN: 'https://churnaizer.com',           // Public landing page
    AUTH: 'https://auth.churnaizer.com',      // Authentication/signup
    DASHBOARD: 'https://dashboard.churnaizer.com', // User dashboard
    ADMIN: 'https://admin.churnaizer.com',    // Admin panel
    FALLBACK: 'https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app'
  },

  // Domain type detection
  getDomainType: () => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      
      if (host === 'churnaizer.com') return 'main';
      if (host === 'auth.churnaizer.com') return 'auth';
      if (host === 'dashboard.churnaizer.com') return 'dashboard';
      if (host === 'admin.churnaizer.com') return 'admin';
      if (host.includes('lovable.app')) return 'fallback';
    }
    return 'fallback';
  },

  // Domain checking functions
  isMainDomain: () => APP_CONFIG.getDomainType() === 'main',
  isAuthDomain: () => APP_CONFIG.getDomainType() === 'auth',
  isDashboardDomain: () => APP_CONFIG.getDomainType() === 'dashboard',
  isAdminDomain: () => APP_CONFIG.getDomainType() === 'admin',
  isFallbackDomain: () => APP_CONFIG.getDomainType() === 'fallback',

  // Get current domain URL
  getCurrentUrl: () => {
    const domainType = APP_CONFIG.getDomainType();
    switch (domainType) {
      case 'main': return APP_CONFIG.DOMAINS.MAIN;
      case 'auth': return APP_CONFIG.DOMAINS.AUTH;
      case 'dashboard': return APP_CONFIG.DOMAINS.DASHBOARD;
      case 'admin': return APP_CONFIG.DOMAINS.ADMIN;
      default: return APP_CONFIG.DOMAINS.FALLBACK;
    }
  },

  // Cross-domain navigation helpers
  redirectTo: (domain: 'main' | 'auth' | 'dashboard' | 'admin', path: string = '') => {
    const urls = {
      main: APP_CONFIG.DOMAINS.MAIN,
      auth: APP_CONFIG.DOMAINS.AUTH,
      dashboard: APP_CONFIG.DOMAINS.DASHBOARD,
      admin: APP_CONFIG.DOMAINS.ADMIN
    };
    window.location.href = `${urls[domain]}${path}`;
  },

  // Auth-specific redirects
  redirectToAuth: (path: string = '') => APP_CONFIG.redirectTo('auth', path),
  redirectToDashboard: (path: string = '') => APP_CONFIG.redirectTo('dashboard', path),
  redirectToMain: (path: string = '') => APP_CONFIG.redirectTo('main', path),
  redirectToAdmin: (path: string = '') => APP_CONFIG.redirectTo('admin', path),

  // SEO Configuration per domain
  getSEOConfig: () => {
    const domainType = APP_CONFIG.getDomainType();
    const baseConfig = {
      siteName: 'Churnaizer',
      twitterHandle: '@Churnaizer'
    };

    switch (domainType) {
      case 'main':
        return {
          ...baseConfig,
          title: 'Churnaizer - AI-Powered Churn Prediction',
          description: 'Predict & Prevent Customer Churn with AI - Tiger-sharp insights for SaaS businesses',
          ogImage: '/assets/og-main.png',
          favicon: '/assets/favicon-main.png'
        };
      case 'auth':
        return {
          ...baseConfig,
          title: 'Sign In - Churnaizer',
          description: 'Access your Churnaizer account to manage churn prediction and customer analytics',
          ogImage: '/assets/og-auth.png',
          favicon: '/assets/favicon-auth.png'
        };
      case 'dashboard':
        return {
          ...baseConfig,
          title: 'Dashboard - Churnaizer',
          description: 'Your customer churn analytics dashboard - AI insights and predictions',
          ogImage: '/assets/og-dashboard.png',
          favicon: '/assets/favicon-dashboard.png'
        };
      case 'admin':
        return {
          ...baseConfig,
          title: 'Admin Panel - Churnaizer',
          description: 'Administrative interface for Churnaizer platform management',
          ogImage: '/assets/og-admin.png',
          favicon: '/assets/favicon-admin.png'
        };
      default:
        return {
          ...baseConfig,
          title: 'Churnaizer - AI-Powered Churn Prediction',
          description: 'Predict & Prevent Customer Churn with AI - Tiger-sharp insights for SaaS businesses',
          ogImage: '/assets/og-main.png',
          favicon: '/assets/favicon-main.png'
        };
    }
  }
};
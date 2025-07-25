// Single domain configuration for Churnaizer
export const APP_CONFIG = {
  // Domain configuration - using single domain only
  DOMAINS: {
    MAIN: 'https://churnaizer.com',
    FALLBACK: 'https://id-preview--19bbb304-3471-4d58-96e0-3f17ce42bb31.lovable.app'
  },

  // Domain type detection (simplified)
  getDomainType: () => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      
      if (host === 'churnaizer.com') return 'main';
      if (host.includes('lovable.app')) return 'fallback';
    }
    return 'fallback';
  },

  // Domain checking functions (simplified)
  isMainDomain: () => APP_CONFIG.getDomainType() === 'main',
  isFallbackDomain: () => APP_CONFIG.getDomainType() === 'fallback',

  // Get current domain URL
  getCurrentUrl: () => {
    const domainType = APP_CONFIG.getDomainType();
    return domainType === 'main' ? APP_CONFIG.DOMAINS.MAIN : APP_CONFIG.DOMAINS.FALLBACK;
  },

  // SEO Configuration
  getSEOConfig: () => {
    return {
      siteName: 'Churnaizer',
      twitterHandle: '@Churnaizer',
      title: 'Churnaizer - AI-Powered Churn Prediction',
      description: 'Predict & Prevent Customer Churn with AI - Tiger-sharp insights for SaaS businesses',
      ogImage: '/assets/og-main.png',
      favicon: '/assets/favicon-main.png'
    };
  }
};
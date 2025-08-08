import { useEffect } from 'react';
import { APP_CONFIG } from '@/lib/config';

interface DynamicHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  favicon?: string;
}

export const DynamicHead = ({ title, description, ogImage, favicon }: DynamicHeadProps) => {
  useEffect(() => {
    const seoConfig = APP_CONFIG.getSEOConfig();
    
    // Update document title
    const finalTitle = title || seoConfig.title;
    document.title = finalTitle;
    
    // Update meta description
    const finalDescription = description || seoConfig.description;
    updateMetaTag('name', 'description', finalDescription);
    
    // Add SEO keywords
    updateMetaTag('name', 'keywords', 'SaaS Churn Prediction, AI Churn Detection, Churn Prevention Tool, Customer Retention AI, SDK for SaaS analytics');
    
    // Add robots meta tag
    updateMetaTag('name', 'robots', 'index, follow');
    
    // Update OG tags
    const finalOgImage = ogImage || seoConfig.ogImage;
    updateMetaTag('property', 'og:title', finalTitle);
    updateMetaTag('property', 'og:description', finalDescription);
    updateMetaTag('property', 'og:image', finalOgImage);
    updateMetaTag('property', 'og:url', window.location.href);
    updateMetaTag('property', 'og:site_name', seoConfig.siteName);
    updateMetaTag('property', 'og:type', 'website');
    
    // Update Twitter cards
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:site', seoConfig.twitterHandle);
    updateMetaTag('name', 'twitter:title', finalTitle);
    updateMetaTag('name', 'twitter:description', finalDescription);
    updateMetaTag('name', 'twitter:image', finalOgImage);
    
    // Update favicon - use existing favicon.ico as fallback
    const finalFavicon = favicon || '/favicon.ico';
    updateFavicon(finalFavicon);
    
    // Update canonical URL
    updateCanonicalUrl();
    
  }, [title, description, ogImage, favicon]);
  
  return null; // This component doesn't render anything
};

// Helper function to update meta tags
const updateMetaTag = (attribute: string, value: string, content: string) => {
  let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

// Helper function to update favicon
const updateFavicon = (href: string) => {
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  
  link.href = href;
  link.type = href.endsWith('.png') ? 'image/png' : 'image/x-icon';
};

// Helper function to update canonical URL
const updateCanonicalUrl = () => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  canonical.href = window.location.href;
};

export default DynamicHead;

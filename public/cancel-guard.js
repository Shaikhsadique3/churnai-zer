/**
 * Churnaizer Cancel Guard Loader
 * Lightweight script for cancel protection
 */

(function(window, document) {
  'use strict';

  // Configuration
  const CONFIG = {
    CDN_BASE: 'https://cdn.churnaizer.com',
    API_BASE: 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1',
    VERSION: '1.0.0'
  };

  // State management
  let initialized = false;
  let config = {
    apiKey: null,
    selector: null,
    autoTrack: true,
    debug: false,
    fallback: null,
    userData: {},
    context: {}
  };

  let modalLoaded = false;
  let loadingPromise = null;

  // Utility functions
  function log(...args) {
    if (config.debug) {
      console.log('[Churnaizer]', ...args);
    }
  }

  function error(...args) {
    console.error('[Churnaizer]', ...args);
  }

  // Load modal script dynamically
  function loadModal() {
    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise((resolve, reject) => {
      if (window.ChurnaizerModal) {
        modalLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `${CONFIG.CDN_BASE}/widget/modal.js`;
      script.async = true;
      
      script.onload = () => {
        modalLoaded = true;
        log('Modal script loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        error('Failed to load modal script');
        reject(new Error('Failed to load modal script'));
      };
      
      document.head.appendChild(script);
    });

    return loadingPromise;
  }

  // Generate session ID
  function generateSessionId() {
    return 'cg_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
  }

  // Get minimal user context
  function getMinimalContext() {
    return {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 200), // Truncated for privacy
      ...config.context
    };
  }

  // Handle cancel event
  async function handleCancelEvent(event, element) {
    try {
      log('Cancel event triggered on:', element);

      // Prevent default behavior
      event.preventDefault();
      event.stopPropagation();

      // Track the cancel attempt
      await trackEvent('cancel_attempted', {
        element_type: element.tagName.toLowerCase(),
        element_class: element.className,
        element_text: element.textContent?.trim().substring(0, 100)
      });

      // Load modal if not already loaded
      if (!modalLoaded) {
        log('Loading modal script...');
        await loadModal();
      }

      // Show modal with user data
      if (window.ChurnaizerModal) {
        await window.ChurnaizerModal.show(
          config.apiKey,
          {
            id: config.userData.id || 'anonymous',
            mrr: config.userData.mrr || 0,
            plan: config.userData.plan || 'unknown',
            tenure_days: config.userData.tenure_days || 0,
            last_login_days: config.userData.last_login_days || 0,
            ...config.userData
          },
          getMinimalContext()
        );
      } else {
        throw new Error('Modal failed to load');
      }

    } catch (err) {
      error('Error handling cancel event:', err);
      
      // Fallback behavior
      if (config.fallback && typeof config.fallback === 'function') {
        log('Executing fallback function');
        config.fallback(event, element, err);
      } else {
        // Default fallback - allow the original action
        log('No fallback configured, allowing original action');
        if (element.href) {
          window.location.href = element.href;
        } else if (element.onclick) {
          element.onclick();
        }
      }
    }
  }

  // Track custom events
  async function trackEvent(eventType, eventData = {}) {
    if (!config.apiKey) {
      log('Cannot track event: No API key configured');
      return;
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE}/cancel-guard-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey
        },
        body: JSON.stringify({
          session_id: generateSessionId(),
          event_type: eventType,
          event_data: {
            ...eventData,
            context: getMinimalContext()
          },
          customer_id: config.userData.id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      log('Event tracked:', eventType, result);
      return result;

    } catch (err) {
      error('Failed to track event:', eventType, err);
    }
  }

  // Attach event listeners to elements
  function attachEventListeners() {
    if (!config.selector) {
      log('No selector configured, skipping event attachment');
      return;
    }

    // Handle both string selectors and arrays
    const selectors = Array.isArray(config.selector) ? config.selector : [config.selector];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      log(`Found ${elements.length} elements for selector: ${selector}`);

      elements.forEach(element => {
        // Skip if already attached
        if (element.dataset.churnaizerAttached) return;
        
        element.dataset.churnaizerAttached = 'true';
        element.addEventListener('click', (event) => {
          handleCancelEvent(event, element);
        });

        log('Attached cancel guard to:', element);
      });
    });
  }

  // Observer for dynamically added elements
  function setupMutationObserver() {
    if (!config.selector || !config.autoTrack) return;

    const observer = new MutationObserver(() => {
      attachEventListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    log('Mutation observer set up for dynamic elements');
  }

  // Main Churnaizer object
  window.Churnaizer = {
    // Initialize the cancel guard
    init(options = {}) {
      if (initialized) {
        log('Already initialized, updating configuration');
      }

      // Merge configuration
      config = {
        ...config,
        ...options
      };

      if (!config.apiKey) {
        error('API key is required for initialization');
        return false;
      }

      log('Initializing with config:', { ...config, apiKey: '***' });

      // Attach to existing elements
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          attachEventListeners();
          setupMutationObserver();
        });
      } else {
        attachEventListeners();
        setupMutationObserver();
      }

      initialized = true;
      log('Churnaizer Cancel Guard initialized');
      return true;
    },

    // Track custom events
    track(eventType, properties = {}) {
      return trackEvent(eventType, properties);
    },

    // Update user data
    setUser(userData) {
      config.userData = { ...config.userData, ...userData };
      log('User data updated:', config.userData);
    },

    // Update context
    setContext(context) {
      config.context = { ...config.context, ...context };
      log('Context updated:', config.context);
    },

    // Manual trigger
    async trigger(customUserData = null, customContext = {}) {
      try {
        if (!modalLoaded) {
          await loadModal();
        }

        if (window.ChurnaizerModal) {
          await window.ChurnaizerModal.show(
            config.apiKey,
            customUserData || config.userData,
            { ...getMinimalContext(), ...customContext }
          );
        }
      } catch (err) {
        error('Failed to trigger modal:', err);
      }
    },

    // Configuration getters/setters
    getConfig() {
      return { ...config, apiKey: config.apiKey ? '***' : null };
    },

    isInitialized() {
      return initialized;
    },

    // Version info
    version: CONFIG.VERSION
  };

  // Auto-initialize if configuration is provided
  if (window.ChurnaizerConfig) {
    window.Churnaizer.init(window.ChurnaizerConfig);
  }

  // SDK status for debugging
  window.__CHURNAIZER_STATUS__ = {
    loaded: true,
    version: CONFIG.VERSION,
    initialized: () => initialized,
    config: () => window.Churnaizer.getConfig()
  };

  log('Churnaizer Cancel Guard loader ready');

})(window, document);
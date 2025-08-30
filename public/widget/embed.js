/**
 * Churnaizer Cancel Guard Embed Script
 * Easy integration script for websites
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    CDN_BASE: 'https://cdn.churnaizer.com'
  };

  // Check if already loaded
  if (window.ChurnaizerGuard) {
    console.warn('Churnaizer Cancel Guard already loaded');
    return;
  }

  // Loading state
  let isLoaded = false;
  let loadPromise = null;

  // Load modal script
  function loadModalScript() {
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      // Check if modal is already loaded
      if (window.ChurnaizerModal) {
        isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `${CONFIG.CDN_BASE}/widget/modal.js`;
      script.async = true;
      script.onload = () => {
        isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Churnaizer modal script'));
      };
      
      document.head.appendChild(script);
    });

    return loadPromise;
  }

  // URL monitoring for cancel detection
  let currentUrl = window.location.href;
  let urlCheckInterval = null;

  // Check for cancel-related URLs
  function isCancelUrl(url) {
    const cancelPatterns = [
      /\/cancel/i,
      /\/unsubscribe/i,
      /\/billing.*cancel/i,
      /\/account.*cancel/i,
      /\/subscription.*cancel/i,
      /\?.*cancel/i,
      /\#.*cancel/i
    ];
    
    return cancelPatterns.some(pattern => pattern.test(url));
  }

  // Monitor URL changes
  function startUrlMonitoring(config) {
    if (urlCheckInterval) return;

    urlCheckInterval = setInterval(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        
        if (config.autoTrigger && isCancelUrl(newUrl)) {
          ChurnaizerGuard.trigger();
        }
      }
    }, config.checkInterval || 1000);
  }

  // Stop URL monitoring
  function stopUrlMonitoring() {
    if (urlCheckInterval) {
      clearInterval(urlCheckInterval);
      urlCheckInterval = null;
    }
  }

  // DOM element monitoring
  function monitorCancelElements(config) {
    if (!config.cancelSelectors) return;

    const observer = new MutationObserver(() => {
      config.cancelSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!element.dataset.churnaizerAttached) {
            element.dataset.churnaizerAttached = 'true';
            element.addEventListener('click', (e) => {
              if (config.interceptCancel) {
                e.preventDefault();
                e.stopPropagation();
                ChurnaizerGuard.trigger();
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial scan
    setTimeout(() => {
      config.cancelSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!element.dataset.churnaizerAttached) {
            element.dataset.churnaizerAttached = 'true';
            element.addEventListener('click', (e) => {
              if (config.interceptCancel) {
                e.preventDefault();
                e.stopPropagation();
                ChurnaizerGuard.trigger();
              }
            });
          }
        });
      });
    }, 100);
  }

  // Main Cancel Guard object
  window.ChurnaizerGuard = {
    // Configuration
    config: {
      apiKey: null,
      user: null,
      context: {},
      autoTrigger: false,
      interceptCancel: false,
      checkInterval: 1000,
      cancelSelectors: [
        '[href*="cancel"]',
        '[href*="unsubscribe"]',
        'button[class*="cancel"]',
        'a[class*="cancel"]',
        '.cancel-subscription',
        '.unsubscribe-btn'
      ],
      debug: false
    },

    // Initialize with configuration
    init(userConfig = {}) {
      // Merge configuration
      this.config = { ...this.config, ...userConfig };

      if (this.config.debug) {
        console.log('Churnaizer Cancel Guard initialized:', this.config);
      }

      // Validate required config
      if (!this.config.apiKey) {
        console.error('Churnaizer Cancel Guard: API key is required');
        return;
      }

      // Start monitoring if auto-trigger is enabled
      if (this.config.autoTrigger) {
        startUrlMonitoring(this.config);
      }

      // Monitor cancel elements
      if (this.config.cancelSelectors && this.config.cancelSelectors.length > 0) {
        monitorCancelElements(this.config);
      }

      // Trigger on initial load if on cancel page
      if (this.config.autoTrigger && isCancelUrl(window.location.href)) {
        setTimeout(() => this.trigger(), 500);
      }
    },

    // Manually trigger the cancel guard
    async trigger(userData = null, context = {}) {
      try {
        if (this.config.debug) {
          console.log('Churnaizer Cancel Guard triggered');
        }

        // Load modal script if not loaded
        if (!isLoaded) {
          await loadModalScript();
        }

        // Use provided user data or config user data
        const user = userData || this.config.user;
        if (!user) {
          console.error('Churnaizer Cancel Guard: User data is required');
          return;
        }

        // Merge context
        const finalContext = { ...this.config.context, ...context };

        // Show modal
        await window.ChurnaizerModal.show(this.config.apiKey, user, finalContext);

      } catch (error) {
        console.error('Churnaizer Cancel Guard error:', error);
      }
    },

    // Update user data
    setUser(userData) {
      this.config.user = userData;
      if (this.config.debug) {
        console.log('Churnaizer user data updated:', userData);
      }
    },

    // Update context
    setContext(context) {
      this.config.context = { ...this.config.context, ...context };
      if (this.config.debug) {
        console.log('Churnaizer context updated:', this.config.context);
      }
    },

    // Enable/disable auto-trigger
    setAutoTrigger(enabled) {
      this.config.autoTrigger = enabled;
      
      if (enabled) {
        startUrlMonitoring(this.config);
      } else {
        stopUrlMonitoring();
      }
    },

    // Destroy instance
    destroy() {
      stopUrlMonitoring();
      if (this.config.debug) {
        console.log('Churnaizer Cancel Guard destroyed');
      }
    }
  };

  // Auto-init if config is available
  if (window.ChurnaizerConfig) {
    ChurnaizerGuard.init(window.ChurnaizerConfig);
  }

  // SDK status for testing
  window.__CHURNAIZER_GUARD_STATUS__ = {
    loaded: true,
    version: '1.0.0',
    timestamp: Date.now(),
    config: () => ChurnaizerGuard.config
  };

})();
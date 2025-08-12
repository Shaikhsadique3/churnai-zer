
/**
 * Churnaizer SDK - JavaScript Library for User Retention & Churn Prediction
 * Version: 1.0.2 - Production-Ready with Fixed API Key Authentication
 * 
 * This SDK helps SaaS founders track user behavior and predict churn risk.
 * Supports auto-integration verification with proper API key handling.
 * 
 * Usage:
 * <script src="https://churnaizer.com/churnaizer-sdk.js"></script>
 * <script>
 *   window.__CHURNAIZER_API_KEY__ = "YOUR_API_KEY_HERE";
 *   
 *   Churnaizer.track({
 *     user_id: "u123",
 *     customer_email: "user@example.com",
 *     subscription_plan: "Pro",
 *     number_of_logins_last30days: 14,
 *     // ... other user data
 *   }, window.__CHURNAIZER_API_KEY__, function(result, error) {
 *     if (error) {
 *       console.error("Churn prediction failed:", error);
 *       return;
 *     }
 *     console.log("Churn prediction:", result);
 *   });
 * </script>
 */

(function() {
  'use strict';

  const SDK_VERSION = '1.0.2';
  const API_BASE_URL = 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1';
  
  // Global SDK state
  let integrationCheckPerformed = false;
  let integrationCheckInProgress = false;
  
  // Debug configuration
  function isDebugEnabled() {
    return window.Churnaizer?.debug === true || window.ChurnaizerConfig?.debug !== false;
  }

  function log(...args) {
    if (isDebugEnabled()) {
      console.log('[Churnaizer SDK]', ...args);
    }
  }

  function logError(...args) {
    console.error('[Churnaizer SDK Error]', ...args);
  }

  function logSuccess(...args) {
    console.log('[Churnaizer SDK ✅]', ...args);
  }

  function logWarning(...args) {
    console.warn('[Churnaizer SDK ⚠️]', ...args);
  }

  // Enhanced Auto Integration Check with retry logic
  function performAutoIntegrationCheck() {
    // Prevent duplicate checks
    if (integrationCheckPerformed || integrationCheckInProgress) {
      log('Integration check already performed or in progress, skipping');
      return;
    }

    integrationCheckInProgress = true;

    // Don't run check on localhost or development environments
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('127.0.0.1') ||
        window.location.hostname.includes('localhost')) {
      log('Skipping integration check on localhost/development environment');
      integrationCheckInProgress = false;
      return;
    }

    // Wait for API key with retry logic
    let attempts = 0;
    const maxAttempts = 25; // 5 seconds with 200ms intervals
    
    const checkForApiKey = () => {
      attempts++;
      const apiKey = window.__CHURNAIZER_API_KEY__;
      
      if (!apiKey) {
        if (attempts < maxAttempts) {
          setTimeout(checkForApiKey, 200);
          return;
        }
        logWarning('API key not found after 5 seconds. Set window.__CHURNAIZER_API_KEY__ for integration verification.');
        integrationCheckInProgress = false;
        return;
      }

      // Generate unique trace ID for this check
      const traceId = crypto?.randomUUID?.() || `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const requestData = {
        test: true,
        website: window.location.hostname,
        user_id: window.__CHURNAIZER_USER_ID__ || 'auto_check_' + Date.now(),
        trace_id: traceId
      };

      log('Starting integration check with API key:', apiKey.substring(0, 6) + '...');
      log('Request data:', requestData);

      // Perform integration check with proper headers
      performIntegrationRequest(requestData, apiKey, traceId);
    };

    checkForApiKey();
  }

  function performIntegrationRequest(requestData, apiKey, traceId) {
    fetch(`${API_BASE_URL}/sdk-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(), // Use x-api-key instead of Authorization
        'x-sdk-version': SDK_VERSION,
        'x-trace-id': traceId
      },
      body: JSON.stringify(requestData)
    })
    .then(response => {
      log('Response status:', response.status);
      return response.json().then(data => ({ status: response.status, data }));
    })
    .then(({ status, data }) => {
      integrationCheckPerformed = true;
      integrationCheckInProgress = false;
      
      if (status === 200 && data && data.status === 'ok') {
        logSuccess(`Integration confirmed for ${window.location.hostname}`);
        log('Integration details:', data);
        
        // Store successful check status
        try {
          localStorage.setItem('churnaizer_integration_status', JSON.stringify({
            status: 'success',
            timestamp: new Date().toISOString(),
            trace_id: traceId,
            website: window.location.hostname
          }));
        } catch (e) {
          // localStorage might be disabled
          log('Could not store integration status in localStorage');
        }
      } else {
        logWarning('Integration check failed:', data);
        logError('Status:', status, 'Response:', data);
        
        // Store failed check status
        try {
          localStorage.setItem('churnaizer_integration_status', JSON.stringify({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: data.message || 'Unknown error',
            code: data.code || status,
            trace_id: traceId
          }));
        } catch (e) {
          // localStorage might be disabled
        }
      }
    })
    .catch(error => {
      integrationCheckPerformed = true;
      integrationCheckInProgress = false;
      
      logError('Integration check network error:', error);
      
      // Store network error status
      try {
        localStorage.setItem('churnaizer_integration_status', JSON.stringify({
          status: 'network_error',
          timestamp: new Date().toISOString(),
          error: error.message,
          trace_id: traceId
        }));
      } catch (e) {
        // localStorage might be disabled
      }
    });
  }

  // Main Churnaizer SDK Object
  window.Churnaizer = {
    version: SDK_VERSION,
    debug: false, // Can be set to true for verbose logging
    
    // Display SDK info
    info: function() {
      console.log(`Churnaizer SDK v${SDK_VERSION}`);
      console.log('Documentation: https://docs.churnaizer.com');
      console.log('Support: https://churnaizer.com/contact');
    },

    // Get integration status from localStorage
    getIntegrationStatus: function() {
      try {
        const status = localStorage.getItem('churnaizer_integration_status');
        return status ? JSON.parse(status) : null;
      } catch (e) {
        return null;
      }
    },

    // Manual integration check
    checkIntegration: function(callback) {
      const apiKey = window.__CHURNAIZER_API_KEY__;
      
      if (!apiKey) {
        const error = 'API key not found. Set window.__CHURNAIZER_API_KEY__';
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      const traceId = crypto?.randomUUID?.() || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const requestData = {
        test: true,
        website: window.location.hostname,
        user_id: window.__CHURNAIZER_USER_ID__ || 'manual_check_' + Date.now(),
        trace_id: traceId
      };

      log('Manual integration check with API key:', apiKey.substring(0, 6) + '...');

      fetch(`${API_BASE_URL}/sdk-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'x-sdk-version': SDK_VERSION,
          'x-trace-id': traceId
        },
        body: JSON.stringify(requestData)
      })
      .then(response => response.json().then(data => ({ status: response.status, data })))
      .then(({ status, data }) => {
        if (callback) {
          if (status === 200) {
            callback(data, null);
          } else {
            callback(null, data.message || 'Integration check failed');
          }
        }
      })
      .catch(error => {
        if (callback) callback(null, error.message);
      });
    },

    // Main tracking function with proper API key headers
    track: function(userData, apiKey, callback) {
      // Validate required parameters
      if (!userData || !apiKey) {
        const error = 'Missing required parameters: userData and apiKey are required';
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      // Validate required user fields
      const requiredFields = ['user_id', 'email'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        const error = `Missing required user fields: ${missingFields.join(', ')}`;
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      log('Tracking user data for:', userData.user_id);

      // Generate unique trace session ID
      const traceId = userData.trace_id || (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

      // Prepare tracking data
      const trackingData = {
        user_id: userData.user_id,
        email: userData.email || userData.customer_email,
        customer_name: userData.customer_name || userData.customer_email?.split('@')[0] || 'Unknown',
        customer_email: userData.customer_email,
        days_since_signup: userData.days_since_signup || 0,
        monthly_revenue: userData.monthly_revenue || 0,
        subscription_plan: userData.subscription_plan || 'Free',
        number_of_logins_last30days: userData.number_of_logins_last30days || 1,
        active_features_used: userData.active_features_used || 1,
        support_tickets_opened: userData.support_tickets_opened || 0,
        last_payment_status: userData.last_payment_status || 'active',
        email_opens_last30days: userData.email_opens_last30days || 0,
        last_login_days_ago: userData.last_login_days_ago || 0,
        billing_issue_count: userData.billing_issue_count || 0,
        trace_id: traceId,
        timestamp: new Date().toISOString(),
        session_id: this._generateSessionId(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        sdk_version: SDK_VERSION
      };

      // Send tracking request
      this._sendTrackingRequest(trackingData, apiKey, callback);
    },

    // Test function for integration testing
    testTrackingIntegration: function(apiKey, traceId, callback) {
      log('Running SDK integration test with trace ID:', traceId);

      const testUserData = {
        user_id: "sdk_test_user_" + Date.now(),
        email: "sdk_test@example.com",
        customer_name: "SDK Test User",
        customer_email: "sdk_test@example.com",
        days_since_signup: 1,
        monthly_revenue: 0,
        subscription_plan: "Free",
        number_of_logins_last30days: 1,
        active_features_used: 1,
        support_tickets_opened: 0,
        last_payment_status: "active",
        email_opens_last30days: 0,
        last_login_days_ago: 0,
        billing_issue_count: 0,
        trace_id: traceId,
        timestamp: new Date().toISOString(),
        session_id: this._generateSessionId(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        sdk_version: SDK_VERSION
      };

      this._sendTrackingRequest(testUserData, apiKey, callback);
    },

    // Event tracking function
    trackEvent: function(eventData, apiKey, callback) {
      if (!eventData || !apiKey) {
        const error = 'Missing required parameters: eventData and apiKey are required';
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      const requiredFields = ['event', 'user_id', 'email'];
      const missingFields = requiredFields.filter(field => !eventData[field]);
      
      if (missingFields.length > 0) {
        const error = `Missing required event fields: ${missingFields.join(', ')}`;
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      const traceId = eventData.trace_id || (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      
      log('Tracking event:', eventData.event, 'for user:', eventData.user_id);

      const trackingEventData = {
        event: eventData.event,
        user_id: eventData.user_id,
        email: eventData.email,
        customer_name: eventData.customer_name || eventData.email?.split('@')[0] || 'Unknown',
        monthly_revenue: eventData.monthly_revenue || 0,
        trace_id: traceId,
        timestamp: new Date().toISOString(),
        session_id: this._generateSessionId(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        sdk_version: SDK_VERSION
      };

      this._sendEventRequest(trackingEventData, apiKey, callback);
    },

    // Private methods
    _generateSessionId: function() {
      return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    _sendTrackingRequest: function(data, apiKey, callback) {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${API_BASE_URL}/sdk-track`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-api-key', apiKey.trim()); // Use x-api-key instead of Authorization
      xhr.setRequestHeader('x-sdk-version', SDK_VERSION);
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            if (xhr.status === 200 || xhr.status === 201) {
              log('Tracking successful:', response);
              const result = response.results?.[0] || response.result || response;
              if (callback) callback(result, null);
            } else {
              logError('Tracking failed:', response);
              if (callback) callback(null, response.error || response.message || 'Tracking failed');
            }
          } catch (e) {
            logError('Invalid response format:', e);
            if (callback) callback(null, 'Invalid response format');
          }
        }
      };

      xhr.onerror = function() {
        logError('Network error during tracking request');
        if (callback) callback(null, 'Network error');
      };

      xhr.send(JSON.stringify(data));
    },

    _sendEventRequest: function(eventData, apiKey, callback) {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${API_BASE_URL}/sdk-event`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-api-key', apiKey.trim()); // Use x-api-key instead of Authorization
      xhr.setRequestHeader('x-sdk-version', SDK_VERSION);
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            if (xhr.status === 200 || xhr.status === 201) {
              log('Event tracking successful:', response);
              if (callback) callback(response, null);
            } else {
              logError('Event tracking failed:', response);
              if (callback) callback(null, response.error || response.message || 'Event tracking failed');
            }
          } catch (e) {
            logError('Invalid event response format:', e);
            if (callback) callback(null, 'Invalid response format');
          }
        }
      };

      xhr.onerror = function() {
        logError('Network error during event tracking request');
        if (callback) callback(null, 'Network error');
      };

      xhr.send(JSON.stringify(eventData));
    }
  };

  // SDK status object for integration verification
  window.__CHURNAIZER_SDK_STATUS__ = {
    installed: true,
    apiKey: window.__CHURNAIZER_API_KEY__ || 'not-set',
    domain: window.location.hostname,
    version: SDK_VERSION,
    autoCheckEnabled: true
  };

  // Listen for SDK status requests from integration tests
  window.addEventListener("message", function(event) {
    if (event.data && event.data.type === 'CHURNAIZER_SDK_TEST') {
      const apiKey = event.data.apiKey || window.__CHURNAIZER_API_KEY__;
      const traceId = event.data.traceId;
      
      if (!apiKey) {
        try {
          event.source?.postMessage({
            type: 'CHURNAIZER_SDK_TEST_RESULT',
            result: {
              success: false,
              error: 'API key not configured',
              domain: window.location.hostname
            }
          }, event.origin);
        } catch (error) {
          log('PostMessage failed:', error.message);
        }
        return;
      }

      // Perform test tracking
      window.Churnaizer.testTrackingIntegration(apiKey, traceId, function(result, error) {
        try {
          event.source?.postMessage({
            type: 'CHURNAIZER_SDK_TEST_RESULT',
            result: {
              success: !error,
              error: error,
              domain: window.location.hostname,
              apiKeyUsed: !!apiKey,
              churnScore: result?.churn_score,
              riskLevel: result?.risk_level,
              churnReason: result?.churn_reason,
              emailSent: result?.email_sent,
              traceId: traceId
            }
          }, event.origin);
        } catch (postError) {
          log('PostMessage failed:', postError.message);
        }
      });
    }

    if (event.data && event.data.action === "GET_CHURNAIZER_SDK_STATUS") {
      try {
        event.source?.postMessage({
          __CHURNAIZER_SDK_STATUS__: window.__CHURNAIZER_SDK_STATUS__
        }, event.origin);
      } catch (error) {
        log('PostMessage failed:', error.message);
      }
    }
  });

  // Auto-initialize when DOM loads
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', performAutoIntegrationCheck);
  } else {
    // DOM already loaded, start check after short delay
    setTimeout(performAutoIntegrationCheck, 100);
  }

  logSuccess(`Churnaizer SDK v${SDK_VERSION} loaded successfully with proper API key authentication`);
})();

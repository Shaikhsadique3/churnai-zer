/**
 * Churnaizer SDK - JavaScript Library for User Retention & Churn Prediction
 * Version: 1.0.0
 * 
 * This SDK helps SaaS founders track user behavior and predict churn risk.
 */

(function() {
  'use strict';

  const SDK_VERSION = '1.0.0';
  const API_BASE_URL = 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1';
  const DASHBOARD_SYNC_URL = 'https://churnaizer.com/api/sync';
  
  // Get debug setting from global config
  function isDebugEnabled() {
    return window.ChurnaizerConfig?.debug !== false;
  }

  function log(...args) {
    if (isDebugEnabled()) {
      console.log('%c[Churnaizer SDK]', 'color: #4CAF50; font-weight: bold;', ...args);
    }
  }

  function logError(...args) {
    console.error('%c[Churnaizer SDK Error]', 'color: #f44336; font-weight: bold;', ...args);
  }

  function logSuccess(...args) {
    console.log('%c[Churnaizer SDK]', 'color: #2196F3; font-weight: bold;', ...args);
  }

  // Main Churnaizer SDK Object
  window.Churnaizer = {
    version: SDK_VERSION,
    
    // Display SDK info
    info: function() {
      console.log(`%c✅ Churnaizer SDK v${SDK_VERSION}`, 'color: #4CAF50; font-weight: bold;');
      console.log('Documentation: https://docs.churnaizer.com');
      console.log('Support: https://churnaizer.com/contact');
    },

    // Main tracking function
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

      log('✅ Churnaizer SDK initialized');
      log('📡 Sending user behavior data...');

      // Expose last used API key for diagnostics
      try { window.__Churnaizer_lastApiKey = apiKey; } catch (_) {}

      // Generate unique trace session ID for end-to-end logging
      const traceId = userData.trace_id || (crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

      // Prepare tracking data with all expected fields
      const trackingData = {
        user_id: userData.user_id,
        email: userData.email || userData.customer_email, // Support both email fields
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
        trace_id: traceId, // Add trace session ID
        
        // Additional metadata
        timestamp: new Date().toISOString(),
        session_id: this._generateSessionId(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        sdk_version: SDK_VERSION
      };

      // Send tracking request with enhanced callback
      const wrappedCallback = (result, error) => {
        if (!error && result && result.status === 'ok') {
          // Enhanced success logging
          logSuccess('🎯 Prediction:', result.risk_level ? `${result.risk_level} Risk` : 'Medium Risk (Fallback)');
          
          if (result.shouldTriggerEmail) {
            logSuccess('✉️ Email Sent to: high-risk user');
          } else {
            log('📧 Email Ready (not triggered for this risk level)');
          }

          // Also track login event after successful prediction (non-blocking)
          try {
            this.trackEvent({
              event: 'login',
              user_id: userData.user_id,
              email: userData.email || userData.customer_email,
              customer_name: userData.customer_name,
              monthly_revenue: userData.monthly_revenue || 0,
              trace_id: traceId
            }, apiKey, function(eventResult, eventError) {
              if (eventError) {
                console.warn('Event tracking failed but main flow continues:', eventError);
              }
            });
          } catch (eventError) {
            console.warn('Event tracking failed but main flow continues:', eventError);
          }
        } else {
          logError('Tracking failed:', error || 'Unknown error');
        }
        
        if (callback) callback(result, error);
      };

      this._sendTrackingRequest(trackingData, apiKey, wrappedCallback);
    },

    // Test function specifically for integration testing
    testTrackingIntegration: function(apiKey, traceId, callback) {
      log('🧪 Running SDK integration test with trace ID:', traceId);

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

      // Send the test tracking request
      this._sendTrackingRequest(testUserData, apiKey, callback);
    },

    // New trackEvent function for recovery tracking
    trackEvent: function(eventData, apiKey, callback) {
      // Validate required parameters
      if (!eventData || !apiKey) {
        const error = 'Missing required parameters: eventData and apiKey are required';
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      // Validate required event fields
      const requiredFields = ['event', 'user_id', 'email'];
      const missingFields = requiredFields.filter(field => !eventData[field]);
      
      if (missingFields.length > 0) {
        const error = `Missing required event fields: ${missingFields.join(', ')}`;
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      // Generate trace_id if not provided (backward compatibility)
      const traceId = eventData.trace_id || (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      
      log('Tracking event:', eventData.event, 'for user:', eventData.user_id);

      // Expose last used API key for diagnostics
      try { window.__Churnaizer_lastApiKey = apiKey; } catch (_) {}

      // Prepare event data
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

      console.log(`[TRACE 1 | trace_id: ${traceId}] SDK Event Payload:`, trackingEventData);

      // Send event tracking request
      this._sendEventRequest(trackingEventData, apiKey, callback);
    },

    // Batch tracking for multiple users
    trackBatch: function(usersData, apiKey, callback) {
      if (!Array.isArray(usersData) || !apiKey) {
        const error = 'Missing required parameters: usersData (array) and apiKey are required';
        if (callback) callback(null, error);
        logError(error);
        return;
      }

      log('Batch tracking', usersData.length, 'users');

      // Validate each user
      const requiredFields = ['user_id', 'customer_email'];
      for (let i = 0; i < usersData.length; i++) {
        const missingFields = requiredFields.filter(field => !usersData[i][field]);
        if (missingFields.length > 0) {
          const error = `User at index ${i} missing required fields: ${missingFields.join(', ')}`;
          if (callback) callback(null, error);
          logError(error);
          return;
        }
      }

      // Prepare batch data
      const batchData = usersData.map(userData => ({
        user_id: userData.user_id,
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
        timestamp: new Date().toISOString(),
        session_id: this._generateSessionId(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        sdk_version: SDK_VERSION
      }));

      this._sendTrackingRequest(batchData, apiKey, callback);
    },

    // Initialize retention monitoring
    initRetentionMonitoring: function(options = {}) {
      const config = {
        checkInterval: options.checkInterval || 5000, // 5 seconds default
        modalEnabled: options.modalEnabled !== false, // enabled by default
        autoTrigger: options.autoTrigger !== false, // enabled by default
        customModalCallback: options.customModalCallback,
        ...options
      };

      log('Initializing retention monitoring with config:', config);

      this._retentionConfig = config;

      if (config.autoTrigger) {
        this._startRetentionMonitoring();
      }
    },

    // Show retention badge (for high-risk users)
    showBadge: function(message, type = 'warning') {
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#ff6b6b' : '#4CAF50'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
      `;
      badge.textContent = message;

      document.body.appendChild(badge);

      setTimeout(() => {
        if (badge.parentNode) {
          badge.parentNode.removeChild(badge);
        }
      }, 5000);
    },

    // Private methods
    _generateSessionId: function() {
      return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    _sendTrackingRequest: function(data, apiKey, callback) {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${API_BASE_URL}/sdk-track`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-churnaizer-api-key', apiKey);
      xhr.setRequestHeader('X-SDK-Version', SDK_VERSION);
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            if (xhr.status === 200 || xhr.status === 201) {
              logSuccess('✅ User Tracked');
              
              // Check if it's a single result or batch results
              const result = response.results?.[0] || response.result || response;
              
              // Validate required fields for SDK response
              const requiredFields = ['churn_score', 'churn_reason', 'risk_level'];
              const missingFields = requiredFields.filter(field => result[field] === undefined && result[field] !== null);
              
              if (missingFields.length > 0) {
                const error = `API response missing required fields: ${missingFields.join(', ')}`;
                logError('Missing fields error. Full response:', response);
                if (callback) callback(null, error);
                return;
              }
              
              // Auto-sync to dashboard
              this._syncToDashboard(data, result);
              
              // Handle high-risk users
              if (result?.risk_level === 'high' && this._retentionConfig?.modalEnabled) {
                this._showRetentionModal(result);
              }
              
              // Execute callback
              if (callback) callback(result, null);
            } else {
              logError('❌ Tracking failed:', response);
              if (callback) callback(null, response.error || 'Tracking failed');
            }
          } catch (e) {
            logError('❌ Invalid response format:', e);
            if (callback) callback(null, 'Invalid response format');
          }
        }
      }.bind(this);

      xhr.onerror = function() {
        logError('❌ Network error during tracking request');
        if (callback) callback(null, 'Network error');
      };

      xhr.send(JSON.stringify(data));
    },

    _sendEventRequest: function(eventData, apiKey, callback) {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${API_BASE_URL}/sdk-event`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-API-Key', apiKey);
      xhr.setRequestHeader('X-SDK-Version', SDK_VERSION);
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            if (xhr.status === 200 || xhr.status === 201) {
              log('Event tracking successful:', response);
              if (callback) callback(response, null);
            } else {
              logError('Event tracking failed:', response);
              if (callback) callback(null, response.error || 'Event tracking failed');
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
    },

    _syncToDashboard: async function(userData, result) {
      try {
        const syncData = {
          ...userData,
          ...result,
          shouldTriggerEmail: result.risk_level === 'high',
          synced_at: new Date().toISOString(),
          trace_id: userData.trace_id // Propagate trace_id to dashboard sync
        };

        const response = await fetch(DASHBOARD_SYNC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(syncData)
        });

        if (response.ok) {
          log('Dashboard sync successful');
          
          // Trigger email automation for high-risk users
          if (result.risk_level === 'high' && result.shouldTriggerEmail) {
            this._triggerEmailAutomation(userData, result);
          }
        } else {
          log('Dashboard sync failed:', response.status);
        }
      } catch (error) {
        log('Dashboard sync error:', error.message);
      }
    },

    _triggerEmailAutomation: async function(userData, result) {
      try {
        log('Triggering email automation for high-risk user:', userData.user_id);
        
        const emailData = {
          user_id: userData.user_id,
          customer_email: userData.customer_email,
          customer_name: userData.customer_name,
          churn_score: result.churn_score,
          risk_level: result.risk_level,
          churn_reason: result.insights?.churn_reason || 'High churn risk detected',
          subscription_plan: userData.subscription_plan,
          shouldTriggerEmail: true,
          trace_id: userData.trace_id // Propagate trace_id to email automation
        };

        const response = await fetch(`${API_BASE_URL}/auto-email-trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SDK-Version': SDK_VERSION
          },
          body: JSON.stringify(emailData)
        });

        const emailResult = await response.json();
        
        if (response.ok && emailResult.triggered) {
          log('Email automation triggered successfully:', emailResult);
        } else {
          log('Email automation skipped or failed:', emailResult.message || 'Unknown error');
        }
      } catch (error) {
        logError('Email automation failed:', error.message);
      }
    },

    _startRetentionMonitoring: function() {
      // Monitor for user behavior patterns that indicate churn risk
      let inactivityTimer;
      let interactionCount = 0;
      
      const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          if (interactionCount < 3) {
            this._triggerRetentionCheck();
          }
          interactionCount = 0;
        }, this._retentionConfig.checkInterval);
      };

      // Track user interactions
      ['click', 'scroll', 'keypress', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
          interactionCount++;
          resetInactivityTimer();
        }, { passive: true });
      });

      resetInactivityTimer();
      log('Retention monitoring started');
    },

    _triggerRetentionCheck: function() {
      log('Triggering retention check due to low engagement');
      
      // Could trigger additional API calls to check current risk level
      if (this._retentionConfig.modalEnabled) {
        this._showRetentionModal({
          risk_level: 'medium',
          churn_score: 0.6,
          reason: 'Low engagement detected'
        });
      }
    },

    _showRetentionModal: function(riskData) {
      // Check if custom modal callback exists
      if (this._retentionConfig?.customModalCallback) {
        this._retentionConfig.customModalCallback(riskData);
        return;
      }

      // Create default retention modal
      const modal = this._createRetentionModal(riskData);
      document.body.appendChild(modal);
      
      // Show modal with animation
      setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.churnaizer-modal-content').style.transform = 'scale(1)';
      }, 10);
    },

    _createRetentionModal: function(riskData) {
      const modal = document.createElement('div');
      modal.className = 'churnaizer-retention-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      const modalContent = document.createElement('div');
      modalContent.className = 'churnaizer-modal-content';
      modalContent.style.cssText = `
        background: white;
        padding: 32px;
        border-radius: 12px;
        max-width: 480px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      `;

      modalContent.innerHTML = `
        <div style="margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background: #ff6b6b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span style="color: white; font-size: 24px;">⚠️</span>
          </div>
          <h2 style="margin: 0 0 8px; color: #333; font-size: 24px; font-weight: 600;">Wait! Don't go yet</h2>
          <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
            We noticed you might be having trouble. Let us help you get the most out of your experience.
          </p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <button id="churnaizer-help-btn" style="
            background: #1C4E80;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-right: 12px;
            transition: background 0.2s ease;
          ">Get Help</button>
          
          <button id="churnaizer-dismiss-btn" style="
            background: transparent;
            color: #666;
            border: 1px solid #ddd;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
          ">Maybe Later</button>
        </div>
        
        <p style="margin: 0; color: #999; font-size: 12px;">
          Risk Level: ${riskData.risk_level} • Score: ${Math.round((riskData.churn_score || 0) * 100)}%
        </p>
      `;

      modal.appendChild(modalContent);

      // Add event listeners
      modal.querySelector('#churnaizer-help-btn').addEventListener('click', () => {
        this._handleRetentionAction('help_requested', riskData);
        this._closeModal(modal);
      });

      modal.querySelector('#churnaizer-dismiss-btn').addEventListener('click', () => {
        this._handleRetentionAction('dismissed', riskData);
        this._closeModal(modal);
      });

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this._handleRetentionAction('dismissed', riskData);
          this._closeModal(modal);
        }
      });

      return modal;
    },

    _handleRetentionAction: function(action, riskData) {
      log('Retention action:', action, riskData);
      this._sendRetentionEvent(action, riskData);
    },

    _sendRetentionEvent: function(action, riskData) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/retention-event`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-SDK-Version', SDK_VERSION);
      
      xhr.send(JSON.stringify({
        action: action,
        risk_data: riskData,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        sdk_version: SDK_VERSION
      }));
    },

    _closeModal: function(modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }
  };

  // ✅ Lightweight global verification object
  window.__CHURNAIZER_SDK_STATUS__ = {
    installed: true,
    apiKey: window.__CHURNAIZER_API_KEY__ || 'not-set',
    domain: window.location.hostname,
    version: SDK_VERSION
  };

  // Listen for SDK status requests and test commands via postMessage
  window.addEventListener("message", function(event) {
    if (event.data && event.data.action === "GET_CHURNAIZER_SDK_STATUS") {
      try {
        window.parent.postMessage({
          __CHURNAIZER_SDK_STATUS__: window.__CHURNAIZER_SDK_STATUS__
        }, "*");
      } catch (error) {
        log('PostMessage failed: ' + error.message);
      }
    }

    // Handle SDK integration test command
    if (event.data && event.data.type === "CHURNAIZER_SDK_TEST") {
      try {
        const { apiKey, traceId } = event.data;
        
        log('🔍 Received SDK test command with trace ID:', traceId);

        // Check if SDK is properly loaded
        if (!window.Churnaizer) {
          window.parent.postMessage({
            type: 'CHURNAIZER_SDK_TEST_RESULT',
            result: {
              success: false,
              error: 'SDK not found - Churnaizer object not available',
              domain: window.location.hostname
            }
          }, "*");
          return;
        }

        // Check if API key is available
        if (!apiKey) {
          window.parent.postMessage({
            type: 'CHURNAIZER_SDK_TEST_RESULT',
            result: {
              success: false,
              error: 'API key not provided for test',
              domain: window.location.hostname
            }
          }, "*");
          return;
        }

        // Run the actual tracking test
        window.Churnaizer.testTrackingIntegration(apiKey, traceId, function(result, error) {
          if (error) {
            window.parent.postMessage({
              type: 'CHURNAIZER_SDK_TEST_RESULT',
              result: {
                success: false,
                error: 'SDK track function failed: ' + error,
                domain: window.location.hostname,
                apiKeyUsed: !!apiKey
              }
            }, "*");
          } else {
            window.parent.postMessage({
              type: 'CHURNAIZER_SDK_TEST_RESULT',
              result: {
                success: true,
                domain: window.location.hostname,
                apiKeyUsed: !!apiKey,
                churnScore: result.churn_score,
                riskLevel: result.risk_level,
                churnReason: result.churn_reason,
                emailSent: result.shouldTriggerEmail,
                traceId: traceId
              }
            }, "*");
          }
        });

      } catch (error) {
        window.parent.postMessage({
          type: 'CHURNAIZER_SDK_TEST_RESULT',
          result: {
            success: false,
            error: 'SDK test execution failed: ' + error.message,
            domain: window.location.hostname
          }
        }, "*");
      }
    }
  });

  // Auto-initialize if configured
  if (window.ChurnaizerConfig) {
    window.Churnaizer.initRetentionMonitoring(window.ChurnaizerConfig);
  }

  log('✅ Churnaizer SDK v' + SDK_VERSION + ' loaded successfully');
})();

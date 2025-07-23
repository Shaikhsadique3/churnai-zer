// Churnaizer SDK v1.0.0 - Official Production Release
// Load from: https://churnaizer.com/churnaizer-sdk.js

(function (window) {
  'use strict';
  
  if (window.Churnaizer) {
    console.warn('⚠️ Churnaizer SDK: Already loaded, skipping initialization');
    return;
  }

  // SDK Configuration
  const SDK_VERSION = '1.0.0';
  const AI_MODEL_ENDPOINT = 'https://ai-model-rumc.onrender.com/predict';
  const SYNC_ENDPOINT = 'https://churnaizer.com/api/sync';
  
  // Utility functions
  function validateUserData(userData) {
    const requiredFields = [
      'user_id', 'customer_name', 'customer_email', 'days_since_signup', 'monthly_revenue', 'subscription_plan',
      'number_of_logins_last30days', 'active_features_used', 'support_tickets_opened',
      'last_payment_status', 'email_opens_last30days', 'last_login_days_ago', 'billing_issue_count'
    ];
    
    const missingFields = requiredFields.filter(field => 
      userData[field] === undefined || userData[field] === null
    );
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  }

  function createResult(data) {
    return {
      churn_score: data.churn_score || 0,
      churn_reason: data.churn_reason || 'No reason provided',
      risk_level: data.risk_level || 'unknown',
      user_id: data.user_id,
      understanding_score: data.understanding_score || 0,
      status_tag: data.status_tag || 'unknown',
      action_recommended: data.action_recommended || '',
      days_until_mature: data.days_until_mature || 0,
      sdk_version: SDK_VERSION,
      timestamp: new Date().toISOString()
    };
  }

  function analyzeUserLifecycle(userData, result) {
    const { days_since_signup, churn_score } = userData;
    
    // Log lifecycle analysis
    if (days_since_signup < 7) {
      console.warn('⚠️ Churnaizer: Too early to predict churn accurately – Need at least 7 days of behavior data.');
      console.log(`⏳ Prediction matures in ${7 - days_since_signup} days`);
    } else if (days_since_signup < 15) {
      console.log('🔍 Churnaizer: Prediction getting stronger. More behavior signals are now available.');
      console.log('📊 This prediction is moderately accurate. Monitor usage daily.');
    } else {
      console.log('✅ Churnaizer: Mature user data - high confidence prediction available.');
    }

    // Log risk analysis
    if (result.churn_score < 0.3) {
      console.log('🟢 Low Risk: User shows strong engagement patterns');
    } else if (result.churn_score >= 0.5) {
      console.log('🔴 High Risk: Consider immediate retention action');
      if (result.action_recommended) {
        console.log(`💡 Recommended: ${result.action_recommended}`);
      }
    }

    return result;
  }

  // Main SDK object
  window.Churnaizer = {
    version: SDK_VERSION,
    
    /**
     * Track user churn prediction
     * @param {Object} userData - User data for prediction
     * @param {string} apiKey - Your Churnaizer API key
     * @param {Function} callback - Optional callback function
     * @param {Object} options - Optional configuration
     */
    track: async function (userData, apiKey, callback, options) {
      // Enhanced input validation
      if (!userData || typeof userData !== 'object') {
        const error = new Error('🛑 Churnaizer SDK: Invalid user data provided');
        console.error(error.message);
        if (typeof callback === 'function') callback(null, error);
        return Promise.reject(error);
      }

      if (!userData.user_id || typeof userData.user_id !== 'string') {
        const error = new Error('🛑 Churnaizer SDK: user_id is required and must be a string');
        console.error(error.message);
        if (typeof callback === 'function') callback(null, error);
        return Promise.reject(error);
      }

      if (!apiKey || typeof apiKey !== 'string') {
        const error = new Error('🛑 Churnaizer SDK: Missing or invalid API key');
        console.error(error.message);
        if (typeof callback === 'function') callback(null, error);
        return Promise.reject(error);
      }

      // Options with defaults
      const config = {
        logging: true,
        timeout: 5000,
        retries: 2,
        ...options
      };

      // Validate required fields
      try {
        validateUserData(userData);
      } catch (error) {
        console.error('🛑 Churnaizer SDK:', error.message);
        if (typeof callback === 'function') callback(null, error);
        return Promise.reject(error);
      }

      if (config.logging) {
        console.log('🔁 Churnaizer: Sending prediction request for user:', userData.user_id);
      }

      // Retry function with exponential backoff
      async function retryFetch(url, options, retries = config.retries) {
        for (let i = 0; i <= retries; i++) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
              ...options,
              signal: controller.signal
            });
            
            clearTimeout(timeout);

            // Check content type to prevent HTML parsing errors
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error(`Invalid response type: ${contentType}. Expected JSON but received HTML or other format.`);
            }

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
          } catch (error) {
            if (i === retries) throw error;
            
            // Exponential backoff
            const delay = Math.pow(2, i) * 1000;
            if (config.logging) {
              console.warn(`⚠️ Churnaizer: Retry ${i + 1}/${retries + 1} in ${delay}ms. Error:`, error.message);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      try {
        // Step 1: Send data to secure Supabase edge function
        const aiData = await retryFetch(`${window.location.origin}/functions/v1/churn-prediction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`, // This should be the user's Supabase token
            'X-SDK-Version': SDK_VERSION,
            'User-Agent': `Churnaizer-SDK/${SDK_VERSION}`
          },
          body: JSON.stringify({
            customerData: userData,
            isBatch: false
          })
        });

        if (config.logging) {
          console.log('✅ Churnaizer: AI prediction received for user:', userData.user_id || userData.customer_email);
        }

        // Extract data from secure edge function response
        const predictionData = aiData.result || aiData;
        const churn_score = predictionData.churn_score || 0;
        const churn_reason = predictionData.churn_reason || 'No reason provided';
        const insight = predictionData.insight || '';
        const understanding_score = predictionData.understanding_score || 0;

        const result = {
          churn_score,
          churn_reason,
          insight,
          understanding_score,
          user_id: userData.user_id || userData.customer_email,
          risk_level: predictionData.risk_level || (churn_score >= 0.7 ? 'high' : churn_score >= 0.4 ? 'medium' : 'low'),
          sdk_version: SDK_VERSION,
          timestamp: new Date().toISOString()
        };

        // Step 2: Sync this data with Churnaizer backend (fire and forget)
        try {
          fetch(SYNC_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
              'X-SDK-Version': SDK_VERSION
            },
            body: JSON.stringify({
              ...userData,
              ...result
            })
          }).catch(syncError => {
            if (config.logging) {
              console.warn('⚠️ Churnaizer: Sync to dashboard failed (non-critical):', syncError.message);
            }
          });
        } catch (syncError) {
          // Sync failure is non-critical, don't block the main response
          if (config.logging) {
            console.warn('⚠️ Churnaizer: Sync to dashboard failed (non-critical):', syncError.message);
          }
        }

        // Step 3: Analyze and return result
        const analyzedResult = analyzeUserLifecycle(userData, result);
        
        if (typeof callback === 'function') {
          callback(analyzedResult, null);
        }
        
        return analyzedResult;

      } catch (error) {
        const errorMsg = `❌ Churnaizer SDK Error: ${error.message}`;
        console.error(errorMsg);
        
        if (typeof callback === 'function') {
          callback(null, error);
        }
        
        throw error;
      }
    },

    /**
     * Track multiple users at once
     * @param {Array} usersData - Array of user data objects
     * @param {string} apiKey - Your Churnaizer API key
     * @param {Function} callback - Optional callback function
     * @param {Object} options - Optional configuration
     */
    trackBatch: function (usersData, apiKey, callback, options) {
      if (!Array.isArray(usersData) || usersData.length === 0) {
        const error = new Error('🛑 Churnaizer SDK: Invalid users data array');
        console.error(error.message);
        if (typeof callback === 'function') callback(null, error);
        return Promise.reject(error);
      }

      const config = {
        logging: true,
        ...options
      };

      if (config.logging) {
        console.log(`🔁 Churnaizer: Sending batch prediction for ${usersData.length} users`);
      }

      // Validate all users
      try {
        usersData.forEach((userData, index) => {
          validateUserData(userData);
        });
      } catch (error) {
        console.error('🛑 Churnaizer SDK Batch:', error.message);
        if (typeof callback === 'function') callback(null, error);
        return Promise.reject(error);
      }

      return this.track(usersData, apiKey, callback, config);
    },

    /**
     * Show churn risk badge on element
     * @param {string} selector - CSS selector for the element
     * @param {Object} result - Churnaizer prediction result
     */
    showBadge: function (selector, result) {
      const element = document.querySelector(selector);
      if (!element) {
        console.warn('🛑 Churnaizer SDK: Element not found for selector:', selector);
        return;
      }

      const riskLevel = result.risk_level || 'unknown';
      const churnPercent = Math.round((result.churn_score || 0) * 100);
      
      const badgeColors = {
        low: '#10b981',
        medium: '#f59e0b', 
        high: '#ef4444',
        unknown: '#6b7280'
      };

      const badge = document.createElement('div');
      badge.className = 'churnaizer-badge';
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: ${badgeColors[riskLevel]};
        color: white;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      badge.textContent = `${churnPercent}%`;
      badge.title = `Churn Risk: ${riskLevel.toUpperCase()} (${churnPercent}%)\nReason: ${result.churn_reason}`;

      // Make parent relative if not already
      const parentStyle = window.getComputedStyle(element);
      if (parentStyle.position === 'static') {
        element.style.position = 'relative';
      }

      element.appendChild(badge);
    },

    /**
     * Get SDK information
     */
    info: function () {
      return {
        version: SDK_VERSION,
        endpoint: DEFAULT_ENDPOINT,
        loaded: true,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Auto-track if data attributes are present
  document.addEventListener('DOMContentLoaded', function () {
    const autoTrackElements = document.querySelectorAll('[data-churnaizer-track]');
    autoTrackElements.forEach(element => {
      const apiKey = element.getAttribute('data-churnaizer-api-key');
      const userData = {};
      
      // Extract data from data attributes
      ['user-id', 'customer-name', 'customer-email', 'days-since-signup', 'monthly-revenue', 'subscription-plan',
       'number-of-logins-last30days', 'active-features-used', 'support-tickets-opened',
       'last-payment-status', 'email-opens-last30days', 'last-login-days-ago', 'billing-issue-count'
      ].forEach(attr => {
        const value = element.getAttribute(`data-churnaizer-${attr}`);
        if (value !== null) {
          const key = attr.replace(/-/g, '_');
          userData[key] = isNaN(value) ? value : Number(value);
        }
      });

      if (apiKey && userData.user_id) {
        window.Churnaizer.track(userData, apiKey, function (result) {
          if (result) {
            window.Churnaizer.showBadge(`[data-churnaizer-track="${userData.user_id}"]`, result);
          }
        });
      }
    });
  });

  console.log(`✅ Churnaizer SDK v${SDK_VERSION} loaded successfully`);

})(window);
(function() {
  'use strict';

  // Churnaizer SDK - Production Version
  window.Churnaizer = {
    
    // Main tracking function
    track: function(userData, apiKey, callback) {
      // Validate required parameters
      if (!userData || !userData.user_id || !userData.email) {
        console.error('Churnaizer SDK: user_id and email are required');
        if (callback) callback({ error: 'Missing required user data' });
        return;
      }

      if (!apiKey) {
        console.error('Churnaizer SDK: API key is required');
        if (callback) callback({ error: 'Missing API key' });
        return;
      }

      // Prepare tracking data
      const trackingData = {
        user_id: userData.user_id,
        email: userData.email,
        subscription_plan: userData.subscription_plan || 'free',
        last_login: new Date().toISOString(),
        usage: userData.usage || 1,
        feature_usage: userData.feature_usage || {},
        metadata: {
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          session_id: this._generateSessionId()
        }
      };

      // Send tracking request to Churnaizer API
      this._sendTrackingRequest(trackingData, apiKey, callback);
    },

    // Initialize retention monitoring
    initRetentionMonitoring: function(options) {
      const config = {
        checkInterval: options?.checkInterval || 5000, // 5 seconds
        modalEnabled: options?.modalEnabled !== false,
        customModalCallback: options?.customModalCallback,
        autoTrigger: options?.autoTrigger !== false
      };

      this._retentionConfig = config;
      
      if (config.autoTrigger) {
        this._startRetentionMonitoring();
      }
    },

    // Private methods
    _generateSessionId: function() {
      return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    _sendTrackingRequest: function(data, apiKey, callback) {
      const xhr = new XMLHttpRequest();
      
      // Use secure endpoint that validates API key server-side
      xhr.open('POST', '/api/v1/track', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Churnaizer-API-Key', apiKey);
      xhr.setRequestHeader('Origin', window.location.origin);
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            if (xhr.status === 200) {
              console.log('Churnaizer: Tracking successful', response);
              
              // Handle high-risk users
              if (response.risk_level === 'high' && this._retentionConfig?.modalEnabled) {
                this._showRetentionModal(response);
              }
              
              // Execute callback
              if (callback) callback(null, response);
            } else {
              console.error('Churnaizer: Tracking failed', response);
              if (callback) callback(response);
            }
          } catch (e) {
            console.error('Churnaizer: Invalid response format', e);
            if (callback) callback({ error: 'Invalid response' });
          }
        }
      }.bind(this);

      xhr.onerror = function() {
        console.error('Churnaizer: Network error');
        if (callback) callback({ error: 'Network error' });
      };

      xhr.send(JSON.stringify(data));
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
      ['click', 'scroll', 'keypress'].forEach(event => {
        document.addEventListener(event, () => {
          interactionCount++;
          resetInactivityTimer();
        }, { passive: true });
      });

      resetInactivityTimer();
    },

    _triggerRetentionCheck: function() {
      // This could trigger additional API calls to check current risk level
      console.log('Churnaizer: Triggering retention check due to low engagement');
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
      // Log retention action
      console.log('Churnaizer: Retention action:', action, riskData);
      
      // Send retention event to analytics
      this._sendRetentionEvent(action, riskData);
    },

    _sendRetentionEvent: function(action, riskData) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/v1/retention-event', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.send(JSON.stringify({
        action: action,
        risk_data: riskData,
        timestamp: new Date().toISOString(),
        page_url: window.location.href
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

  // Auto-initialize if configured
  if (window.ChurnaizerConfig) {
    window.Churnaizer.initRetentionMonitoring(window.ChurnaizerConfig);
  }

  console.log('Churnaizer SDK loaded successfully');
})();
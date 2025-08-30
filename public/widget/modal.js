/**
 * Churnaizer Cancel Guard Modal Widget
 * Vanilla JS implementation for retention offers
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_BASE: 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1',
    CDN_BASE: 'https://cdn.churnaizer.com'
  };

  // Session management
  let sessionId = null;
  let currentApiKey = null;
  let currentUser = null;
  let currentOffers = [];
  let selectedOffer = null;

  // Generate session ID
  function generateSessionId() {
    return 'cg_session_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
  }

  // API request helper
  async function apiRequest(endpoint, data, apiKey) {
    try {
      const response = await fetch(`${CONFIG.API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || currentApiKey
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Churnaizer API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Log events
  async function logEvent(eventType, eventData = {}) {
    if (!sessionId || !currentApiKey) return;

    try {
      await apiRequest('cancel-guard-log', {
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
        customer_id: currentUser?.id
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  // Create modal HTML
  function createModalHTML() {
    return `
      <div class="churnaizer-modal-overlay" id="churnaizer-modal-overlay">
        <div class="churnaizer-modal" role="dialog" aria-labelledby="churnaizer-modal-title" aria-modal="true">
          <div class="churnaizer-modal-header">
            <button class="churnaizer-modal-close" id="churnaizer-modal-close" aria-label="Close modal">&times;</button>
            <h2 class="churnaizer-modal-title" id="churnaizer-modal-title">We'd hate to see you go!</h2>
            <p class="churnaizer-modal-subtitle">Before you cancel, let us offer you something special to keep you with us.</p>
          </div>
          <div class="churnaizer-modal-content" id="churnaizer-modal-content">
            <div class="churnaizer-loading">
              <div class="churnaizer-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Create offer HTML
  function createOfferHTML(offer, index) {
    const { type, title, copy, expected_save_odds, projected_revenue_saved } = offer;
    
    return `
      <div class="churnaizer-offer" data-offer-index="${index}" role="radio" tabindex="0" aria-checked="false">
        <div class="churnaizer-offer-type">${type}</div>
        <h3 class="churnaizer-offer-title">${title}</h3>
        <p class="churnaizer-offer-copy">${copy}</p>
        <div class="churnaizer-offer-stats">
          <div class="churnaizer-offer-stat">
            <div class="churnaizer-offer-stat-label">Success Rate</div>
            <div class="churnaizer-offer-stat-value">${Math.round(expected_save_odds * 100)}%</div>
          </div>
          <div class="churnaizer-offer-stat">
            <div class="churnaizer-offer-stat-label">Value Saved</div>
            <div class="churnaizer-offer-stat-value">$${Math.round(projected_revenue_saved)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Create success HTML
  function createSuccessHTML(result) {
    return `
      <div class="churnaizer-success">
        <div class="churnaizer-success-icon">✓</div>
        <h3 class="churnaizer-modal-title">Great news!</h3>
        <p class="churnaizer-modal-subtitle">${result.message || 'Your offer has been applied successfully.'}</p>
        ${result.instructions ? `<p style="margin-top: 16px; font-size: 14px; color: #666;">${result.instructions}</p>` : ''}
      </div>
    `;
  }

  // Create error HTML
  function createErrorHTML(message) {
    return `
      <div class="churnaizer-error">
        <h3>Something went wrong</h3>
        <p>${message}</p>
        <button class="churnaizer-btn churnaizer-btn-primary" onclick="ChurnaizerModal.retry()">Try Again</button>
      </div>
    `;
  }

  // Render offers
  function renderOffers(offers) {
    const content = document.getElementById('churnaizer-modal-content');
    if (!content) return;

    const offersHTML = offers.slice(0, 3).map((offer, index) => createOfferHTML(offer, index)).join('');
    
    content.innerHTML = `
      <div role="radiogroup" aria-labelledby="churnaizer-modal-title">
        ${offersHTML}
      </div>
      <div class="churnaizer-modal-footer">
        <button class="churnaizer-btn churnaizer-btn-secondary" id="churnaizer-cancel-btn">Continue Canceling</button>
        <button class="churnaizer-btn churnaizer-btn-primary" id="churnaizer-accept-btn" disabled>Accept Offer</button>
      </div>
    `;

    // Add event listeners for offers
    const offerElements = content.querySelectorAll('.churnaizer-offer');
    offerElements.forEach((element, index) => {
      element.addEventListener('click', () => selectOffer(index));
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOffer(index);
        }
      });
    });

    // Add footer button listeners
    const cancelBtn = document.getElementById('churnaizer-cancel-btn');
    const acceptBtn = document.getElementById('churnaizer-accept-btn');
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        logEvent('modal_closed', { reason: 'continue_cancel' });
        ChurnaizerModal.close();
      });
    }
    
    if (acceptBtn) {
      acceptBtn.addEventListener('click', handleAcceptOffer);
    }
  }

  // Select offer
  function selectOffer(index) {
    selectedOffer = currentOffers[index];
    
    // Update UI
    const offers = document.querySelectorAll('.churnaizer-offer');
    offers.forEach((offer, i) => {
      const isSelected = i === index;
      offer.classList.toggle('selected', isSelected);
      offer.setAttribute('aria-checked', isSelected);
    });

    // Enable accept button
    const acceptBtn = document.getElementById('churnaizer-accept-btn');
    if (acceptBtn) {
      acceptBtn.disabled = false;
    }

    // Log selection
    logEvent('offer_clicked', {
      offer_type: selectedOffer.type,
      offer_index: index,
      expected_save_odds: selectedOffer.expected_save_odds
    });
  }

  // Handle accept offer
  async function handleAcceptOffer() {
    if (!selectedOffer) return;

    const acceptBtn = document.getElementById('churnaizer-accept-btn');
    if (acceptBtn) {
      acceptBtn.disabled = true;
      acceptBtn.textContent = 'Processing...';
    }

    try {
      const result = await apiRequest('cancel-guard-execute', {
        session_id: sessionId,
        user: currentUser,
        offer: selectedOffer
      });

      logEvent('offer_accepted', {
        offer_type: selectedOffer.type,
        execution_result: result.success ? 'success' : 'failure'
      });

      if (result.success) {
        renderSuccess(result);
      } else {
        renderError(result.error || 'Failed to process offer');
      }
    } catch (error) {
      renderError('Network error. Please try again.');
    }
  }

  // Render success state
  function renderSuccess(result) {
    const content = document.getElementById('churnaizer-modal-content');
    if (content) {
      content.innerHTML = createSuccessHTML(result);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        ChurnaizerModal.close();
      }, 5000);
    }
  }

  // Render error state
  function renderError(message) {
    const content = document.getElementById('churnaizer-modal-content');
    if (content) {
      content.innerHTML = createErrorHTML(message);
    }
  }

  // Load CSS
  function loadCSS() {
    if (document.getElementById('churnaizer-modal-css')) return;

    const link = document.createElement('link');
    link.id = 'churnaizer-modal-css';
    link.rel = 'stylesheet';
    link.href = `${CONFIG.CDN_BASE}/widget/modal.css`;
    document.head.appendChild(link);
  }

  // Main Modal object
  window.ChurnaizerModal = {
    // Show modal with user data
    async show(apiKey, userData, context = {}) {
      try {
        currentApiKey = apiKey;
        currentUser = userData;
        sessionId = generateSessionId();

        // Load CSS
        loadCSS();

        // Create modal element
        let modalContainer = document.getElementById('churnaizer-modal-container');
        if (!modalContainer) {
          modalContainer = document.createElement('div');
          modalContainer.id = 'churnaizer-modal-container';
          modalContainer.innerHTML = createModalHTML();
          document.body.appendChild(modalContainer);
        }

        // Show modal
        const overlay = document.getElementById('churnaizer-modal-overlay');
        if (overlay) {
          overlay.classList.add('active');
          
          // Focus management
          const modal = overlay.querySelector('.churnaizer-modal');
          if (modal) {
            modal.focus();
          }
        }

        // Add event listeners
        this.addEventListeners();

        // Log modal shown
        await logEvent('modal_shown', {
          user_id: userData.id,
          context: context
        });

        // Fetch offers
        await this.fetchOffers(userData, context);

      } catch (error) {
        console.error('Failed to show modal:', error);
        renderError('Failed to load retention offers');
      }
    },

    // Fetch offers from API
    async fetchOffers(userData, context) {
      try {
        const response = await apiRequest('cancel-guard-decide', {
          user: userData,
          context: context
        });

        currentOffers = response.ranked_offers || [];
        
        if (currentOffers.length > 0) {
          renderOffers(currentOffers);
          
          // Log offers viewed
          await logEvent('offer_viewed', {
            offers_count: currentOffers.length,
            primary_offer_type: response.primary_offer?.type
          });
        } else {
          renderError('No retention offers available at this time');
        }
      } catch (error) {
        console.error('Failed to fetch offers:', error);
        renderError('Failed to load retention offers');
      }
    },

    // Close modal
    close() {
      const overlay = document.getElementById('churnaizer-modal-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        
        // Remove from DOM after animation
        setTimeout(() => {
          const container = document.getElementById('churnaizer-modal-container');
          if (container) {
            container.remove();
          }
        }, 300);
      }

      // Reset state
      selectedOffer = null;
      currentOffers = [];
    },

    // Retry loading offers
    async retry() {
      if (currentUser) {
        const content = document.getElementById('churnaizer-modal-content');
        if (content) {
          content.innerHTML = '<div class="churnaizer-loading"><div class="churnaizer-spinner"></div></div>';
        }
        await this.fetchOffers(currentUser, {});
      }
    },

    // Add event listeners
    addEventListeners() {
      // Close button
      const closeBtn = document.getElementById('churnaizer-modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          logEvent('modal_closed', { reason: 'close_button' });
          this.close();
        });
      }

      // Overlay click
      const overlay = document.getElementById('churnaizer-modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            logEvent('modal_closed', { reason: 'overlay_click' });
            this.close();
          }
        });
      }

      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
          logEvent('modal_closed', { reason: 'escape_key' });
          this.close();
        }
      });
    }
  };

  // Auto-initialize if data is provided
  if (window.ChurnaizerConfig && window.ChurnaizerConfig.autoShow) {
    document.addEventListener('DOMContentLoaded', () => {
      const config = window.ChurnaizerConfig;
      if (config.apiKey && config.user) {
        ChurnaizerModal.show(config.apiKey, config.user, config.context);
      }
    });
  }

})();
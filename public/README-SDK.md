# 🎯 Churnaizer JavaScript SDK

The Churnaizer SDK helps SaaS founders predict customer churn and improve retention by tracking user behavior in real-time.

## 🚀 Quick Start

### 1. Include the SDK

```html
<!-- Load Churnaizer SDK from CDN -->
<script src="https://cdn.churnaizer.com/churnaizer-sdk.js"></script>
```

### 2. Configure (Optional)

```html
<script>
  window.ChurnaizerConfig = {
    modalEnabled: true,          // Show retention popup for high-risk users
    checkInterval: 5000,         // Check user activity every 5 seconds
    autoTrigger: true,           // Auto-start retention monitoring
    debug: true                  // Enable console logging for development
  };
</script>
```

### 3. Track User Data

```javascript
// Example user data from your SaaS app
const userData = {
  user_id: "user_123",
  customer_name: "John Doe",
  customer_email: "john@example.com",
  days_since_signup: 45,
  monthly_revenue: 99,
  subscription_plan: "Pro",
  number_of_logins_last30days: 14,
  active_features_used: 5,
  support_tickets_opened: 1,
  last_payment_status: "active",
  email_opens_last30days: 8,
  last_login_days_ago: 2,
  billing_issue_count: 0
};

// Track with your API key
Churnaizer.track(userData, "YOUR_API_KEY_HERE", function(result, error) {
  if (error) {
    console.error("❌ Churnaizer Error:", error);
    return;
  }

  console.log("✅ Churn prediction:", result);
  
  // Take action based on risk level
  if (result.shouldTriggerEmail) {
    console.log("🚨 High-risk user - email automation triggered!");
  }
});
```

## 📊 Response Format

The SDK returns a prediction result with the following structure:

```javascript
{
  churn_score: 0.75,              // 0-1 probability of churn
  risk_level: "high",             // "low", "medium", "high"
  confidence_score: 0.92,         // AI model confidence
  churn_reason: "Low engagement", // Human-readable reason
  action_recommended: "Send retention email",
  shouldTriggerEmail: true,       // Convenience flag for high-risk users
  insights: "User login frequency decreased by 60%"
}
```

## 🎛️ Advanced Features

### Batch Tracking

Track multiple users at once:

```javascript
const users = [
  { user_id: "u1", customer_email: "user1@example.com", ... },
  { user_id: "u2", customer_email: "user2@example.com", ... }
];

Churnaizer.trackBatch(users, "YOUR_API_KEY", function(results, error) {
  console.log("Batch results:", results);
});
```

### Custom Retention Modal

Override the default retention popup:

```javascript
window.ChurnaizerConfig = {
  modalEnabled: true,
  customModalCallback: function(riskData) {
    // Your custom retention logic
    showCustomRetentionOffer(riskData);
  }
};
```

### Show Retention Badge

Display messages to users:

```javascript
// Success message
Churnaizer.showBadge("Welcome back! We missed you.", "success");

// Warning message
Churnaizer.showBadge("Your subscription expires soon!", "warning");
```

### SDK Information

```javascript
// Get version and info
Churnaizer.info();
console.log("SDK Version:", Churnaizer.version);
```

## 🔐 Security & API Keys

1. **Get your API key** from your [Churnaizer Dashboard](https://churnaizer.com/integration)
2. **Keep it secure** - never expose API keys in client-side code for production
3. **Use environment variables** for server-side implementations

## 📧 Email Automation

When a user has `risk_level: "high"`, the SDK automatically:

1. Sets `shouldTriggerEmail: true` in the response
2. Triggers email automation via Resend API
3. Sends AI-generated retention emails from `nexa@churnaizer.com`
4. Uses psychology-based messaging (urgency, loss aversion, etc.)

## 🎯 Required User Fields

The SDK validates these required fields:

- `user_id` - Unique identifier for the user
- `customer_email` - User's email address

## 📋 Optional User Fields

Provide as much data as possible for better predictions:

```javascript
{
  customer_name: "John Doe",
  days_since_signup: 30,
  monthly_revenue: 99,
  subscription_plan: "Pro", // "Free", "Starter", "Pro", "Enterprise"
  number_of_logins_last30days: 15,
  active_features_used: 5,
  support_tickets_opened: 2,
  last_payment_status: "active", // "active", "failed", "pending"
  email_opens_last30days: 8,
  last_login_days_ago: 1,
  billing_issue_count: 0
}
```

## 🔄 Auto-Sync to Dashboard

The SDK automatically syncs prediction results to your Churnaizer dashboard for analytics and reporting.

## 🐛 Debug Mode

Enable detailed logging during development:

```javascript
window.ChurnaizerConfig = {
  debug: true  // Set to false in production
};
```

## 📱 Retention Monitoring

The SDK can automatically monitor user behavior and show retention popups:

```javascript
window.ChurnaizerConfig = {
  modalEnabled: true,
  checkInterval: 10000,     // Check every 10 seconds
  autoTrigger: true         // Start monitoring automatically
};
```

## 🌐 CDN Hosting

The SDK is hosted on a secure CDN and includes:

- ✅ CORS headers for cross-origin requests
- ✅ Automatic retry logic for failed requests
- ✅ Error handling and validation
- ✅ Version tracking with `X-SDK-Version` header
- ✅ Session management and analytics

## 📞 Support

- 📖 **Documentation**: [https://docs.churnaizer.com](https://docs.churnaizer.com)
- 💬 **Support**: [https://churnaizer.com/contact](https://churnaizer.com/contact)
- 🐛 **Issues**: Report bugs via the support portal

## 📄 License

The Churnaizer SDK is proprietary software. Use requires a valid Churnaizer subscription.

---

**Made with ❤️ by the Churnaizer Team**
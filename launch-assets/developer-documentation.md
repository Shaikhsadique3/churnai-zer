# Churnaizer Developer Documentation

## Quick Start

### Installation
```html
<!-- Add to your HTML head -->
<script src="https://churnaizer.com/churnaizer-sdk.js"></script>
```

### Basic Usage
```javascript
// Track user data for churn prediction
Churnaizer.track({
  user_id: "user_123",
  customer_email: "john@example.com",
  customer_name: "John Doe",
  monthly_revenue: 99.99,
  subscription_plan: "Pro",
  days_since_signup: 90,
  number_of_logins_last30days: 25,
  active_features_used: 8,
  last_login_days_ago: 1
}, "your_api_key", function(result, error) {
  if (error) {
    console.error("Tracking error:", error);
    return;
  }
  console.log("Churn Score:", result.churn_score);
  console.log("Risk Level:", result.risk_level);
});
```

## SDK Reference

### Configuration

#### Global Configuration
```javascript
window.ChurnaizerConfig = {
  debug: true,                    // Enable console logging
  autoTrack: true,               // Auto-track login events
  showModal: true,               // Show retention modals
  checkInterval: 30000,          // Retention check interval (ms)
  endpoint: "https://churnaizer.com/api" // Custom endpoint
};
```

### Core Methods

#### `Churnaizer.track(userData, apiKey, callback)`
Tracks user data and returns churn prediction.

**Parameters:**
- `userData` (object): User data to analyze
- `apiKey` (string): Your API key
- `callback` (function): Callback function `(result, error) => {}`

**Returns:**
```javascript
{
  churn_score: 0.73,           // 0-1 probability of churn
  risk_level: "high",          // "low", "medium", "high"
  churn_reason: "Low engagement", // Primary risk factor
  confidence: 0.89,            // Model confidence
  recommendations: [           // Suggested actions
    "Increase feature adoption",
    "Send engagement email"
  ]
}
```

#### `Churnaizer.trackBatch(usersData, apiKey, callback)`
Track multiple users in one request.

```javascript
Churnaizer.trackBatch([
  { user_id: "user_1", email: "user1@example.com", ... },
  { user_id: "user_2", email: "user2@example.com", ... }
], "your_api_key", function(results, error) {
  if (error) return console.error(error);
  results.forEach(result => {
    console.log(`User ${result.user_id}: ${result.churn_score}`);
  });
});
```

#### `Churnaizer.trackEvent(eventData, apiKey, callback)`
Track specific user events.

```javascript
Churnaizer.trackEvent({
  user_id: "user_123",
  event: "feature_usage",
  feature_name: "export_data",
  timestamp: new Date().toISOString(),
  metadata: {
    file_type: "csv",
    file_size: 1024
  }
}, "your_api_key", callback);
```

### Data Schema

#### Required Fields
```javascript
{
  user_id: "string",           // Unique user identifier
  customer_email: "string",    // User's email address
  customer_name: "string"      // User's full name
}
```

#### Highly Recommended Fields
```javascript
{
  monthly_revenue: 99.99,              // Monthly subscription value
  subscription_plan: "Pro",            // Plan name/tier
  days_since_signup: 90,               // Account age
  number_of_logins_last30days: 25,     // Login frequency
  active_features_used: 8,             // Feature adoption
  last_login_days_ago: 1,              // Recency
  support_tickets_opened: 2,           // Support engagement
  last_payment_status: "Success",      // Billing health
  email_opens_last30days: 15,          // Email engagement
  billing_issue_count: 0               // Payment problems
}
```

#### Optional Fields
```javascript
{
  company_name: "Acme Corp",
  company_size: "50-100",
  industry: "SaaS",
  location: "San Francisco",
  trial_end_date: "2024-01-15",
  mrr_change_percent: -10.5,
  feature_usage_score: 0.75,
  nps_score: 8,
  referral_count: 3,
  integration_count: 5,
  api_usage_last30days: 150,
  mobile_app_usage: true,
  team_size: 5,
  storage_usage_percent: 85.5
}
```

## REST API

### Base URL
```
https://churnaizer.com/api/v1
```

### Authentication
Include your API key in the Authorization header:
```
Authorization: Bearer your_api_key_here
```

### Endpoints

#### POST `/predict`
Get churn prediction for a single user.

**Request:**
```javascript
{
  user_id: "user_123",
  customer_email: "john@example.com",
  customer_name: "John Doe",
  monthly_revenue: 99.99,
  // ... other user data
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    user_id: "user_123",
    churn_score: 0.73,
    risk_level: "high",
    churn_reason: "Low engagement",
    confidence: 0.89,
    recommendations: ["Increase feature adoption"],
    model_version: "v2.1.0",
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/predict/batch`
Get predictions for multiple users.

**Request:**
```javascript
{
  users: [
    { user_id: "user_1", email: "user1@example.com", ... },
    { user_id: "user_2", email: "user2@example.com", ... }
  ]
}
```

#### POST `/events`
Track user events.

**Request:**
```javascript
{
  user_id: "user_123",
  event: "feature_usage",
  timestamp: "2024-01-15T10:30:00Z",
  properties: {
    feature_name: "export_data",
    value: 1
  }
}
```

#### GET `/users/{user_id}/predictions`
Get prediction history for a user.

**Response:**
```javascript
{
  success: true,
  data: {
    user_id: "user_123",
    predictions: [
      {
        churn_score: 0.73,
        risk_level: "high",
        timestamp: "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## Webhooks

### Setup
Configure webhook URLs in your dashboard under Settings → Integrations.

### Events

#### `user.risk_detected`
Triggered when a user's risk level increases.

```javascript
{
  event: "user.risk_detected",
  timestamp: "2024-01-15T10:30:00Z",
  data: {
    user_id: "user_123",
    email: "john@example.com",
    previous_risk_level: "medium",
    current_risk_level: "high",
    churn_score: 0.73,
    churn_reason: "Low engagement"
  }
}
```

#### `user.recovered`
Triggered when a high-risk user shows improvement.

```javascript
{
  event: "user.recovered",
  timestamp: "2024-01-15T10:30:00Z",
  data: {
    user_id: "user_123",
    email: "john@example.com",
    previous_risk_level: "high",
    current_risk_level: "low",
    recovery_reason: "Increased engagement"
  }
}
```

#### `email.sent`
Triggered when retention email is sent.

```javascript
{
  event: "email.sent",
  timestamp: "2024-01-15T10:30:00Z",
  data: {
    user_id: "user_123",
    email: "john@example.com",
    template_id: "retention_sequence_1",
    campaign_name: "High Risk Recovery"
  }
}
```

### Webhook Security
Verify webhook authenticity using the signature header:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (quota exceeded)
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Response Format
```javascript
{
  success: false,
  error: {
    code: "INVALID_USER_DATA",
    message: "Required field 'user_id' is missing",
    details: {
      field: "user_id",
      expected: "string"
    }
  }
}
```

### SDK Error Handling
```javascript
Churnaizer.track(userData, apiKey, function(result, error) {
  if (error) {
    switch(error.code) {
      case 'NETWORK_ERROR':
        console.log('Network issue, retry later');
        break;
      case 'INVALID_API_KEY':
        console.log('Check your API key');
        break;
      case 'QUOTA_EXCEEDED':
        console.log('Upgrade your plan');
        break;
      default:
        console.log('Unknown error:', error.message);
    }
    return;
  }
  // Handle successful result
});
```

## Best Practices

### Performance
- Use batch tracking for multiple users
- Implement client-side caching for repeated requests
- Track asynchronously to avoid blocking UI
- Consider using webhooks instead of polling

### Data Quality
- Validate data before sending
- Use consistent user_id format
- Send updates when user data changes
- Include timestamp for events

### Security
- Store API keys securely (environment variables)
- Use HTTPS for all requests
- Validate webhook signatures
- Rotate API keys periodically

### Integration Patterns

#### React Hook
```javascript
import { useEffect, useState } from 'react';

export function useChurnPrediction(userData, apiKey) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData || !apiKey) return;
    
    setLoading(true);
    Churnaizer.track(userData, apiKey, (result, error) => {
      setLoading(false);
      if (error) {
        console.error('Churn prediction error:', error);
        return;
      }
      setPrediction(result);
    });
  }, [userData, apiKey]);

  return { prediction, loading };
}
```

#### Node.js Backend
```javascript
const express = require('express');
const axios = require('axios');

app.post('/track-churn', async (req, res) => {
  try {
    const response = await axios.post('https://churnaizer.com/api/v1/predict', 
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHURNAIZER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Churn prediction failed:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});
```

## Testing

### Test Mode
Use test API keys (starting with `test_`) for development:

```javascript
Churnaizer.track(userData, "test_sk_123...", callback);
```

### Sample Data
```javascript
const testUser = {
  user_id: "test_user_123",
  customer_email: "test@example.com",
  customer_name: "Test User",
  monthly_revenue: 99.99,
  subscription_plan: "Pro",
  days_since_signup: 30,
  number_of_logins_last30days: 15,
  active_features_used: 5,
  last_login_days_ago: 2
};
```

## Rate Limits

- **Free Plan**: 100 requests/month
- **Starter Plan**: 1,000 requests/month
- **Pro Plan**: 10,000 requests/month
- **Enterprise**: Custom limits

Rate limit headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Support

- **Documentation**: docs.churnaizer.com
- **API Status**: status.churnaizer.com
- **Email Support**: developers@churnaizer.com
- **Discord Community**: discord.gg/churnaizer
- **GitHub Issues**: github.com/churnaizer/sdk-js

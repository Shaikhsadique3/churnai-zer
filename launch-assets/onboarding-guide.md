# Churnaizer Onboarding Guide

## Welcome to Churnaizer! 🎉

This guide will get you from zero to saving customers in just 30 minutes. Follow these steps in order for the best results.

---

## Step 1: Account Setup (5 minutes)

### ✅ Create Your Account
1. Go to [churnaizer.com/signup](https://churnaizer.com/signup)
2. Enter your email and create a password
3. Verify your email address
4. Complete your company profile:
   - Company name
   - Industry
   - Team size
   - Current monthly churn rate (if known)

### ✅ Get Your API Key
1. Go to Settings → API Keys
2. Click "Generate New Key"
3. Name it "Production Key"
4. Copy and save it securely (you'll need this for integration)

**🔒 Security Note**: Treat your API key like a password. Never share it publicly or commit it to code repositories.

---

## Step 2: Technical Integration (10 minutes)

### ✅ Add the SDK to Your App

**Option A: Direct HTML Integration**
Add this to your app's `<head>` section:

```html
<script src="https://churnaizer.com/churnaizer-sdk.js"></script>
<script>
  // Replace with your actual API key
  const CHURNAIZER_API_KEY = "your_api_key_here";
  
  // Basic tracking on page load
  if (window.currentUser) {
    Churnaizer.track({
      user_id: window.currentUser.id,
      customer_email: window.currentUser.email,
      customer_name: window.currentUser.name,
      subscription_plan: window.currentUser.plan,
      monthly_revenue: window.currentUser.revenue
    }, CHURNAIZER_API_KEY, function(result, error) {
      if (error) return console.error("Churnaizer error:", error);
      console.log("Churn risk:", result.churn_score);
    });
  }
</script>
```

**Option B: NPM Installation**
```bash
npm install churnaizer-sdk
```

```javascript
import Churnaizer from 'churnaizer-sdk';

Churnaizer.track(userData, apiKey, callback);
```

### ✅ Send Your First Prediction
Test your integration with sample data:

```javascript
Churnaizer.track({
  user_id: "test_user_123",
  customer_email: "test@yourcompany.com",
  customer_name: "Test User",
  monthly_revenue: 99.99,
  subscription_plan: "Pro",
  days_since_signup: 30,
  number_of_logins_last30days: 15,
  active_features_used: 5,
  last_login_days_ago: 2
}, "your_api_key", function(result, error) {
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("Success! Churn Score:", result.churn_score);
  console.log("Risk Level:", result.risk_level);
});
```

**✅ Verification**: Check your Churnaizer dashboard. You should see your test user appear within a few minutes.

---

## Step 3: Data Configuration (5 minutes)

### ✅ Identify Your Key User Data
Focus on these essential fields first:

**Must Have:**
- `user_id` - Unique identifier
- `customer_email` - For sending retention emails
- `customer_name` - For personalization
- `monthly_revenue` - Subscription value
- `subscription_plan` - Plan/tier name

**Should Have:**
- `days_since_signup` - Account age
- `number_of_logins_last30days` - Engagement
- `last_login_days_ago` - Recency
- `active_features_used` - Feature adoption

### ✅ Map Your Existing Data
Fill out this worksheet:

| Churnaizer Field | Your Database Field | Sample Value |
|------------------|---------------------|--------------|
| user_id | users.id | "user_123" |
| customer_email | users.email | "john@company.com" |
| customer_name | users.full_name | "John Smith" |
| monthly_revenue | subscriptions.amount | 99.99 |
| subscription_plan | subscriptions.plan_name | "Pro" |
| days_since_signup | (calculated field) | 45 |
| number_of_logins_last30days | (from analytics) | 12 |

---

## Step 4: Retention Email Setup (5 minutes)

### ✅ Configure Email Settings
1. Go to Settings → Email Integration
2. Choose your email provider:
   - **Mailchimp**: Enter API key and list ID
   - **SendGrid**: Enter API key and sender email
   - **Custom SMTP**: Enter server details
   - **Churnaizer Email**: Use our built-in service (easiest)

### ✅ Choose Email Templates
1. Go to Retention → Email Templates
2. Enable these starter templates:
   - **"We Miss You"** - For users who haven't logged in recently
   - **"Unlock Your Potential"** - For users with low feature adoption
   - **"Billing Reminder"** - For payment issues
3. Customize the sender name and email address

### ✅ Set Trigger Rules
1. Go to Retention → Automation Rules
2. Enable default rules:
   - Send email when churn score > 70%
   - Don't send more than 1 email per week per user
   - Stop sending if user becomes active

**✅ Test**: Manually trigger a test email to yourself from the dashboard.

---

## Step 5: Dashboard Familiarization (5 minutes)

### ✅ Understand Your Dashboard

**Risk Overview:**
- **High Risk** (Red): Churn score 70-100% - Take immediate action
- **Medium Risk** (Yellow): Churn score 40-69% - Monitor closely  
- **Low Risk** (Green): Churn score 0-39% - Healthy users

**Key Metrics:**
- **Monthly Churn Rate**: Percentage of customers lost
- **Recovery Rate**: Percentage of at-risk users saved
- **Revenue at Risk**: Dollar value of high-risk subscriptions
- **Revenue Saved**: Dollar value of recovered customers

### ✅ Set Up Notifications
1. Go to Settings → Notifications
2. Enable:
   - Email alerts for new high-risk users
   - Weekly churn summary reports
   - Recovery celebration emails

### ✅ Invite Team Members
1. Go to Settings → Team
2. Invite customer success team members
3. Set appropriate permissions (view-only for analysts, full access for managers)

---

## Quick Wins (Do These Today)

### 🎯 Win #1: Identify Your Riskiest Users
1. Go to Users → High Risk
2. Export the list of users with churn score > 80%
3. Have your customer success team reach out personally
4. Track which outreach methods work best

### 🎯 Win #2: Set Up Billing Health Monitoring
If you have payment failure data, track:
```javascript
{
  last_payment_status: "Failed", // or "Success"
  billing_issue_count: 3,
  days_since_last_payment: 35
}
```

### 🎯 Win #3: Monitor Feature Adoption
Track which features correlate with retention:
```javascript
{
  active_features_used: 8,
  key_feature_adopted: true, // Your most important feature
  time_to_value_days: 7      // Days to first success
}
```

---

## Week 1 Checklist

### Days 1-2: Setup and Testing
- [ ] Account created and verified
- [ ] SDK integrated and sending data
- [ ] Test user appears in dashboard
- [ ] Email integration configured
- [ ] Team members invited

### Days 3-4: Data Optimization
- [ ] All essential user fields being tracked
- [ ] Historical data imported (if available)
- [ ] Data quality verified (no missing values)
- [ ] Custom fields added for your business

### Days 5-7: Automation and Monitoring
- [ ] Retention emails enabled and tested
- [ ] Customer success team trained
- [ ] Weekly review process established
- [ ] First at-risk users contacted

---

## Common Issues and Solutions

### ❌ "No users showing up in dashboard"
**Solution**: Check your API key and ensure user_id is unique and consistent.

### ❌ "Churn scores seem too high/low"
**Solution**: The AI learns from your data. Scores improve with more historical data and time.

### ❌ "Emails not sending"
**Solution**: Verify email integration settings and check your email provider's sending limits.

### ❌ "Team can't access dashboard"
**Solution**: Check team member permissions and ensure they've accepted their invitation.

### ❌ "Integration taking too long"
**Solution**: Start with just user_id, email, and revenue. Add more fields gradually.

---

## Getting Help

### 📚 Resources
- **Documentation**: docs.churnaizer.com
- **Video Tutorials**: churnaizer.com/tutorials
- **Community Forum**: community.churnaizer.com
- **API Reference**: docs.churnaizer.com/api

### 💬 Support Channels
- **Live Chat**: Available in your dashboard (business hours)
- **Email**: support@churnaizer.com (24-hour response)
- **Setup Call**: Book at calendly.com/churnaizer-onboarding
- **Slack Community**: Join 500+ SaaS founders

### 🚨 Priority Support
Enterprise customers get:
- Dedicated success manager
- Phone support
- Custom integration assistance
- Advanced training sessions

---

## What's Next?

### Week 2-4: Optimization
- Analyze which users are being saved by your retention efforts
- A/B test different email templates and timing
- Add more sophisticated data tracking
- Set up webhooks for advanced integrations

### Month 2: Advanced Features
- Custom churn models for your industry
- Cohort analysis and segmentation
- Advanced automation workflows
- Revenue recovery tracking

### Month 3+: Scale and Expand
- White-label retention emails
- Integration with your CRM and support tools
- Custom reporting and analytics
- Team performance tracking

**Remember**: The key to success with Churnaizer is consistency. The more quality data you provide, the better our AI becomes at predicting and preventing churn for your specific business.

🎯 **Goal**: By the end of week 1, you should have prevented at least one customer from churning. Most customers see measurable retention improvements within 30 days.

**Questions?** Don't hesitate to reach out! We're here to help you succeed.
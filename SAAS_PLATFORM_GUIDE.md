# Churnaizer SaaS Platform - Complete Guide

## 🎯 Overview
A full SaaS-grade churn prediction and retention email platform with industry-standard rules-based predictions and AI-powered personalization.

## 🚀 New Features

### 1. Industry-Standard Rules-Based Churn Prediction
Located in: `supabase/functions/rules-based-churn-prediction/index.ts`

**Scoring Rules (Total: 100 points)**
- **Payment Status (30 pts)**: Failed/overdue payments trigger high risk
- **Login Activity (25 pts)**: >30 days inactive = critical risk
- **Login Frequency (20 pts)**: <3 logins/month = engagement issue  
- **Feature Adoption (15 pts)**: No features used = onboarding failure
- **Support Tickets (10 pts)**: >5 tickets = friction detected
- **NPS Score (15 pts)**: ≤6 (detractor) = dissatisfaction
- **Revenue Contribution (10 pts)**: $0 revenue = free tier risk
- **Early Stage Risk (5 pts)**: <30 days + low usage = poor onboarding

**Risk Levels**
- **Critical**: 70-100 points (immediate intervention needed)
- **High**: 50-69 points (at-risk customers)
- **Medium**: 30-49 points (watch closely)
- **Low**: 0-29 points (healthy customers)

### 2. AI-Powered Retention Email Generator
Located in: `supabase/functions/generate-retention-emails/index.ts`

**Features**
- Uses Lovable AI (Gemini 2.5 Flash - FREE during promo period!)
- Leverages customer psychology principles (loss aversion, social proof, reciprocity)
- Personalized based on churn reason, risk level, and product USP
- Generates subject line, body (HTML), and CTA automatically
- Rate limit handling with batch processing (5 emails per second)

**Email Components**
- Subject: Curiosity-driven, personalized
- Body: Empathetic opening + USP highlights + social proof
- CTA: Clear action with founder's website link

### 3. Complete SaaS Dashboard
Located in: `src/pages/ChurnDashboard.tsx`

**Three Main Tabs**

#### Tab 1: Upload Data
- Upload customer CSV with required fields
- Add product USP (plain text)
- Provide website CTA link
- Instant validation and processing

#### Tab 2: Churn Analytics
- **Key Metrics Dashboard**
  - Total customers count
  - Average churn score
  - Revenue at risk ($)
  - Estimated churn rate (%)

- **Risk Distribution Visualization**
  - Color-coded progress bars
  - Critical (red), High (orange), Medium (yellow), Low (green)
  - Customer counts per segment

- **Top At-Risk Customers List**
  - Detailed churn reasons
  - Actionable recommendations
  - Revenue impact per customer

- **Download Options**
  - Full CSV report with all predictions
  - Includes customer ID, scores, reasons, recommendations

#### Tab 3: Email Generator
- **Batch Email Generation**
  - Generate all emails at once
  - Rate-limited batch processing (respects API limits)
  - Real-time generation progress

- **Individual Customer Cards**
  - Customer details + risk badge
  - Churn score percentage
  - Generated email preview
  - Copy to clipboard functionality
  - Regenerate option

- **Download All Emails**
  - CSV export with all generated emails
  - Subject, body, CTA included

## 📊 CSV Format Requirements

### Customer Data CSV Columns
```csv
customer_id,monthly_revenue,payment_status,days_since_signup,last_login_days_ago,logins_last30days,active_features_used,tickets_opened,NPS_score,customer_email
```

**Field Descriptions**
- `customer_id`: Unique identifier (required)
- `monthly_revenue`: Revenue in dollars (numeric)
- `payment_status`: "active", "failed", "overdue"
- `days_since_signup`: Days since account creation
- `last_login_days_ago`: Days since last login
- `logins_last30days`: Number of logins in past 30 days
- `active_features_used`: Count of features actively used
- `tickets_opened`: Total support tickets
- `NPS_score`: Net Promoter Score (0-10)
- `customer_email`: Email address (optional)

## 🔐 Security Features (Fixed)
- ✅ Role-based access control with `user_roles` table
- ✅ All database functions have `SET search_path = public`
- ✅ Input validation on all edge functions
- ✅ Sanitized logging (no PII exposure)
- ✅ NULL user_id records cleaned up
- ✅ JWT authentication required for sensitive endpoints

## 🎨 UI/UX Highlights
- Modern gradient backgrounds
- Responsive card-based layouts
- Color-coded risk indicators
- Skeleton loading states
- Toast notifications for feedback
- Progressive disclosure (tabs unlock after data upload)
- Download buttons for export functionality

## 🚦 Getting Started

### For Founders:
1. Sign up at `/auth`
2. Navigate to `/dashboard`
3. Upload your customer CSV + USP text + website link
4. View comprehensive churn analytics
5. Generate personalized retention emails
6. Download reports and email drafts

### For Developers:
1. **Edge Functions** are auto-deployed
2. **Lovable AI** is pre-configured (no API key needed)
3. **Database** migrations completed
4. **Security** fixes applied

## 💡 Best Practices

### Email Generation
- Generate emails in batches of 5 to respect rate limits
- Wait 1 second between batches
- Handle 429 (rate limit) and 402 (credits) errors gracefully

### Data Upload
- Keep CSV files under 10MB
- Ensure all required columns exist
- Validate email formats
- Sanitize filenames before upload

### Analytics
- Focus on critical + high risk customers first
- Review recommendations for each at-risk customer
- Track revenue at risk as key metric
- Download reports for offline analysis

## 📈 Industry Benchmarks
- **Healthy Churn Rate**: <5% monthly
- **Acceptable**: 5-7%
- **Warning**: 7-10%
- **Critical**: >10%

## 🔄 Workflow
1. Founder uploads customer CSV → **Rules-based analysis runs**
2. System calculates churn scores → **Risk segmentation created**
3. Analytics dashboard displays → **Insights generated**
4. Founder reviews at-risk customers → **Identifies priorities**
5. AI generates retention emails → **Personalized campaigns ready**
6. Founder downloads + deploys → **Retention campaigns launched**

## 🎁 Cost Optimization
- **FREE** Gemini models during Sept 29 - Oct 6, 2025
- After promo: ~$0.075 per 1,000 tokens
- Batch processing minimizes API calls
- Caching recommendations (future enhancement)

## 📞 Support
For issues:
- Check edge function logs in Supabase dashboard
- Review database RLS policies
- Validate CSV format
- Check Lovable AI credits balance

---

**Built with**: React, TypeScript, Tailwind CSS, Supabase, Lovable AI (Gemini 2.5 Flash)

# Churnaizer - AI-Powered Churn Prediction Platform

> Predict & Prevent Customer Churn with AI - Smart insights for SaaS businesses

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   ├── integration/    # SDK integration components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components (shadcn/ui)
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   ├── blog/           # Blog pages
│   └── dashboard/      # Main dashboard pages
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── contexts/           # React contexts
├── utils/              # Utility functions
├── assets/             # Static assets
└── styles/             # Global styles
```

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Email**: Resend API
- **AI**: OpenAI/OpenRouter integration
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

## 🔧 Environment Setup

The project uses Supabase for backend services. All configuration is handled through Supabase's dashboard and secrets management.

Required Supabase secrets:
- `OPENAI_API_KEY` or `OPENROUTER_API_KEY`
- `RESEND_API_KEY`
- `CHURN_API_KEY`

## 📊 Features

### Core Dashboard
- Real-time churn prediction analytics
- User risk assessment and segmentation
- CSV data upload and processing
- Automated retention campaigns

### SDK Integration
- JavaScript SDK for easy integration
- Real-time user tracking
- Churn prediction API
- Webhook support for real-time notifications

### Email Automation
- Smart retention email campaigns
- Template management
- A/B testing capabilities
- Performance analytics

### Admin Panel
- User management and analytics
- Content management (blogs, announcements)
- Email inbox and communication
- System configuration

## 🌐 Deployment

### Automatic Deployment
The project is configured for automatic deployment with:
- Supabase Edge Functions (auto-deployed)
- Frontend hosting (Vercel/Netlify recommended)

### Custom Domain Setup
1. Configure your domain DNS
2. Update domain settings in hosting provider
3. Update `src/lib/config.ts` with your domain

## 🔐 Security

- Row Level Security (RLS) enabled on all database tables
- JWT-based authentication
- API key management for SDK access
- Admin role protection for sensitive routes

## 📱 SDK Usage

```html
<!-- Include the Churnaizer SDK -->
<script src="https://churnaizer.com/churnaizer-sdk.js"></script>

<script>
// Initialize tracking
Churnaizer.track({
  userId: 'user123',
  email: 'user@example.com',
  plan: 'pro',
  usage: 145,
  lastLogin: new Date()
});
</script>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, contact us at support@churnaizer.com

---

Built with ❤️ for SaaS businesses worldwide.
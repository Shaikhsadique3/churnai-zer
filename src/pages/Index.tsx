import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Shield, Zap, CheckCircle, Users, Brain, Lock, Globe, CreditCard, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";
import { DynamicHead } from "@/components/common/DynamicHead";
import AnnouncementBanner from "@/components/common/AnnouncementBanner";

const Index = () => {
  const { user } = useAuth();

  return (
    <>
      <DynamicHead 
        title="Churnaizer – Predict & Prevent SaaS Churn with AI"
        description="Install our SDK to track churn risk in real time. Used by 100+ SaaS teams. GDPR-ready and developer-friendly."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 w-full">
        <AnnouncementBanner />
        
        {/* Sticky Navigation - Full width responsive */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Logo size="md" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Churnaizer</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/docs" className="hidden lg:inline-block text-foreground/70 hover:text-foreground font-medium text-sm xl:text-base">
                Docs
              </Link>
              <Link to="/blog" className="hidden lg:inline-block text-foreground/70 hover:text-foreground font-medium text-sm xl:text-base">
                Blog
              </Link>
              {user ? (
                <Link to="/dashboard">
                  <Button size="sm" className="sm:text-base">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/docs" className="hidden md:inline-block">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Documentation</Button>
                  </Link>
                  <Link to="/integration" className="hidden md:inline-block">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">View SDK Setup</Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="text-xs sm:text-sm xl:text-base px-3 sm:px-4">Start Free – Get SDK Code</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section - Responsive container and typography */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              94% Prediction Accuracy
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Stop Losing Customers 
              <span className="text-primary block sm:inline"> Before It's Too Late</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
              Churnaizer's AI predicts which users will churn and automatically triggers retention actions - 
              saving SaaS founders thousands in lost revenue.
            </p>
            
            {/* Value Props - Responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">94%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Prediction Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">5min</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">47%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Churn Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">$240k+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Revenue Saved</div>
              </div>
            </div>

            {/* CTA Buttons - Responsive sizing */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-6 sm:px-8 text-sm sm:text-base">
                  Get Your Free Churn Prediction
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/integration">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base">
                  View Integration Guide
                </Button>
              </Link>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
              No credit card required • 100 predictions included • See results in 24 hours
            </p>
            
            {/* Hero Visual - SDK Code - Responsive */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-lg max-w-3xl mx-auto">
              <div className="bg-muted rounded p-3 sm:p-4 text-left text-xs sm:text-sm font-mono overflow-x-auto">
                <div className="text-muted-foreground mb-2 sm:mb-3 whitespace-nowrap">// Official Churnaizer SDK v1.0.0</div>
                <div className="text-blue-600 whitespace-nowrap">&lt;script src=<span className="text-amber-600">"https://churnaizer.com/churnaizer-sdk.js"</span>&gt;&lt;/script&gt;</div>
                <div className="mt-2 whitespace-nowrap">Churnaizer.<span className="text-green-600">track</span>({`{`}</div>
                <div className="ml-2 sm:ml-4 text-muted-foreground whitespace-nowrap">user_id: <span className="text-amber-600">"user_123"</span>,</div>
                <div className="ml-2 sm:ml-4 text-muted-foreground whitespace-nowrap">customer_email: <span className="text-amber-600">"john@example.com"</span>,</div>
                <div className="ml-2 sm:ml-4 text-muted-foreground whitespace-nowrap">monthly_revenue: <span className="text-blue-600">99.99</span></div>
                <div className="whitespace-nowrap">{`}`}, <span className="text-amber-600">"your_api_key"</span>);</div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section - Full width responsive */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Everything You Need to Stop Churn
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered predictions, automated retention, and recovery tracking in one platform
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">🎯 AI-Powered Predictions</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  94% accuracy rate in churn prediction with real-time risk scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Behavioral pattern analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Early warning system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Risk scoring (0-100)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">📧 Automated Retention</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Smart email sequences and personalized messaging that converts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    A/B tested templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Multi-channel notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Personalized campaigns
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">📊 Recovery Analytics</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track revenue saved and measure retention campaign performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Revenue tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    ROI measurement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Campaign metrics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Code className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">🚀 Developer-Friendly</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  5-minute SDK integration with REST API and webhook support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    REST API access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Webhook support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Real-time dashboard
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">🔒 Enterprise Security</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  SOC 2 compliant with bank-level encryption and privacy-first design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    SOC 2 compliant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    GDPR ready
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    Bank-level encryption
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section - Responsive */}
        <section className="bg-muted/30 py-12 sm:py-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                How It Works (3 Simple Steps)
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground">
                From setup to saving customers in just minutes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <div className="text-center relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Track User Behavior</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  Add our lightweight SDK to your app with one line of code. We automatically track user engagement patterns, login frequency, feature usage, and billing health.
                </p>
                <div className="bg-card rounded-lg p-2 sm:p-3 text-xs font-mono text-left border overflow-x-auto">
                  <span className="text-blue-600">Churnaizer</span>.<span className="text-green-600">track</span>(<span className="text-amber-600">userData</span>);
                </div>
                
                {/* Connection line - hidden on mobile */}
                <div className="hidden md:block absolute top-8 sm:top-10 left-full w-6 sm:w-8 h-0.5 bg-primary/30"></div>
              </div>
              
              <div className="text-center relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">AI Predicts Churn Risk</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  Our machine learning models analyze user behavior to predict churn probability. Get instant alerts when users show early warning signs.
                </p>
                <div className="bg-card rounded-lg p-2 sm:p-3 border">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span>Churn Score:</span>
                    <span className="font-bold text-destructive">87/100</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">High Risk - Low engagement</div>
                </div>
                
                {/* Connection line - hidden on mobile */}
                <div className="hidden md:block absolute top-8 sm:top-10 left-full w-6 sm:w-8 h-0.5 bg-primary/30"></div>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Automatic Recovery Actions</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  Trigger personalized retention emails, in-app messages, or webhook notifications to your CRM when users are at risk. Watch your retention rates improve automatically.
                </p>
                <div className="bg-card rounded-lg p-2 sm:p-3 border">
                  <div className="text-xs sm:text-sm text-success font-medium">✅ Email sent</div>
                  <div className="text-xs text-muted-foreground mt-1">User re-engaged</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Responsive */}
        <section className="py-12 sm:py-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                Real Results from Real Customers
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground">
                Join 500+ SaaS founders who trust Churnaizer to protect their revenue
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <Card className="bg-card border border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-sm sm:text-base">
                      SC
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Sarah Chen</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Founder @ TaskFlow</div>
                      <div className="text-xs text-muted-foreground">SaaS with 50k+ users</div>
                    </div>
                  </div>
                  <blockquote className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    "Churnaizer helped us reduce churn by 47% in just 3 months. The AI predictions are incredibly accurate and the automated emails feel personal and timely."
                  </blockquote>
                  <div className="text-xs sm:text-sm font-medium text-primary">
                    📉 Churn reduced by 47% • 💰 $240k revenue saved
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-sm sm:text-base">
                      MR
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Marcus Rodriguez</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">CEO @ DataSync Pro</div>
                      <div className="text-xs text-muted-foreground">B2B SaaS • $2M ARR</div>
                    </div>
                  </div>
                  <blockquote className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    "Finally, a churn prediction tool that actually works! We've saved over $180k in revenue since implementing Churnaizer 6 months ago."
                  </blockquote>
                  <div className="text-xs sm:text-sm font-medium text-primary">
                    📈 60% reduction in enterprise churn • 💵 $180k recovered
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border hover:shadow-lg transition-shadow md:col-span-3 lg:col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-sm sm:text-base">
                      JP
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Jessica Park</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Head of Growth @ CloudBase</div>
                      <div className="text-xs text-muted-foreground">Enterprise SaaS • 500+ customers</div>
                    </div>
                  </div>
                  <blockquote className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    "The setup was incredibly easy and we started seeing results within the first week. Our customer success team now gets early warnings about at-risk accounts."
                  </blockquote>
                  <div className="text-xs sm:text-sm font-medium text-primary">
                    ⚡ 3x team efficiency • 🎯 Early risk detection
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Infrastructure Section - Responsive */}
        <section className="bg-muted/30 py-12 sm:py-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                Built with Proven, Secure Infrastructure
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto">
                Churnaizer is engineered using reliable, scalable, and privacy-first tools trusted by high-growth SaaS teams.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">Supabase</div>
                <div className="text-xs text-muted-foreground">Edge Functions & Database</div>
              </div>
              
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">Netlify</div>
                <div className="text-xs text-muted-foreground">Ultra-fast SDK Hosting</div>
              </div>
              
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">Custom AI</div>
                <div className="text-xs text-muted-foreground">92% Accuracy Engine</div>
              </div>
              
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">Razorpay</div>
                <div className="text-xs text-muted-foreground">Secure Payments</div>
              </div>
              
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">GDPR Ready</div>
                <div className="text-xs text-muted-foreground">EU Compliant</div>
              </div>
              
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">SSL Encrypted</div>
                <div className="text-xs text-muted-foreground">End-to-End Security</div>
              </div>
              
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">Render</div>
                <div className="text-xs text-muted-foreground">AI Model Deployment</div>
              </div>
              
              <div className="text-center group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="font-semibold text-xs sm:text-sm">Privacy First</div>
                <div className="text-xs text-muted-foreground">No PII Required</div>
              </div>
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mx-auto">
                🔒 100% privacy-first by design. Built using Supabase, Render, and Netlify — all encrypted, 
                scalable, and developer-trusted platforms.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section - Responsive */}
        <section className="py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"></div>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Start Predicting Churn Today
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto">
              Join 10+ SaaS founders who use Churnaizer to retain customers and grow revenue.
            </p>
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base px-6 sm:px-8">
                {user ? "Go to Dashboard" : "Start Free – Get SDK Code"}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer - Responsive */}
        <footer className="border-t bg-card">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Logo size="sm" />
                <span className="text-xs sm:text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-xs sm:text-sm">
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/integration" className="text-muted-foreground hover:text-primary transition-colors">SDK Docs</Link>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Dashboard Login</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;

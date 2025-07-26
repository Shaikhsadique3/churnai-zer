
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
        description="Install our SDK to track churn risk in real time. Used by 10+ SaaS teams. GDPR-ready and developer-friendly."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <AnnouncementBanner />
        {/* Sticky Navigation */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            {/* Mobile-first: Stack logo and CTA vertically on small screens */}
            <div className="flex flex-col mobile-sm:space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {/* Logo and Brand */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Logo size="md" />
                  <h1 className="text-xl mobile-sm:text-lg lg:text-2xl font-bold text-foreground">Churnaizer</h1>
                </div>
                {/* Secondary nav for larger screens */}
                <div className="hidden lg:flex items-center space-x-4">
                  <Link to="/blog" className="text-foreground/70 hover:text-foreground font-medium">
                    Blog
                  </Link>
                  <Link to="/integration" className="text-foreground/70 hover:text-foreground font-medium">
                    SDK Setup
                  </Link>
                </div>
              </div>
              
              {/* CTA Section - Below logo on mobile, right side on desktop */}
              <div className="flex flex-col mobile-sm:space-y-2 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 sm:space-x-3 lg:justify-end">
                {user ? (
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">Dashboard</Button>
                  </Link>
                ) : (
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                      Start Free
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Code className="h-4 w-4" />
              Real-Time Churn Prediction SDK
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Predict and Prevent SaaS Churn in 
              <span className="text-primary"> Real-Time</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect your product to Churnaizer SDK and unlock AI-powered churn predictions, 
              risk scoring, and retention triggers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                  {user ? "Go to Dashboard" : "Start Free – Get SDK Code"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/integration">
                <Button variant="outline" size="lg">
                  View Integration Guide
                </Button>
              </Link>
            </div>
            
            {/* Hero Visual */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
              <div className="bg-muted rounded p-3 text-left text-sm font-mono">
                <div className="text-muted-foreground mb-2">// Add to your app</div>
                <div><span className="text-primary">import</span> Churnaizer <span className="text-primary">from</span> <span className="text-amber-600">'churnaizer-sdk'</span>;</div>
                <div className="mt-1">Churnaizer.<span className="text-blue-600">track</span>(<span className="text-amber-600">'user_action'</span>);</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - SDK Focus */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Track, Predict, and Retain with 1 Line of Code
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our lightweight SDK integrates seamlessly with your SaaS product
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Churn Prediction</CardTitle>
                <CardDescription>
                  AI analyzes user behavior patterns to predict churn risk instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    92% prediction accuracy
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Live risk scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Behavioral insights
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & GDPR-Ready SDK</CardTitle>
                <CardDescription>
                  Privacy-first design with enterprise-grade security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    GDPR compliant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    No PII required
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>One-Click Integration</CardTitle>
                <CardDescription>
                  Get started in minutes with our developer-friendly SDK
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    2-minute setup
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Framework agnostic
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Auto-updates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Three simple steps to start predicting churn
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Paste SDK Code</h3>
                <p className="text-muted-foreground">
                  Add our lightweight SDK to your app with one line of code
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Users</h3>
                <p className="text-muted-foreground">
                  SDK automatically tracks user behavior and engagement patterns
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">See Predictions</h3>
                <p className="text-muted-foreground">
                  View real-time churn predictions in your dashboard
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Trusted by SaaS teams around the world
              </h2>
              <p className="text-xl text-muted-foreground">
                Join 10+ founders who use Churnaizer to retain customers
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Sarah Chen</div>
                      <div className="text-sm text-muted-foreground">Founder, DataFlow SaaS</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "Churnaizer helped us reduce churn by 40% in just 2 months. The SDK integration was seamless."
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Michael Rodriguez</div>
                      <div className="text-sm text-muted-foreground">CTO, TechStart</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "The predictions are incredibly accurate. We can now proactively reach out to at-risk customers."
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Emily Watson</div>
                      <div className="text-sm text-muted-foreground">Head of Product, CloudCo</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "Setup took 5 minutes. The real-time insights have transformed our retention strategy."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Infrastructure Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Built with Proven, Secure Infrastructure
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Churnaizer is engineered using reliable, scalable, and privacy-first tools trusted by high-growth SaaS teams.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">Supabase</div>
                <div className="text-xs text-muted-foreground">Edge Functions & Database</div>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">Netlify</div>
                <div className="text-xs text-muted-foreground">Ultra-fast SDK Hosting</div>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">Custom AI</div>
                <div className="text-xs text-muted-foreground">92% Accuracy Engine</div>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">Razorpay</div>
                <div className="text-xs text-muted-foreground">Secure Payments</div>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">GDPR Ready</div>
                <div className="text-xs text-muted-foreground">EU Compliant</div>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">SSL Encrypted</div>
                <div className="text-xs text-muted-foreground">End-to-End Security</div>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">Render</div>
                <div className="text-xs text-muted-foreground">AI Model Deployment</div>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="font-semibold text-sm">Privacy First</div>
                <div className="text-xs text-muted-foreground">No PII Required</div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                🔒 100% privacy-first by design. Built using Supabase, Render, and Netlify — all encrypted, 
                scalable, and developer-trusted platforms.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"></div>
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Reduce Churn?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 10+ SaaS founders using our AI-powered retention system.
            </p>
            <Link to="/integration">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View SDK Documentation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-card">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Logo size="sm" />
                <span className="text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-sm">
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

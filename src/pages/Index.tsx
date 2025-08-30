import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Upload, Brain, Shield, Zap, CheckCircle, Users, BarChart3, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";
import { DynamicHead } from "@/components/common/DynamicHead";

const Index = () => {
  const { user } = useAuth();

  return (
    <>
      <DynamicHead 
        title="Churnaizer – Cancel-Intent Predictor for SaaS"
        description="Upload your customer data CSV and get AI-powered churn predictions. Identify at-risk customers before they cancel. No SDK required."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Churnaizer</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="sm">Start Free Prediction</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              94% Prediction Accuracy
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Predict Customer Churn 
              <span className="text-primary block sm:inline"> Before It Happens</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload your customer data CSV and get instant AI-powered churn predictions. 
              Identify at-risk customers and take action before they cancel.
            </p>
            
            {/* Value Props */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">94%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">5min</div>
                <div className="text-sm text-muted-foreground">Setup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">No SDK</div>
                <div className="text-sm text-muted-foreground">Required</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">$240k+</div>
                <div className="text-sm text-muted-foreground">Saved</div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to={user ? "/csv-upload" : "/auth"}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8">
                  Upload CSV & Get Predictions
                  <Upload className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8">
                View Sample Report
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-8">
              No credit card required • 100 predictions included • Results in minutes
            </p>
            
            {/* CSV Preview */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
              <div className="bg-muted rounded p-4 text-left text-sm font-mono overflow-x-auto">
                <div className="text-muted-foreground mb-2">// Sample CSV format</div>
                <div className="text-blue-600">user_id,plan,last_login,avg_session,billing_status</div>
                <div className="text-muted-foreground">user_123,Pro,2024-01-15,25,Active</div>
                <div className="text-muted-foreground">user_456,Free,2023-12-20,8,Overdue</div>
                <div className="text-muted-foreground">user_789,Enterprise,2024-01-20,45,Active</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Predict Churn
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload data, get predictions, save customers - all without any technical integration
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>📁 CSV Upload</CardTitle>
                <CardDescription>
                  Simply upload your customer data and get instant predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Drag & drop CSV files
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Auto-detect columns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Secure processing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>🎯 AI Predictions</CardTitle>
                <CardDescription>
                  Advanced machine learning models analyze customer behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Risk scoring (0-100)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Churn reasons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Action recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>📊 Actionable Reports</CardTitle>
                <CardDescription>
                  Get detailed reports with visualizations and next steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Visual dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Export to CSV/PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    Priority customer lists
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                How It Works (3 Simple Steps)
              </h2>
              <p className="text-xl text-muted-foreground">
                From CSV upload to actionable insights in minutes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center relative">
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Your Data</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a CSV with customer data: user_id, plan, login activity, billing status, and usage metrics.
                </p>
                <div className="bg-card rounded-lg p-3 text-xs font-mono text-left border">
                  user_id,plan,last_login,billing_status
                </div>
                
                {/* Connection line */}
                <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-primary/30"></div>
              </div>
              
              <div className="text-center relative">
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Our machine learning models analyze patterns and calculate churn probability for each customer.
                </p>
                <div className="bg-card rounded-lg p-3 text-xs font-mono text-left border">
                  🧠 Processing... 94% accuracy
                </div>
                
                <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-primary/30"></div>
              </div>
              
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Take Action</h3>
                <p className="text-muted-foreground mb-4">
                  Get a prioritized list of at-risk customers with specific recommendations for each.
                </p>
                <div className="bg-card rounded-lg p-3 text-xs font-mono text-left border">
                  📧 High Risk: Contact ASAP
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Trusted by Growing SaaS Companies
            </h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of teams already predicting and preventing churn
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-card rounded-lg border">
              <div className="text-3xl font-bold text-primary mb-2">47%</div>
              <div className="text-sm text-muted-foreground">Average churn reduction</div>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border">
              <div className="text-3xl font-bold text-primary mb-2">$240k</div>
              <div className="text-sm text-muted-foreground">Revenue saved per year</div>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Companies using</div>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border">
              <div className="text-3xl font-bold text-primary mb-2">94%</div>
              <div className="text-sm text-muted-foreground">Prediction accuracy</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to Stop Losing Customers?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your customer data now and get instant churn predictions. No setup required.
            </p>
            <Link to={user ? "/csv-upload" : "/auth"}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8">
                Start Free Prediction Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Free forever plan • No credit card required • Instant results
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Logo size="sm" />
                  <span className="font-bold text-foreground">Churnaizer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered churn prediction for SaaS companies.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/features" className="hover:text-primary">Features</Link></li>
                  <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
                  <li><Link to="/docs" className="hover:text-primary">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/about" className="hover:text-primary">About</Link></li>
                  <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
                  <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
                  <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              © 2024 Churnaizer. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
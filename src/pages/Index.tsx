
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex items-center space-x-3">
          <Logo size="md" />
          <h1 className="text-2xl font-bold text-foreground">Churnaizer</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="relative">
          <h2 className="text-6xl font-bold text-foreground mb-6">
            Predict & Prevent Customer Churn
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
        </div>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Tiger-sharp AI insights for SaaS founders. Track users, predict risk levels, 
          and get proactive recommendations to keep your customers engaged.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button size="lg">
              {user ? "Go to Dashboard" : "Start Free Trial"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center text-foreground mb-4">
          Everything you need to reduce churn
        </h3>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Proactive protection for your customer base
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-foreground">AI-Powered Predictions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Advanced machine learning algorithms analyze user behavior to predict churn risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Real-time churn scoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Risk level classification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Behavioral pattern analysis
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-foreground">User Tracking</CardTitle>
              <CardDescription className="text-muted-foreground">
                Comprehensive dashboard to monitor all your users and their engagement levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  CSV bulk upload
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  API integration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Real-time updates
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-foreground">Weekly Reports</CardTitle>
              <CardDescription className="text-muted-foreground">
                Automated email reports with actionable insights about your customer base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Risk level summaries
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Trend analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Action recommendations
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-4xl font-bold text-secondary-foreground mb-6">
            Ready to reduce churn?
          </h3>
          <p className="text-xl text-secondary-foreground/80 mb-8">
            Join hundreds of SaaS founders who use Churnaizer to protect their customer base.
          </p>
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
              {user ? "Go to Dashboard" : "Start Free Trial"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
            </div>
            <div className="flex space-x-4 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

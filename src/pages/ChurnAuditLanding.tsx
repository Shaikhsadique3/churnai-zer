import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, BarChart3, TrendingUp, Users, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ChurnAuditLanding = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Upload your customer data,
            <br />
            <span className="text-primary">get a churn audit instantly</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover which customers are at risk of churning with our AI-powered analysis. 
            Get actionable insights to improve retention and reduce churn.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 h-auto"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/upload')}
          >
            <Upload className="mr-2 h-5 w-5" />
            Start Your Free Audit
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Risk Analysis</h3>
            <p className="text-muted-foreground">
              Identify high, medium, and low-risk customers with AI-powered churn prediction models.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Actionable Insights</h3>
            <p className="text-muted-foreground">
              Get specific recommendations and retention strategies tailored to your customer data.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Customer Segmentation</h3>
            <p className="text-muted-foreground">
              Understand your customer segments and their unique churn patterns and behaviors.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Data</h3>
              <p className="text-muted-foreground">
                Upload your customer CSV file with usage, billing, and engagement data.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our machine learning models analyze your data to predict churn risk.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Your Report</h3>
              <p className="text-muted-foreground">
                Receive a detailed report with insights and actionable recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card p-8 rounded-lg border shadow-sm text-center mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Free Report</h3>
              <div className="text-3xl font-bold text-primary mb-4">$0</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center"><Shield className="h-4 w-4 text-green-500 mr-2" />Risk distribution overview</li>
                <li className="flex items-center"><Shield className="h-4 w-4 text-green-500 mr-2" />Top churn reasons</li>
                <li className="flex items-center"><Shield className="h-4 w-4 text-green-500 mr-2" />Top 10 high-risk customers</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/upload')}>
                Get Free Report
              </Button>
            </div>

            <div className="border-2 border-primary rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Full Report</h3>
              <div className="text-3xl font-bold text-primary mb-4">$99</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />Everything in Free</li>
                <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />Detailed customer segmentation</li>
                <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />Industry benchmarks</li>
                <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />90-day action plan</li>
                <li className="flex items-center"><Zap className="h-4 w-4 text-green-500 mr-2" />Retention playbook</li>
              </ul>
              <Button className="w-full" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/upload')}>
                Start Free, Upgrade Later
              </Button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Reduce Your Churn?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of companies using our churn audit service to improve retention.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 h-auto"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/upload')}
          >
            <Upload className="mr-2 h-5 w-5" />
            Get Your Free Audit Now
          </Button>
        </div>
      </div>
    </div>
  );
};
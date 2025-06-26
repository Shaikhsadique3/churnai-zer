
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">ChurnGuard Lite</h1>
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
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Predict & Prevent Customer Churn
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Help SaaS founders predict and reduce churn using AI-powered insights. 
          Track users, predict risk levels, and get weekly reports to keep your customers engaged.
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
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to reduce churn
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>AI-Powered Predictions</CardTitle>
              <CardDescription>
                Advanced machine learning algorithms analyze user behavior to predict churn risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time churn scoring</li>
                <li>• Risk level classification</li>
                <li>• Behavioral pattern analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>User Tracking</CardTitle>
              <CardDescription>
                Comprehensive dashboard to monitor all your users and their engagement levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• CSV bulk upload</li>
                <li>• API integration</li>
                <li>• Real-time updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Weekly Reports</CardTitle>
              <CardDescription>
                Automated email reports with actionable insights about your customer base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Risk level summaries</li>
                <li>• Trend analysis</li>
                <li>• Action recommendations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to reduce churn?
          </h3>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of SaaS founders who use ChurnGuard to keep their customers.
          </p>
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button size="lg" variant="secondary">
              {user ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;

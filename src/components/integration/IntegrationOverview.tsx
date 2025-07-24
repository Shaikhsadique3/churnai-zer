import { useState } from "react";
import { ArrowRight, CheckCircle, Code, Shield, Users, Zap, Globe, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APIKeysSection } from "./APIKeysSection";
import { ApiTestComponent } from "@/components/dashboard/ApiTestComponent";

interface IntegrationOverviewProps {
  apiKeys: any[];
  isLoading: boolean;
  newKeyName: string;
  setNewKeyName: (name: string) => void;
  onCreateKey: (name: string) => void;
  onCopyKey: (key: string) => void;
  isCreating: boolean;
}

export const IntegrationOverview = ({
  apiKeys,
  isLoading,
  newKeyName,
  setNewKeyName,
  onCreateKey,
  onCopyKey,
  isCreating
}: IntegrationOverviewProps) => {
  const isConnected = apiKeys && apiKeys.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Globe className="h-4 w-4" />
          Website Integration
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Connect your site in minutes
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Start tracking churn risk in real-time with our lightweight SDK. 
          Get instant predictions and insights for every user interaction.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Badge variant="secondary" className="gap-2">
            <Shield className="h-4 w-4" />
            Used by 10+ SaaS teams
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Data encrypted & secure
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <Zap className="h-4 w-4" />
            GDPR-ready
          </Badge>
        </div>
      </div>

      {/* SDK Status Card */}
      <Card className={`border-2 ${isConnected ? 'border-green-200 bg-green-50/50' : 'border-yellow-200 bg-yellow-50/50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <CardTitle className="text-lg">
                  SDK Status: {isConnected ? 'Connected' : 'Not Connected'}
                </CardTitle>
                <CardDescription>
                  {isConnected 
                    ? 'Your integration is active and ready to track users'
                    : 'Set up your API keys to start tracking churn predictions'
                  }
                </CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link to="/integration/setup">
                {isConnected ? 'View Setup' : 'Get Started'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>1. Upload Your Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Import your user behavior via CSV or integrate our lightweight SDK
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>2. AI Predicts Churn Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Instantly segment users by churn likelihood with our AI models
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>3. Retain Smarter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Take action with psychology-based email & automation playbooks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Who It's For */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Who It's For</CardTitle>
          <CardDescription>
            If churn is hurting your growth, Churnaizer gives you clarity, predictions, and automation — all in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">SaaS Founders</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Customer Success Teams</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Product Managers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Marketing Ops Teams</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What You'll Get */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">What You'll Get</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">AI-Powered Churn Predictions</h4>
                  <p className="text-sm text-muted-foreground">See who's about to leave, before it happens</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Insights Dashboard</h4>
                  <p className="text-sm text-muted-foreground">Visual breakdown of risk levels, usage, support trends</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Smart Retention Campaigns</h4>
                  <p className="text-sm text-muted-foreground">Auto-generated emails using behavior psychology</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Retention Playbook Templates</h4>
                  <p className="text-sm text-muted-foreground">Proven strategies for every churn trigger</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* API Test Component */}
          <ApiTestComponent />
        </div>
        
        <div className="space-y-6">
          {/* API Keys Section */}
          <APIKeysSection
            apiKeys={apiKeys}
            isLoading={isLoading}
            newKeyName={newKeyName}
            setNewKeyName={setNewKeyName}
            onCreateKey={onCreateKey}
            onCopyKey={onCopyKey}
            isCreating={isCreating}
          />

          {/* Trust & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Why Trust Churnaizer?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Powered by secure infrastructure (Supabase + Resend)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>No shady tracking — we only use your data to help you win back customers</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Backed by real founders building in public</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Emails sent via nexa@churnaizer.com using trusted APIs</span>
              </div>
              <div className="pt-2">
                <Link to="/privacy" className="text-primary hover:underline text-sm">
                  View Privacy Policy →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Ready to get started?</h3>
              <p className="text-sm opacity-90 mb-4">
                Be the first to predict churn like a pro — before your next renewal cycle.
              </p>
              <Button variant="secondary" asChild className="w-full">
                <Link to="/integration/setup">
                  Go to SDK Setup Guide
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
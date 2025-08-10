
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, Code, Shield, Users, Zap, Globe, Activity, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APIKeysSection } from "./APIKeysSection";
import { TestIntegration } from "./TestIntegration";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [integrationStatus, setIntegrationStatus] = useState<{
    status: 'unknown' | 'success' | 'fail';
    lastCheck?: string;
    website?: string;
    loading: boolean;
  }>({ status: 'unknown', loading: true });

  const isConnected = apiKeys && apiKeys.length > 0;

  // Check integration status with auto-refresh
  useEffect(() => {
    const checkIntegrationStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('integrations')
          .select('*')
          .eq('founder_id', user.id)
          .eq('status', 'success')
          .order('checked_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setIntegrationStatus({
            status: 'success',
            lastCheck: data.checked_at,
            website: data.website,
            loading: false
          });
        } else {
          setIntegrationStatus({
            status: 'fail',
            loading: false
          });
        }
      } catch (error) {
        console.error('Error checking integration status:', error);
        setIntegrationStatus({
          status: 'unknown',
          loading: false
        });
      }
    };

    checkIntegrationStatus();
    
    // Check every 30 seconds for real-time updates
    const interval = setInterval(checkIntegrationStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusDisplay = () => {
    if (integrationStatus.loading) {
      return {
        icon: <RefreshCw className="h-3 h-3 animate-spin" />,
        text: 'Checking...',
        color: 'bg-yellow-200 border-yellow-300 text-yellow-800'
      };
    }

    switch (integrationStatus.status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: `✅ SDK Active${integrationStatus.website ? ` on ${integrationStatus.website}` : ''}`,
          color: 'bg-green-200 border-green-300 text-green-800'
        };
      case 'fail':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: '❌ SDK Not Detected',
          color: 'bg-red-200 border-red-300 text-red-800'
        };
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Status Unknown',
          color: 'bg-gray-200 border-gray-300 text-gray-800'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Globe className="h-4 w-4" />
          Auto-Integration SDK v1.1.0
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Zero-click integration
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Add our SDK to your site and get instant integration confirmation. 
          No manual testing required - status updates automatically.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Badge variant="secondary" className="gap-2">
            <Shield className="h-4 w-4" />
            Auto-verified integrations
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Real-time status tracking
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <Zap className="h-4 w-4" />
            Enhanced v1.1.0 SDK
          </Badge>
        </div>
      </div>

      {/* Enhanced SDK Status Card */}
      <Card className={`border-2 ${statusDisplay.color.includes('green') ? 'border-green-200 bg-green-50/50' : 
                      statusDisplay.color.includes('red') ? 'border-red-200 bg-red-50/50' : 
                      'border-yellow-200 bg-yellow-50/50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                integrationStatus.status === 'success' ? 'bg-green-500' : 
                integrationStatus.status === 'fail' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {statusDisplay.icon}
                  SDK Status: {statusDisplay.text}
                </CardTitle>
                <CardDescription>
                  {integrationStatus.status === 'success' && integrationStatus.lastCheck && (
                    `Auto-verified: ${new Date(integrationStatus.lastCheck).toLocaleString()}`
                  )}
                  {integrationStatus.status === 'fail' && (
                    'Add the embed code below to complete integration. Status updates automatically.'
                  )}
                  {integrationStatus.status === 'unknown' && (
                    'Unable to verify integration status. Check your connection.'
                  )}
                </CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link to="/integration">
                {integrationStatus.status === 'success' ? 'View Details' : 'Get Embed Code'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>1. Auto-Integration SDK</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              SDK automatically verifies connection when loaded. No manual testing required.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>2. Real-time Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Dashboard updates every 30 seconds with live integration status and console feedback.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>3. Smart Churn Prevention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI-powered predictions with automated retention campaigns once integrated.
            </p>
          </CardContent>
        </Card>
      </div>

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
                  <h4 className="font-medium">Instant Integration Confirmation</h4>
                  <p className="text-sm text-muted-foreground">See ✅/❌ status immediately after adding SDK to your site</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Browser Console Feedback</h4>
                  <p className="text-sm text-muted-foreground">Clear success/error messages in your website's console</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Auto-Refreshing Dashboard</h4>
                  <p className="text-sm text-muted-foreground">Status updates every 30 seconds without page refresh</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">AI Churn Predictions</h4>
                  <p className="text-sm text-muted-foreground">Once integrated, start getting churn risk assessments</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Auto Integration Status Component */}
          <TestIntegration />
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
                Auto-Integration v1.1.0
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Automatic integration verification on page load</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Real-time status updates (30s refresh)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Console feedback for developers</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Admin logging and monitoring</span>
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
              <h3 className="font-semibold mb-2">Ready for auto-integration?</h3>
              <p className="text-sm opacity-90 mb-4">
                Get your embed code with automatic status verification.
              </p>
              <Button variant="secondary" asChild className="w-full">
                <Link to="/integration">
                  Get Auto-Integration Code
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

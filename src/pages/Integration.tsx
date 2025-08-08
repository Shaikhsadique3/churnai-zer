
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimplifiedSDKIntegration } from "@/components/integration/SimplifiedSDKIntegration";
import { StepByStepGuide } from "@/components/integration/StepByStepGuide";
import { SmartIntegrationTest } from "@/components/integration/SmartIntegrationTest";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Shield, 
  Zap, 
  CheckCircle2, 
  Code2, 
  Smartphone, 
  Globe,
  ArrowRight,
  PlayCircle
} from "lucide-react";

const Integration = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, [user]);

  const fetchApiKey = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setApiKey(data.key);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Globe className="w-4 h-4" />
          Website Integration
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Connect Your Website
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start tracking churn risk in real-time with our lightweight SDK. 
          Get instant predictions and insights for every user interaction.
        </p>

        {/* Status Card */}
        <Card className={`max-w-md mx-auto border-2 ${
          isConnected 
            ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
            : 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-semibold">
                SDK Status: {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {isConnected 
                ? 'Your integration is active and tracking users'
                : 'Set up your SDK to start tracking churn predictions'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="pb-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Easy Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Add one script tag to your website. No complex setup required.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="pb-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Real-time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Instant churn predictions as users interact with your app.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="pb-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Privacy First</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              GDPR compliant with secure data handling and encryption.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Integration Tabs */}
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="quick-setup" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10">
            <TabsTrigger 
              value="quick-setup" 
              className="flex items-center gap-2 py-3 md:py-2 text-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Quick Setup</span>
            </TabsTrigger>
            <TabsTrigger 
              value="step-by-step" 
              className="flex items-center gap-2 py-3 md:py-2 text-sm"
            >
              <Code2 className="w-4 h-4" />
              <span>Step-by-Step</span>
            </TabsTrigger>
            <TabsTrigger 
              value="test-integration" 
              className="flex items-center gap-2 py-3 md:py-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Test SDK</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="quick-setup" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  Quick Setup Guide
                </CardTitle>
                <CardDescription>
                  Get started with Churnaizer in under 5 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimplifiedSDKIntegration />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="step-by-step" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Detailed Integration
                </CardTitle>
                <CardDescription>
                  Complete implementation guide with code examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StepByStepGuide apiKey={apiKey} onCopyCode={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="test-integration" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Test Your Integration
                </CardTitle>
                <CardDescription>
                  Verify that your SDK is working correctly with live data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SmartIntegrationTest />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Trust Section */}
      <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Trusted by Growing SaaS Companies
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join founders who reduced churn by up to 40% using our AI-powered predictions 
              and automated retention campaigns.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Badge variant="secondary" className="gap-2 py-2 px-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>99.9% Uptime</span>
              </Badge>
              <Badge variant="secondary" className="gap-2 py-2 px-4">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>SOC 2 Compliant</span>
              </Badge>
              <Badge variant="secondary" className="gap-2 py-2 px-4">
                <Smartphone className="w-4 h-4 text-purple-500" />
                <span>Mobile Optimized</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integration;


import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimplifiedSDKIntegration } from "@/components/integration/SimplifiedSDKIntegration";
import { StepByStepGuide } from "@/components/integration/StepByStepGuide";
import { SmartIntegrationTest } from "@/components/integration/SmartIntegrationTest";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Integration = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>("");

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
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const handleCopyCode = (code: string) => {
    console.log('Code copied:', code);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Website Integration</h1>
        <p className="text-muted-foreground">
          Set up the Churnaizer SDK on your website to start tracking user behavior and predicting churn.
        </p>
      </div>

      <Tabs defaultValue="quick-setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-setup">Quick Setup</TabsTrigger>
          <TabsTrigger value="step-by-step">Step-by-Step</TabsTrigger>
          <TabsTrigger value="test-integration">Check SDK</TabsTrigger>
        </TabsList>
      
        <TabsContent value="quick-setup" className="space-y-6">
          <SimplifiedSDKIntegration />
        </TabsContent>
        
        <TabsContent value="step-by-step" className="space-y-6">
          <StepByStepGuide apiKey={apiKey} onCopyCode={handleCopyCode} />
        </TabsContent>
        
        <TabsContent value="test-integration" className="space-y-6">
          <SmartIntegrationTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integration;

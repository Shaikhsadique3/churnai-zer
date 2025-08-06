import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimplifiedSDKIntegration } from "@/components/integration/SimplifiedSDKIntegration";
import { StepByStepGuide } from "@/components/integration/StepByStepGuide";
import { TestIntegration } from "@/components/integration/TestIntegration";
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
    // Handle code copy actions if needed
    console.log('Code copied:', code);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Website Integration</h1>
        <p className="text-muted-foreground">
          Choose your integration approach: Quick setup for experienced developers or detailed step-by-step guide for non-technical founders.
        </p>
      </div>

      <Tabs defaultValue="quick-setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-setup">Quick Setup</TabsTrigger>
          <TabsTrigger value="step-by-step">Step-by-Step Guide</TabsTrigger>
          <TabsTrigger value="test-integration">Test Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick-setup" className="space-y-6">
          <SimplifiedSDKIntegration />
        </TabsContent>
        
        <TabsContent value="step-by-step" className="space-y-6">
          <StepByStepGuide apiKey={apiKey} onCopyCode={handleCopyCode} />
        </TabsContent>
        
        <TabsContent value="test-integration" className="space-y-6">
          <TestIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integration;
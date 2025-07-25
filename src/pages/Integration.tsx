
import { ArrowLeft, Copy, Code, Shield, CheckCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { IntegrationOverview } from "@/components/integration/IntegrationOverview";
import { SimplifiedSDKIntegration } from "@/components/integration/SimplifiedSDKIntegration";

const Integration = () => {
  const { user, signOut } = useAuth();
  const [newKeyName, setNewKeyName] = useState('');
  const queryClient = useQueryClient();
  const location = useLocation();

  const isSetupGuide = location.pathname === '/integration/setup';

  // Show loading or redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the Integration page.</p>
        </div>
      </div>
    );
  }

  // Fetch API keys
  const { data: apiKeys, isLoading, error: apiKeysError } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Create new API key
  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.rpc('generate_api_key');
      if (error) throw error;
      
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user?.id,
          key: data,
          name: name || 'API Key',
        });
      
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewKeyName('');
      toast({
        title: "API key created",
        description: "Your new API key has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };

  const handleLogout = async () => {
    await signOut();
  };

  const primaryApiKey = apiKeys?.[0]?.key || 'your_api_key_here';

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (apiKeysError) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={user?.email || ''}
          onLogout={handleLogout}
        />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Integration</h2>
            <p className="text-muted-foreground mb-4">{apiKeysError.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        userEmail={user?.email || ''}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {isSetupGuide ? (
          <SimplifiedSDKIntegration />
        ) : (
          <IntegrationOverview
            apiKeys={apiKeys || []}
            isLoading={isLoading}
            newKeyName={newKeyName}
            setNewKeyName={setNewKeyName}
            onCreateKey={(name) => createKeyMutation.mutate(name)}
            onCopyKey={copyToClipboard}
            isCreating={createKeyMutation.isPending}
          />
        )}
      </main>
    </div>
  );
};

export default Integration;

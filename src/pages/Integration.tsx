
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { APIKeysSection } from "@/components/integration/APIKeysSection";
import { IntegrationScriptSection } from "@/components/integration/IntegrationScriptSection";
import { APIDocumentationSection } from "@/components/integration/APIDocumentationSection";
import { DeveloperGuide } from "@/components/integration/DeveloperGuide";
import { RequestParametersTable } from "@/components/integration/RequestParametersTable";

const Integration = () => {
  const { user, signOut } = useAuth();
  const [newKeyName, setNewKeyName] = useState('');
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
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

  const handleRegenerateKey = () => {
    if (confirm("Are you sure you want to regenerate your API key? This will invalidate your current key.")) {
      createKeyMutation.mutate('New API Key');
    }
  };

  const primaryApiKey = apiKeys?.[0]?.key || 'your_api_key_here';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        userEmail={user?.email || ''}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">API Integration</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Integrate ChurnGuard with your application using our REST API
          </p>
        </div>

        <APIKeysSection
          apiKeys={apiKeys}
          isLoading={isLoading}
          newKeyName={newKeyName}
          setNewKeyName={setNewKeyName}
          onCreateKey={(name) => createKeyMutation.mutate(name)}
          onCopyKey={copyToClipboard}
          isCreating={createKeyMutation.isPending}
        />

        <DeveloperGuide
          primaryApiKey={primaryApiKey}
          onCopyCode={copyToClipboard}
        />

        <IntegrationScriptSection
          primaryApiKey={primaryApiKey}
          onCopyCode={copyToClipboard}
          onRegenerateKey={handleRegenerateKey}
        />

        <APIDocumentationSection
          primaryApiKey={primaryApiKey}
          onCopyCode={copyToClipboard}
        />

        <RequestParametersTable />
      </main>
    </div>
  );
};

export default Integration;

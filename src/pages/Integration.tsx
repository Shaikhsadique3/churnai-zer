
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">🔗 Website Integration</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Connect ChurnGuard to your website via SDK and API
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${apiKeys && apiKeys.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-muted-foreground">
                {apiKeys && apiKeys.length > 0 ? 'Connected' : 'Setup Required'}
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://churnaizer-sdk.netlify.app/test.html" target="_blank" rel="noopener noreferrer">
                🧪 Test SDK
              </a>
            </Button>
          </div>
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

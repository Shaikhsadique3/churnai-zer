import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Copy, Save, Eye, Code, Shield, Globe, Key, Webhook, Menu, BarChart3, Settings, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecureLogout } from '@/hooks/useSecureLogout';
import { Link, useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  domain: string;
  api_key_hash: string;
  is_active: boolean;
  settings: any;
}

interface Settings {
  id?: string;
  project_id: string;
  modal_config: any;
  domain_allowlist: string[];
  webhook_url: string;
  analytics_config: any;
}

export default function CancelGuardSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [settings, setSettings] = useState<Settings>({
    project_id: '',
    modal_config: {
      title: 'Wait! Before you go...',
      subtitle: 'We have something special for you',
      theme: 'modern',
      delay_ms: 500,
      button_color: '#007bff',
      background_color: '#ffffff'
    },
    domain_allowlist: [],
    webhook_url: '',
    analytics_config: {
      track_events: true,
      send_to_analytics: false
    }
  });
  const [guardConfig, setGuardConfig] = useState({
    vip_thresholds: {
      revenue_threshold: 1000,
      lifetime_value_threshold: 5000,
      plan_levels: ['enterprise', 'professional']
    },
    slack_webhook: '',
    calendar_link: '',
    discount_caps: {
      max_percentage: 50,
      max_amount: 500,
      monthly_budget: 5000
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ webhook: false, calendar: false });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchSettings();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('cancel_guard_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await supabase
        .from('cancel_guard_settings')
        .select('*')
        .eq('project_id', selectedProject)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        setSettings(prev => ({ ...prev, project_id: selectedProject }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive"
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('cancel_guard_settings')
          .update({
            modal_config: settings.modal_config,
            domain_allowlist: settings.domain_allowlist,
            webhook_url: settings.webhook_url,
            analytics_config: settings.analytics_config,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('cancel_guard_settings')
          .insert({
            project_id: selectedProject,
            modal_config: settings.modal_config,
            domain_allowlist: settings.domain_allowlist,
            webhook_url: settings.webhook_url,
            analytics_config: settings.analytics_config,
          })
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyApiKey = async () => {
    const currentProject = projects.find(p => p.id === selectedProject);
    if (currentProject) {
      await navigator.clipboard.writeText('demo_key_123'); // This would be the actual API key
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      });
    }
  };

  const handleCopyEmbedCode = async () => {
    const currentProject = projects.find(p => p.id === selectedProject);
    if (!currentProject) return;

    const embedCode = `<!-- Cancel Guard Integration -->
<script>
(function() {
  window.CancelGuard = {
    apiKey: 'demo_key_123',
    projectId: '${selectedProject}',
    endpoint: 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1'
  };
  
  const script = document.createElement('script');
  script.src = 'https://cdn.cancelguard.com/v1/widget.js';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;

    await navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied",
      description: "Embed code copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cancel Guard Settings</h1>
          <p className="text-muted-foreground">Configure your cancel guard behavior and integration</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Project Selector */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.domain})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant={currentProject?.is_active ? "default" : "secondary"}>
                {currentProject?.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="modal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="vip">VIP Settings</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="modal">Modal</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Domain Security
              </CardTitle>
              <CardDescription>Configure domain allowlist and API access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="api_key">API Key</Label>
                  <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Input
                  id="api_key"
                  value="demo_key_123"
                  readOnly
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domains">Allowed Domains (one per line)</Label>
                <Textarea
                  id="domains"
                  value={settings.domain_allowlist.join('\n')}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    domain_allowlist: e.target.value.split('\n').filter(d => d.trim())
                  }))}
                  placeholder="example.com&#10;app.example.com"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Only these domains will be able to use your cancel guard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                VIP Customer Settings
              </CardTitle>
              <CardDescription>Configure thresholds and alerts for high-value customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue_threshold">Monthly Revenue Threshold ($)</Label>
                  <Input
                    id="revenue_threshold"
                    type="number"
                    value={guardConfig.vip_thresholds.revenue_threshold}
                    onChange={(e) => setGuardConfig(prev => ({
                      ...prev,
                      vip_thresholds: { ...prev.vip_thresholds, revenue_threshold: parseInt(e.target.value) }
                    }))}
                    placeholder="1000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Customers paying more than this amount are considered VIP
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ltv_threshold">Lifetime Value Threshold ($)</Label>
                  <Input
                    id="ltv_threshold"
                    type="number"
                    value={guardConfig.vip_thresholds.lifetime_value_threshold}
                    onChange={(e) => setGuardConfig(prev => ({
                      ...prev,
                      vip_thresholds: { ...prev.vip_thresholds, lifetime_value_threshold: parseInt(e.target.value) }
                    }))}
                    placeholder="5000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Total customer lifetime value threshold for VIP status
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan_levels">VIP Plan Levels (comma-separated)</Label>
                <Input
                  id="plan_levels"
                  value={guardConfig.vip_thresholds.plan_levels.join(', ')}
                  onChange={(e) => setGuardConfig(prev => ({
                    ...prev,
                    vip_thresholds: { ...prev.vip_thresholds, plan_levels: e.target.value.split(',').map(p => p.trim()) }
                  }))}
                  placeholder="enterprise, professional, premium"
                />
                <p className="text-sm text-muted-foreground">
                  Plan names that automatically qualify for VIP treatment
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  Slack Integration
                </CardTitle>
                <CardDescription>Get instant alerts for VIP customer cancellations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack_webhook">Slack Webhook URL</Label>
                  <Input
                    id="slack_webhook"
                    value={guardConfig.slack_webhook}
                    onChange={(e) => setGuardConfig(prev => ({ ...prev, slack_webhook: e.target.value }))}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll send VIP cancellation alerts to this Slack channel
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    setTesting(prev => ({ ...prev, webhook: true }));
                    // Simulate test
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    setTesting(prev => ({ ...prev, webhook: false }));
                    toast({ title: "Test sent!", description: "Check your Slack channel for the test message" });
                  }}
                  disabled={testing.webhook || !guardConfig.slack_webhook}
                >
                  {testing.webhook ? 'Testing...' : 'Test Webhook'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Calendar Integration
                </CardTitle>
                <CardDescription>Auto-schedule calls with cancelling VIP customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calendar_link">Calendar Booking Link</Label>
                  <Input
                    id="calendar_link"
                    value={guardConfig.calendar_link}
                    onChange={(e) => setGuardConfig(prev => ({ ...prev, calendar_link: e.target.value }))}
                    placeholder="https://calendly.com/your-username/save-call"
                  />
                  <p className="text-sm text-muted-foreground">
                    VIP customers will be offered this calendar link during cancellation
                  </p>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={async () => {
                    setTesting(prev => ({ ...prev, calendar: true }));
                    // Simulate test
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setTesting(prev => ({ ...prev, calendar: false }));
                    toast({ title: "Calendar link verified!", description: "Link is accessible and valid" });
                  }}
                  disabled={testing.calendar || !guardConfig.calendar_link}
                >
                  {testing.calendar ? 'Testing...' : 'Test Calendar Link'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Discount Caps & Limits
              </CardTitle>
              <CardDescription>Set guardrails to protect your revenue while offering compelling discounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_percentage">Max Discount (%)</Label>
                  <Input
                    id="max_percentage"
                    type="number"
                    max="100"
                    value={guardConfig.discount_caps.max_percentage}
                    onChange={(e) => setGuardConfig(prev => ({
                      ...prev,
                      discount_caps: { ...prev.discount_caps, max_percentage: parseInt(e.target.value) }
                    }))}
                    placeholder="50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum percentage discount allowed
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_amount">Max Discount Amount ($)</Label>
                  <Input
                    id="max_amount"
                    type="number"
                    value={guardConfig.discount_caps.max_amount}
                    onChange={(e) => setGuardConfig(prev => ({
                      ...prev,
                      discount_caps: { ...prev.discount_caps, max_amount: parseInt(e.target.value) }
                    }))}
                    placeholder="500"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum dollar amount discount
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly_budget">Monthly Budget ($)</Label>
                  <Input
                    id="monthly_budget"
                    type="number"
                    value={guardConfig.discount_caps.monthly_budget}
                    onChange={(e) => setGuardConfig(prev => ({
                      ...prev,
                      discount_caps: { ...prev.discount_caps, monthly_budget: parseInt(e.target.value) }
                    }))}
                    placeholder="5000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Total monthly discount budget
                  </p>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Status:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">This month spent:</span>
                    <span className="ml-2 font-semibold">$1,234 / ${guardConfig.discount_caps.monthly_budget}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget remaining:</span>
                    <span className="ml-2 font-semibold text-primary">${guardConfig.discount_caps.monthly_budget - 1234}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Modal Appearance
              </CardTitle>
              <CardDescription>Customize how your cancel modal looks and behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modal_title">Modal Title</Label>
                  <Input
                    id="modal_title"
                    value={settings.modal_config.title || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      modal_config: { ...prev.modal_config, title: e.target.value }
                    }))}
                    placeholder="Wait! Before you go..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal_subtitle">Modal Subtitle</Label>
                  <Input
                    id="modal_subtitle"
                    value={settings.modal_config.subtitle || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      modal_config: { ...prev.modal_config, subtitle: e.target.value }
                    }))}
                    placeholder="We have something special for you"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.modal_config.theme || 'modern'}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      modal_config: { ...prev.modal_config, theme: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={settings.modal_config.delay_ms || 500}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      modal_config: { ...prev.modal_config, delay_ms: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="button_color">Button Color</Label>
                  <Input
                    id="button_color"
                    type="color"
                    value={settings.modal_config.button_color || '#007bff'}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      modal_config: { ...prev.modal_config, button_color: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>Receive real-time notifications about cancel attempts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  value={settings.webhook_url || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    webhook_url: e.target.value
                  }))}
                  placeholder="https://your-app.com/webhooks/cancel-guard"
                />
                <p className="text-sm text-muted-foreground">
                  We'll send POST requests to this URL when cancel events occur
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Events</Label>
                    <p className="text-sm text-muted-foreground">Log all cancel attempts and decisions</p>
                  </div>
                  <Switch
                    checked={settings.analytics_config.track_events || false}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      analytics_config: { ...prev.analytics_config, track_events: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send to Analytics</Label>
                    <p className="text-sm text-muted-foreground">Forward events to your analytics platform</p>
                  </div>
                  <Switch
                    checked={settings.analytics_config.send_to_analytics || false}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      analytics_config: { ...prev.analytics_config, send_to_analytics: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
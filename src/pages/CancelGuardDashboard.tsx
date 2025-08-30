import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart3, Settings, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  domain: string;
  is_active: boolean;
  settings: any;
  created_at: string;
  _count?: {
    offers: number;
    decisions: number;
    events: number;
  };
}

interface Offer {
  id: string;
  offer_type: string;
  title: string;
  description: string;
  config: any;
  is_active: boolean;
  priority: number;
}

interface Decision {
  id: string;
  session_id: string;
  customer_id: string;
  decision: string;
  created_at: string;
  offer_shown?: string;
}

export default function CancelGuardDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectData();
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
      if (data && data.length > 0 && !selectedProject) {
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

  const fetchProjectData = async () => {
    if (!selectedProject) return;

    try {
      // Fetch offers
      const { data: offersData, error: offersError } = await supabase
        .from('cancel_guard_offers')
        .select('*')
        .eq('project_id', selectedProject)
        .order('priority');

      if (offersError) throw offersError;
      setOffers(offersData || []);

      // Fetch recent decisions
      const { data: decisionsData, error: decisionsError } = await supabase
        .from('cancel_guard_decisions')
        .select('*')
        .eq('project_id', selectedProject)
        .order('created_at', { ascending: false })
        .limit(10);

      if (decisionsError) throw decisionsError;
      setDecisions(decisionsData || []);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project data",
        variant: "destructive"
      });
    }
  };

  const getOfferTypeColor = (type: string) => {
    const colors = {
      pause: 'bg-blue-500',
      discount: 'bg-green-500',
      downgrade: 'bg-yellow-500',
      concierge: 'bg-purple-500',
      feedback: 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getDecisionColor = (decision: string) => {
    const colors = {
      accepted: 'bg-green-500',
      declined: 'bg-red-500',
      canceled: 'bg-yellow-500'
    };
    return colors[decision as keyof typeof colors] || 'bg-gray-500';
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
          <h1 className="text-3xl font-bold text-foreground">Cancel Guard Dashboard</h1>
          <p className="text-muted-foreground">Smart cancel flow interceptor for churn prevention</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Selector */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Active Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.domain})
                  </option>
                ))}
              </select>
              <Badge variant={currentProject?.is_active ? "default" : "secondary"}>
                {currentProject?.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{offers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {offers.filter(o => o.is_active).length} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Decisions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{decisions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {decisions.filter(d => d.decision === 'accepted').length} accepted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {decisions.length > 0 
                    ? Math.round((decisions.filter(d => d.decision === 'accepted').length / decisions.length) * 100)
                    : 0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">
                  From last 10 interactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Project Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Live</div>
                <p className="text-xs text-muted-foreground">
                  Domain: {currentProject?.domain}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Decisions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Cancel Attempts</CardTitle>
              <CardDescription>Latest customer interactions with cancel guard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decisions.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getDecisionColor(decision.decision)}>
                        {decision.decision}
                      </Badge>
                      <div>
                        <p className="font-medium">Customer: {decision.customer_id || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(decision.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {decisions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent cancel attempts
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Cancel Offers</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Offer
            </Button>
          </div>

          <div className="grid gap-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getOfferTypeColor(offer.offer_type)}>
                        {offer.offer_type}
                      </Badge>
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <Badge variant={offer.is_active ? "default" : "secondary"}>
                        {offer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{offer.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Priority: {offer.priority} • Config: {JSON.stringify(offer.config)}
                  </div>
                </CardContent>
              </Card>
            ))}
            {offers.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No offers configured yet</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Offer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Coming soon - detailed analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics features will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure your cancel guard behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Settings panel will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
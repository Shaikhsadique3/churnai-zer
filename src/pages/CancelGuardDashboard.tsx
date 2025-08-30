import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart3, Settings, Plus, Eye, Edit2, Trash2, Menu, User, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecureLogout } from '@/hooks/useSecureLogout';
import { Link, useNavigate } from 'react-router-dom';

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
  const { secureLogout } = useSecureLogout();
  const navigate = useNavigate();
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

  const NavigationMenu = () => (
    <nav className="space-y-2">
      <Link 
        to="/cancel-guard" 
        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground"
      >
        <BarChart3 className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link 
        to="/offers" 
        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Shield className="h-4 w-4" />
        <span>Offers</span>
      </Link>
      <Link 
        to="/settings" 
        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Settings className="h-4 w-4" />
        <span>Settings</span>
      </Link>
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Cancel Guard</span>
              </div>
              <NavigationMenu />
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Cancel Guard</span>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => secureLogout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 border-r bg-background">
            <div className="flex-1 flex flex-col pt-5 pb-4 px-4">
              <NavigationMenu />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="md:pl-64 flex-1">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Monitor your cancel guard performance</p>
              </div>
              <Button onClick={() => navigate('/offers')}>
                <Plus className="w-4 h-4 mr-2" />
                New Offer
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Manage Offers
                  </CardTitle>
                  <CardDescription>
                    Configure your retention offers and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/offers')} className="w-full">
                    Go to Offers
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Integration Settings
                  </CardTitle>
                  <CardDescription>
                    Configure API keys, domains, and webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/settings')} variant="outline" className="w-full">
                    Go to Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
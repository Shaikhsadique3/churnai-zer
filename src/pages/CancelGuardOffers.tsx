import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit2, Trash2, Save, Menu, Shield, BarChart3, Settings, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecureLogout } from '@/hooks/useSecureLogout';
import { Link, useNavigate } from 'react-router-dom';
import { OfferConfiguration } from '@/components/dashboard/OfferConfiguration';
import { OfferDryRun } from '@/components/dashboard/OfferDryRun';

interface Offer {
  id?: string;
  project_id: string;
  offer_type: string;
  title: string;
  description: string;
  config: any;
  is_active: boolean;
  priority: number;
}

interface Project {
  id: string;
  name: string;
  domain: string;
}

const OFFER_TYPES = [
  { value: 'pause', label: 'Pause Account', description: 'Let users pause their subscription temporarily' },
  { value: 'discount', label: 'Discount Offer', description: 'Provide a discount to retain the customer' },
  { value: 'downgrade', label: 'Plan Downgrade', description: 'Offer a lower-tier plan option' },
  { value: 'concierge', label: 'Concierge Help', description: 'Connect customer with support team' },
  { value: 'feedback', label: 'Feedback Collection', description: 'Gather feedback about cancellation reasons' },
];

export default function CancelGuardOffers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { secureLogout } = useSecureLogout();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultOffer: Offer = {
    project_id: '',
    offer_type: 'pause',
    title: '',
    description: '',
    config: {},
    is_active: true,
    priority: 1,
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchOffers();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('cancel_guard_projects')
        .select('id, name, domain')
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

  const fetchOffers = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await supabase
        .from('cancel_guard_offers')
        .select('*')
        .eq('project_id', selectedProject)
        .order('priority');

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive"
      });
    }
  };

  const handleSaveOffer = async (offer: Offer) => {
    try {
      if (offer.id) {
        // Update existing offer
        const { error } = await supabase
          .from('cancel_guard_offers')
          .update({
            offer_type: offer.offer_type,
            title: offer.title,
            description: offer.description,
            config: offer.config,
            is_active: offer.is_active,
            priority: offer.priority,
          })
          .eq('id', offer.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      } else {
        // Create new offer
        const { error } = await supabase
          .from('cancel_guard_offers')
          .insert({
            project_id: selectedProject,
            offer_type: offer.offer_type,
            title: offer.title,
            description: offer.description,
            config: offer.config,
            is_active: offer.is_active,
            priority: offer.priority,
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Offer created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingOffer(null);
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: "Error",
        description: "Failed to save offer",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('cancel_guard_offers')
        .delete()
        .eq('id', offerId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
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

  const NavigationMenu = () => (
    <nav className="space-y-2">
      <Link 
        to="/cancel-guard" 
        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <BarChart3 className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link 
        to="/offers" 
        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground"
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
                <h1 className="text-3xl font-bold text-foreground">Offers Configuration</h1>
                <p className="text-muted-foreground">Configure retention offers, rules, and preview recommendations</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingOffer({ ...defaultOffer, project_id: selectedProject })}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Offer
                  </Button>
                </DialogTrigger>
                <OfferDialog
                  offer={editingOffer}
                  onSave={handleSaveOffer}
                  onClose={() => {
                    setIsDialogOpen(false);
                    setEditingOffer(null);
                  }}
                />
              </Dialog>
            </div>

            {/* Project Selector */}
            {projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full">
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
                </CardContent>
              </Card>
            )}

            {/* Tabs for different sections */}
            <Tabs defaultValue="offers" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="offers">Active Offers</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="preview">Dry Run Preview</TabsTrigger>
              </TabsList>

              {/* Active Offers Tab */}
              <TabsContent value="offers" className="space-y-4">
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingOffer(offer)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <OfferDialog
                                offer={editingOffer}
                                onSave={handleSaveOffer}
                                onClose={() => setEditingOffer(null)}
                              />
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => offer.id && handleDeleteOffer(offer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{offer.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">Priority</Label>
                            <p className="font-medium">{offer.priority}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Usage Caps</Label>
                            <p className="text-xs">
                              Daily: {offer.config?.daily_cap || 'Unlimited'} | 
                              Monthly: {offer.config?.monthly_cap || 'Unlimited'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Targeting Rules</Label>
                            <p className="text-xs">
                              {offer.config?.targeting_rules?.length || 0} rules configured
                            </p>
                          </div>
                        </div>
                        
                        {/* Offer-specific details */}
                        {offer.offer_type === 'discount' && offer.config?.discount_value && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm font-medium text-green-800">
                              {offer.config.discount_value}
                              {offer.config.discount_type === 'percentage' ? '% off' : '$ off'} 
                              {offer.config.duration_months && ` for ${offer.config.duration_months} months`}
                            </div>
                          </div>
                        )}
                        
                        {offer.offer_type === 'pause' && offer.config?.pause_duration && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-800">
                              {offer.config.pause_duration} day pause
                              {offer.config.max_pauses && ` (max ${offer.config.max_pauses}/year)`}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {offers.length === 0 && selectedProject && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No offers configured yet</p>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => setEditingOffer({ ...defaultOffer, project_id: selectedProject })}>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Your First Offer
                            </Button>
                          </DialogTrigger>
                          <OfferDialog
                            offer={editingOffer}
                            onSave={handleSaveOffer}
                            onClose={() => {
                              setIsDialogOpen(false);
                              setEditingOffer(null);
                            }}
                          />
                        </Dialog>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="configuration">
                {editingOffer ? (
                  <OfferConfiguration
                    offerType={editingOffer.offer_type}
                    config={editingOffer.config}
                    onConfigChange={(config) => 
                      setEditingOffer(prev => prev ? { ...prev, config } : null)
                    }
                  />
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        Select an offer to configure its settings, caps, and targeting rules
                      </p>
                      <Button 
                        onClick={() => setEditingOffer({ ...defaultOffer, project_id: selectedProject })}
                        variant="outline"
                      >
                        Create New Offer
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Dry Run Preview Tab */}
              <TabsContent value="preview">
                <OfferDryRun
                  offers={offers}
                  onRunPreview={async (user) => {
                    // This would integrate with your /decide endpoint
                    console.log('Running preview for user:', user);
                    return {} as any; // Mock for now
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

interface OfferDialogProps {
  offer: Offer | null;
  onSave: (offer: Offer) => void;
  onClose: () => void;
}

function OfferDialog({ offer, onSave, onClose }: OfferDialogProps) {
  const [formData, setFormData] = useState<Offer>(offer || {
    project_id: '',
    offer_type: 'pause',
    title: '',
    description: '',
    config: {},
    is_active: true,
    priority: 1,
  });

  useEffect(() => {
    if (offer) {
      setFormData(offer);
    }
  }, [offer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{formData.id ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
        <DialogDescription>
          Configure a retention offer for your cancel flow
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="offer_type">Offer Type</Label>
          <Select
            value={formData.offer_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, offer_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OFFER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter offer title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the offer"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select
              value={formData.is_active ? 'active' : 'inactive'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="config">Configuration (JSON)</Label>
          <Textarea
            id="config"
            value={JSON.stringify(formData.config, null, 2)}
            onChange={(e) => {
              try {
                const config = JSON.parse(e.target.value);
                setFormData(prev => ({ ...prev, config }));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            placeholder='{"key": "value"}'
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Offer
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
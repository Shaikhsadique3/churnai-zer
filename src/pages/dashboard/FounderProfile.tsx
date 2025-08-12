
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Target,
  TrendingUp,
  BarChart3,
  Edit,
  AlertCircle,
  Shield
} from 'lucide-react';

interface FounderProfileData {
  company_name: string;
  company_website?: string;
  industry: string;
  company_size: string;
  founded_year: number;
  location: string;
  product_description: string;
  target_market: string;
  revenue_model: string;
  monthly_revenue: number;
  pricing_model: string;
  main_competitors?: string;
  current_churn_rate?: number;
  biggest_retention_challenge?: string;
  existing_retention_tools?: string;
  success_metrics?: string;
  onboarding_completed: boolean;
  completed_at?: string;
  created_at: string;
}

const FounderProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FounderProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('founder_profile')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast({
          title: "Error loading profile",
          description: "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = () => {
    navigate('/onboarding');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !profile.onboarding_completed) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
              <p className="text-muted-foreground mb-6">
                Get the most out of Churnaizer by completing your founder profile. 
                This helps us provide personalized insights and recommendations.
              </p>
              <Button onClick={handleCompleteOnboarding} size="lg">
                Complete Onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-blue-700">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-medium">
                Your business data is protected with enterprise-grade security and is only visible to you.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/api/placeholder/80/80" alt="Founder" />
              <AvatarFallback className="text-lg font-semibold">
                {profile.company_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{profile.company_name}</h1>
              <p className="text-muted-foreground">
                {profile.industry} • {profile.company_size}
              </p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Founded {profile.founded_year}
                </div>
                {profile.company_website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <a 
                      href={profile.company_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={handleCompleteOnboarding}
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-xl font-semibold">{profile.company_size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xl font-semibold">
                    ${profile.monthly_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="text-xl font-semibold capitalize">{profile.industry}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-xl font-semibold">
                    {profile.current_churn_rate ? `${profile.current_churn_rate}%` : 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="metrics">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Company Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-semibold">{profile.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <Badge variant="secondary" className="capitalize">{profile.industry}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company Size</p>
                    <p className="font-semibold">{profile.company_size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Founded</p>
                    <p className="font-semibold">{profile.founded_year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{profile.location}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Product Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Product Description</p>
                    <p className="text-sm">{profile.product_description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Market</p>
                    <p className="font-semibold">{profile.target_market}</p>
                  </div>
                  {profile.company_website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a 
                        href={profile.company_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {profile.company_website}
                      </a>
                    </div>
                  )}
                  {profile.main_competitors && (
                    <div>
                      <p className="text-sm text-muted-foreground">Main Competitors</p>
                      <p className="text-sm">{profile.main_competitors}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Revenue & Pricing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${profile.monthly_revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Model</p>
                    <Badge variant="outline" className="capitalize">{profile.revenue_model}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pricing Model</p>
                    <p className="text-sm">{profile.pricing_model}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Market Position</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target Market</p>
                    <p className="font-semibold">{profile.target_market}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Product Description</p>
                    <p className="text-sm">{profile.product_description}</p>
                  </div>
                  {profile.main_competitors && (
                    <div>
                      <p className="text-sm text-muted-foreground">Key Competitors</p>
                      <p className="text-sm">{profile.main_competitors}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Retention Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.current_churn_rate !== undefined ? (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Churn Rate</p>
                      <p className="text-xl font-semibold text-red-600">{profile.current_churn_rate}%</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">Churn Rate</p>
                      <p className="text-sm text-muted-foreground">Not configured yet</p>
                    </div>
                  )}
                  
                  {profile.biggest_retention_challenge && (
                    <div>
                      <p className="text-sm text-muted-foreground">Biggest Challenge</p>
                      <p className="text-sm">{profile.biggest_retention_challenge}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Tools & Strategy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.existing_retention_tools && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Tools</p>
                      <p className="text-sm">{profile.existing_retention_tools}</p>
                    </div>
                  )}
                  
                  {profile.success_metrics && (
                    <div>
                      <p className="text-sm text-muted-foreground">Success Metrics</p>
                      <p className="text-sm">{profile.success_metrics}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {(!profile.current_churn_rate && !profile.biggest_retention_challenge && !profile.existing_retention_tools && !profile.success_metrics) && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Retention Data Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your retention insights to get personalized recommendations.
                  </p>
                  <Button onClick={handleCompleteOnboarding} variant="outline">
                    Add Retention Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FounderProfile;

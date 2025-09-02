import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DateRange } from "react-day-picker";
import { Calendar, Users, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";

interface FeatureAdoptionData {
  feature_name: string;
  total_users: number;
  adoption_percentage: number;
  free_users: number;
  paid_users: number;
}

interface PowerUser {
  user_id: string;
  feature_count: number;
  plan: string;
}

interface AdoptionTrend {
  date: string;
  adoptions: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function FeatureAdoptionDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Fetch feature adoption data
  const { data: featureAdoption, isLoading: loadingFeatures } = useQuery({
    queryKey: ['feature-adoption', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('feature_events')
        .select('feature_name, user_id, plan')
        .eq('owner_id', user.id);

      if (dateRange?.from) {
        query = query.gte('event_date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('event_date', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate adoption metrics
      const featureMap = new Map<string, { users: Set<string>, free: Set<string>, paid: Set<string> }>();
      
      data?.forEach(event => {
        if (!featureMap.has(event.feature_name)) {
          featureMap.set(event.feature_name, { users: new Set(), free: new Set(), paid: new Set() });
        }
        const feature = featureMap.get(event.feature_name)!;
        feature.users.add(event.user_id);
        
        if (event.plan && event.plan.toLowerCase() !== 'free') {
          feature.paid.add(event.user_id);
        } else {
          feature.free.add(event.user_id);
        }
      });

      // Get total unique users
      const allUsers = new Set<string>();
      data?.forEach(event => allUsers.add(event.user_id));
      const totalUsers = allUsers.size;

      const result: FeatureAdoptionData[] = Array.from(featureMap.entries()).map(([feature_name, stats]) => ({
        feature_name,
        total_users: stats.users.size,
        adoption_percentage: totalUsers > 0 ? (stats.users.size / totalUsers) * 100 : 0,
        free_users: stats.free.size,
        paid_users: stats.paid.size,
      }));

      return result.sort((a, b) => b.adoption_percentage - a.adoption_percentage);
    },
    enabled: !!user,
  });

  // Fetch power users data
  const { data: powerUsers, isLoading: loadingPowerUsers } = useQuery({
    queryKey: ['power-users', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('feature_events')
        .select('user_id, feature_name, plan')
        .eq('owner_id', user.id);

      if (dateRange?.from) {
        query = query.gte('event_date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('event_date', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate feature count per user
      const userFeatures = new Map<string, { features: Set<string>, plan: string }>();
      
      data?.forEach(event => {
        if (!userFeatures.has(event.user_id)) {
          userFeatures.set(event.user_id, { features: new Set(), plan: event.plan || 'Free' });
        }
        userFeatures.get(event.user_id)!.features.add(event.feature_name);
      });

      const result: PowerUser[] = Array.from(userFeatures.entries()).map(([user_id, stats]) => ({
        user_id,
        feature_count: stats.features.size,
        plan: stats.plan,
      }));

      return result.sort((a, b) => b.feature_count - a.feature_count).slice(0, 10);
    },
    enabled: !!user,
  });

  // Fetch adoption trends
  const { data: adoptionTrends, isLoading: loadingTrends } = useQuery({
    queryKey: ['adoption-trends', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('feature_events')
        .select('event_date')
        .eq('owner_id', user.id);

      if (dateRange?.from) {
        query = query.gte('event_date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('event_date', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by date
      const dateMap = new Map<string, number>();
      data?.forEach(event => {
        const date = format(new Date(event.event_date), 'yyyy-MM-dd');
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      });

      const result: AdoptionTrend[] = Array.from(dateMap.entries()).map(([date, adoptions]) => ({
        date,
        adoptions,
      }));

      return result.sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!user,
  });

  const totalEvents = featureAdoption?.reduce((sum, f) => sum + f.total_users, 0) || 0;
  const totalFeatures = featureAdoption?.length || 0;
  const avgAdoption = featureAdoption?.length > 0 
    ? featureAdoption.reduce((sum, f) => sum + f.adoption_percentage, 0) / featureAdoption.length 
    : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Feature Adoption Dashboard</h1>
          <p className="text-muted-foreground">Please log in to view your dashboard</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Adoption Dashboard</h1>
            <p className="text-muted-foreground">Track how users engage with your product features</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/upload'}>
              Upload CSV Data
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
              View Pricing
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Features Tracked</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeatures}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Adoption</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAdoption.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Power Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{powerUsers?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="features" className="space-y-4">
          <TabsList>
            <TabsTrigger value="features">Feature Adoption</TabsTrigger>
            <TabsTrigger value="plans">Adoption by Plan</TabsTrigger>
            <TabsTrigger value="trends">Adoption Trends</TabsTrigger>
            <TabsTrigger value="users">Power Users</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption Rates</CardTitle>
                <CardDescription>Percentage of users adopting each feature</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFeatures ? (
                  <div>Loading feature data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={featureAdoption}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="feature_name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Adoption Rate']} />
                      <Bar dataKey="adoption_percentage" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adoption by Plan Type</CardTitle>
                <CardDescription>Feature adoption split between Free and Paid users</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFeatures ? (
                  <div>Loading plan data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={featureAdoption}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="feature_name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="free_users" stackId="a" fill="hsl(var(--muted))" name="Free Users" />
                      <Bar dataKey="paid_users" stackId="a" fill="hsl(var(--primary))" name="Paid Users" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Adoption Trends</CardTitle>
                <CardDescription>Feature adoption events over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTrends ? (
                  <div>Loading trend data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={adoptionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="adoptions" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Power Users</CardTitle>
                <CardDescription>Users with highest feature adoption</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPowerUsers ? (
                  <div>Loading user data...</div>
                ) : (
                  <div className="space-y-4">
                    {powerUsers?.map((user, index) => (
                      <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">User {user.user_id.slice(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">{user.plan} Plan</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{user.feature_count}</p>
                          <p className="text-sm text-muted-foreground">features used</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
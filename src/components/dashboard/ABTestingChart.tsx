import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ABTestData {
  group: string;
  attempts: number;
  saves: number;
  save_rate: number;
  revenue_saved: number;
  avg_offer_score: number;
}

interface ABTestTrend {
  date: string;
  group_a_rate: number;
  group_b_rate: number;
}

export const ABTestingChart = () => {
  const { user } = useAuth();
  const [abData, setAbData] = useState<ABTestData[]>([]);
  const [trendData, setTrendData] = useState<ABTestTrend[]>([]);
  const [experiment, setExperiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchABTestData();
    }
  }, [user]);

  const fetchABTestData = async () => {
    try {
      // Get current experiment
      const { data: experimentData } = await supabase
        .from('cancel_guard_experiments')
        .select('*')
        .eq('is_active', true)
        .single();
      
      setExperiment(experimentData);

      if (!experimentData) {
        setLoading(false);
        return;
      }

      // Get A/B test performance data
      const { data: eventsData } = await supabase
        .from('cancel_guard_events')
        .select(`
          experiment_group,
          event_type,
          event_data,
          created_at
        `)
        .not('experiment_group', 'is', null)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (eventsData) {
        // Process A/B test results
        const groupStats = {
          A: { attempts: 0, saves: 0, revenue: 0, total_score: 0, count: 0 },
          B: { attempts: 0, saves: 0, revenue: 0, total_score: 0, count: 0 }
        };

        eventsData.forEach(event => {
          const group = event.experiment_group;
          if (!groupStats[group]) return;

          if (event.event_type === 'cancel_attempt') {
            groupStats[group].attempts++;
          } else if (event.event_type === 'offer_accepted') {
            groupStats[group].saves++;
            const eventData = event.event_data as any;
            groupStats[group].revenue += eventData?.revenue_saved || 0;
          } else if (event.event_type === 'offers_ranked') {
            const eventData = event.event_data as any;
            if (eventData?.top_offer_score) {
              groupStats[group].total_score += eventData.top_offer_score;
              groupStats[group].count++;
            }
          }
        });

        const processedData: ABTestData[] = Object.entries(groupStats).map(([group, stats]) => ({
          group: `Group ${group}`,
          attempts: stats.attempts,
          saves: stats.saves,
          save_rate: stats.attempts > 0 ? (stats.saves / stats.attempts) * 100 : 0,
          revenue_saved: stats.revenue,
          avg_offer_score: stats.count > 0 ? stats.total_score / stats.count : 0
        }));

        setAbData(processedData);

        // Generate trend data (last 7 days)
        const trends: ABTestTrend[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const dayEvents = eventsData.filter(e => 
            new Date(e.created_at).toDateString() === date.toDateString()
          );
          
          const dayStats = { A: { attempts: 0, saves: 0 }, B: { attempts: 0, saves: 0 } };
          dayEvents.forEach(event => {
            const group = event.experiment_group;
            if (!dayStats[group]) return;
            
            if (event.event_type === 'cancel_attempt') dayStats[group].attempts++;
            if (event.event_type === 'offer_accepted') dayStats[group].saves++;
          });

          trends.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            group_a_rate: dayStats.A.attempts > 0 ? (dayStats.A.saves / dayStats.A.attempts) * 100 : 0,
            group_b_rate: dayStats.B.attempts > 0 ? (dayStats.B.saves / dayStats.B.attempts) * 100 : 0
          });
        }

        setTrendData(trends);
      }
    } catch (error) {
      console.error('Error fetching A/B test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinningGroup = () => {
    if (abData.length < 2) return null;
    const groupA = abData.find(d => d.group === 'Group A');
    const groupB = abData.find(d => d.group === 'Group B');
    
    if (!groupA || !groupB) return null;
    
    if (groupA.save_rate > groupB.save_rate) {
      return { winner: 'A', lift: groupA.save_rate - groupB.save_rate };
    } else {
      return { winner: 'B', lift: groupB.save_rate - groupA.save_rate };
    }
  };

  const winnerInfo = getWinningGroup();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!experiment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            A/B Testing
          </CardTitle>
          <CardDescription>No active experiments found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Create an experiment to start A/B testing your cancel flows.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Experiment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                A/B Test: {experiment.name}
              </CardTitle>
              <CardDescription>{experiment.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {experiment.traffic_split_a}% / {experiment.traffic_split_b}% Split
              </Badge>
              {winnerInfo && (
                <Badge variant={winnerInfo.winner === 'A' ? 'default' : 'secondary'}>
                  Group {winnerInfo.winner} Leading (+{winnerInfo.lift.toFixed(1)}%)
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Save Rate Comparison
            </CardTitle>
            <CardDescription>Success rate by experiment group</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={abData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'save_rate' ? `${Number(value).toFixed(1)}%` : value,
                    name === 'save_rate' ? 'Save Rate' : name
                  ]}
                />
                <Bar 
                  dataKey="save_rate" 
                  fill="hsl(var(--primary))" 
                  name="save_rate"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              7-Day Trend
            </CardTitle>
            <CardDescription>Daily save rate performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Save Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="group_a_rate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Group A"
                />
                <Line 
                  type="monotone" 
                  dataKey="group_b_rate" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Group B"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
          <CardDescription>Complete breakdown of A/B test results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {abData.map((group, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{group.group}</span>
                  </div>
                  <div className="text-2xl font-bold">{group.attempts}</div>
                  <div className="text-sm text-muted-foreground">Attempts</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-4 h-4" />
                    <span className="font-medium">Save Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{group.save_rate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">{group.saves} saves</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">${group.revenue_saved.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Saved</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Avg Score</span>
                  </div>
                  <div className="text-2xl font-bold">{group.avg_offer_score.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Offer quality</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
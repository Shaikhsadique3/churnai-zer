import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, Target, TrendingUp, DollarSign } from 'lucide-react';

interface DryRunUser {
  id: string;
  mrr: number;
  plan: string;
  tenure_days: number;
  last_login_days: number;
  usage_score?: number;
}

interface DryRunResult {
  primary_offer: any;
  ranked_offers: any[];
  user_analysis: {
    segment: string;
    risk_factors: string[];
    retention_likelihood: number;
    recommended_approach: string;
    key_insights: string[];
  };
}

interface OfferDryRunProps {
  offers: any[];
  onRunPreview: (user: DryRunUser) => Promise<DryRunResult>;
}

const SAMPLE_USERS = [
  {
    id: 'sample_vip',
    name: 'VIP Customer',
    mrr: 500,
    plan: 'Enterprise',
    tenure_days: 450,
    last_login_days: 2,
    usage_score: 85
  },
  {
    id: 'sample_price_sensitive',
    name: 'Price Sensitive',
    mrr: 29,
    plan: 'Basic',
    tenure_days: 90,
    last_login_days: 5,
    usage_score: 45
  },
  {
    id: 'sample_new_user',
    name: 'New User',
    mrr: 99,
    plan: 'Pro',
    tenure_days: 15,
    last_login_days: 7,
    usage_score: 30
  },
  {
    id: 'sample_churning',
    name: 'High Churn Risk',
    mrr: 199,
    plan: 'Pro',
    tenure_days: 200,
    last_login_days: 30,
    usage_score: 15
  }
];

export const OfferDryRun: React.FC<OfferDryRunProps> = ({ offers, onRunPreview }) => {
  const [testUser, setTestUser] = useState<DryRunUser>({
    id: 'test_user',
    mrr: 99,
    plan: 'Pro',
    tenure_days: 120,
    last_login_days: 5,
    usage_score: 65
  });
  
  const [result, setResult] = useState<DryRunResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunPreview = async () => {
    setLoading(true);
    try {
      // Simulate API call for dry run
      const mockResult: DryRunResult = {
        primary_offer: {
          type: 'discount',
          title: '50% Off for 3 Months',
          copy: 'Stay with us and save big! Get 50% off your next 3 billing cycles.',
          expected_save_odds: 0.78,
          projected_revenue_saved: testUser.mrr * 3 * 0.78,
          guardrails: {
            max_discount: 50,
            min_tenure: 30,
            usage_requirements: 'none'
          }
        },
        ranked_offers: [
          {
            type: 'discount',
            title: '50% Off for 3 Months',
            expected_save_odds: 0.78,
            projected_revenue_saved: testUser.mrr * 3 * 0.78,
            score: 85
          },
          {
            type: 'pause',
            title: '30-Day Subscription Pause',
            expected_save_odds: 0.65,
            projected_revenue_saved: testUser.mrr * 2 * 0.65,
            score: 72
          },
          {
            type: 'downgrade',
            title: 'Switch to Basic Plan',
            expected_save_odds: 0.55,
            projected_revenue_saved: 29 * 6 * 0.55,
            score: 58
          }
        ],
        user_analysis: {
          segment: determineUserSegment(testUser),
          risk_factors: generateRiskFactors(testUser),
          retention_likelihood: calculateRetentionLikelihood(testUser),
          recommended_approach: getRecommendedApproach(testUser),
          key_insights: generateKeyInsights(testUser)
        }
      };
      
      setResult(mockResult);
    } catch (error) {
      console.error('Error running preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleUser = (sample: any) => {
    setTestUser({
      id: sample.id,
      mrr: sample.mrr,
      plan: sample.plan,
      tenure_days: sample.tenure_days,
      last_login_days: sample.last_login_days,
      usage_score: sample.usage_score
    });
    setResult(null);
  };

  const determineUserSegment = (user: DryRunUser): string => {
    if (user.mrr >= 300) return 'VIP';
    if (user.mrr <= 50) return 'Price Sensitive';
    if (user.tenure_days <= 30) return 'New User';
    if (user.last_login_days > 14) return 'At Risk';
    return 'Standard';
  };

  const generateRiskFactors = (user: DryRunUser): string[] => {
    const factors = [];
    if (user.last_login_days > 14) factors.push('Long time since last login');
    if (user.usage_score && user.usage_score < 40) factors.push('Low usage activity');
    if (user.tenure_days < 30) factors.push('New customer - higher churn risk');
    if (user.plan === 'Free') factors.push('Free tier user');
    return factors;
  };

  const calculateRetentionLikelihood = (user: DryRunUser): number => {
    let likelihood = 50;
    if (user.mrr >= 300) likelihood += 25;
    if (user.tenure_days > 365) likelihood += 20;
    if (user.last_login_days <= 7) likelihood += 15;
    if (user.usage_score && user.usage_score > 70) likelihood += 10;
    return Math.min(likelihood, 95);
  };

  const getRecommendedApproach = (user: DryRunUser): string => {
    if (user.mrr >= 300) return 'High-touch concierge approach with personalized retention offers';
    if (user.mrr <= 50) return 'Price-focused offers with clear value demonstration';
    if (user.tenure_days <= 30) return 'Education-focused approach to improve onboarding';
    return 'Standard retention flow with targeted offers';
  };

  const generateKeyInsights = (user: DryRunUser): string[] => {
    const insights = [];
    if (user.mrr >= 300) insights.push('High-value customer requiring immediate attention');
    if (user.last_login_days > 14) insights.push('Re-engagement campaign needed before retention offers');
    if (user.usage_score && user.usage_score < 40) insights.push('Feature adoption issues may be driving churn');
    return insights;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Dry Run Preview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test your offers with sample user data to see which offers would be recommended
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Users */}
          <div>
            <Label className="text-base font-medium">Quick Test Users</Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              {SAMPLE_USERS.map((sample) => (
                <Button
                  key={sample.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleUser(sample)}
                  className="h-auto p-3 flex flex-col items-start"
                >
                  <div className="font-medium">{sample.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {sample.plan} • ${sample.mrr}/mo
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom User Input */}
          <div>
            <Label className="text-base font-medium">Custom Test User</Label>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-3">
              <div>
                <Label htmlFor="mrr">MRR ($)</Label>
                <Input
                  id="mrr"
                  type="number"
                  value={testUser.mrr}
                  onChange={(e) => setTestUser(prev => ({ ...prev, mrr: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={testUser.plan}
                  onValueChange={(value) => setTestUser(prev => ({ ...prev, plan: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tenure_days">Tenure (days)</Label>
                <Input
                  id="tenure_days"
                  type="number"
                  value={testUser.tenure_days}
                  onChange={(e) => setTestUser(prev => ({ ...prev, tenure_days: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="last_login_days">Last Login (days ago)</Label>
                <Input
                  id="last_login_days"
                  type="number"
                  value={testUser.last_login_days}
                  onChange={(e) => setTestUser(prev => ({ ...prev, last_login_days: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="usage_score">Usage Score (0-100)</Label>
                <Input
                  id="usage_score"
                  type="number"
                  value={testUser.usage_score || ''}
                  onChange={(e) => setTestUser(prev => ({ ...prev, usage_score: parseInt(e.target.value) || undefined }))}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Run Preview Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleRunPreview}
              disabled={loading || offers.length === 0}
              size="lg"
              className="w-full max-w-md"
            >
              {loading ? 'Running Preview...' : 'Run Offer Preview'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* User Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                User Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Customer Segment</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-sm">
                        {result.user_analysis.segment}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Retention Likelihood</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-2xl font-bold text-primary">
                        {result.user_analysis.retention_likelihood}%
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Risk Factors</Label>
                  <div className="mt-2 space-y-1">
                    {result.user_analysis.risk_factors.map((factor, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {factor}
                      </div>
                    ))}
                    {result.user_analysis.risk_factors.length === 0 && (
                      <div className="text-sm text-green-600">No significant risk factors identified</div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Recommended Approach</Label>
                <p className="mt-1 text-sm">{result.user_analysis.recommended_approach}</p>
              </div>
              
              {result.user_analysis.key_insights.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Key Insights</Label>
                  <div className="mt-2 space-y-1">
                    {result.user_analysis.key_insights.map((insight, index) => (
                      <div key={index} className="text-sm">
                        💡 {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Primary Offer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Primary Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {result.primary_offer.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(result.primary_offer.expected_save_odds * 100)}% save odds
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{result.primary_offer.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{result.primary_offer.copy}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${Math.round(result.primary_offer.projected_revenue_saved)}
                    </div>
                    <div className="text-xs text-muted-foreground">Projected Revenue Saved</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Ranked Offers */}
          <Card>
            <CardHeader>
              <CardTitle>All Ranked Offers</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete ranking of offers based on user profile
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.ranked_offers.map((offer, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${index === 0 ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <Badge variant={index === 0 ? 'default' : 'outline'}>
                            {offer.type}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium">{offer.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Score: {offer.score} • Save odds: {Math.round(offer.expected_save_odds * 100)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${Math.round(offer.projected_revenue_saved)}
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue Impact</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
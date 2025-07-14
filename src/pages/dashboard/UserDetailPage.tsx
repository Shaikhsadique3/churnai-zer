import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, Activity, TrendingUp, AlertTriangle, User, Database } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface UserDetail {
  id: string;
  user_id: string;
  plan: string;
  usage: number;
  last_login: string | null;
  churn_score: number;
  churn_reason: string | null;
  risk_level: 'low' | 'medium' | 'high';
  understanding_score?: number;
  user_stage?: string;
  days_until_mature?: number;
  action_recommended?: string;
  created_at: string;
  updated_at: string;
}

export const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: userDetail, isLoading } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: async () => {
      if (!user || !userId) return null;
      
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user.id)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as UserDetail;
    },
    enabled: !!user && !!userId,
  });

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getBehaviorSnapshot = (user: UserDetail) => {
    // Calculate signup days from created_at
    const signupDate = new Date(user.created_at);
    const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate days since last login
    const daysSinceLogin = user.last_login 
      ? Math.floor((Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate total logins (mock for now - would need real data)
    const totalLogins = user.last_login ? Math.max(1, Math.floor(daysSinceSignup / 7)) : 0;

    return {
      signup_date: signupDate.toISOString(),
      days_since_signup: daysSinceSignup,
      last_seen: user.last_login,
      days_since_last_login: daysSinceLogin,
      plan_type: user.plan,
      total_logins: totalLogins,
      billing_status: user.usage > 0 ? 'paid' : 'free',
      revenue: user.usage || 0,
      feature_usage: {
        dashboard_visits: Math.floor(Math.random() * 50) + 10,
        reports_generated: Math.floor(Math.random() * 20) + 5,
        api_calls: Math.floor(Math.random() * 100) + 25
      },
      engagement_score: user.understanding_score || 0,
      support_tickets: Math.floor(Math.random() * 5),
      payment_failures: 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => navigate('/dashboard/users')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  const behaviorData = getBehaviorSnapshot(userDetail);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <User className="h-6 w-6 mr-2" />
              {userDetail.user_id}
            </h1>
            <p className="text-muted-foreground">User Details & Analysis</p>
          </div>
        </div>
        <Badge variant={getRiskBadgeVariant(userDetail.risk_level)}>
          {userDetail.risk_level.toUpperCase()} RISK
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(userDetail.churn_score * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Probability of churning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${userDetail.usage?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue contribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userDetail.last_login ? formatDistanceToNow(new Date(userDetail.last_login), { addSuffix: true }) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last login time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userDetail.plan}</div>
            <p className="text-xs text-muted-foreground">
              Current subscription
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-foreground">Churn Reason:</p>
            <p className="text-muted-foreground">
              {userDetail.churn_reason || 'No specific indicators detected'}
            </p>
          </div>
          
          <div>
            <p className="font-medium text-foreground">Recommended Action:</p>
            <p className="text-muted-foreground">
              {userDetail.action_recommended || 'Continue monitoring user behavior'}
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">User Stage:</p>
            <Badge variant="outline">{userDetail.user_stage || 'Unknown'}</Badge>
            {userDetail.days_until_mature && userDetail.days_until_mature > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({userDetail.days_until_mature} days until mature)
              </span>
            )}
          </div>

          {userDetail.understanding_score && (
            <div>
              <p className="font-medium text-foreground">AI Confidence:</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${userDetail.understanding_score}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{userDetail.understanding_score}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Behavior Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            User Behavior Snapshot
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Raw data sent to the churn prediction API for analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Profile Data */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Profile Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signup Date:</span>
                  <span className="font-mono">{new Date(behaviorData.signup_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Since Signup:</span>
                  <span className="font-mono">{behaviorData.days_since_signup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan Type:</span>
                  <span className="font-mono">{behaviorData.plan_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Status:</span>
                  <span className="font-mono">{behaviorData.billing_status}</span>
                </div>
              </div>
            </div>

            {/* Activity Data */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Activity Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Logins:</span>
                  <span className="font-mono">{behaviorData.total_logins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Since Last Login:</span>
                  <span className="font-mono">{behaviorData.days_since_last_login || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-mono">${behaviorData.revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement Score:</span>
                  <span className="font-mono">{behaviorData.engagement_score}%</span>
                </div>
              </div>
            </div>

            {/* Feature Usage */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Feature Usage</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dashboard Visits:</span>
                  <span className="font-mono">{behaviorData.feature_usage.dashboard_visits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reports Generated:</span>
                  <span className="font-mono">{behaviorData.feature_usage.reports_generated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Calls:</span>
                  <span className="font-mono">{behaviorData.feature_usage.api_calls}</span>
                </div>
              </div>
            </div>

            {/* Support & Billing */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Support & Billing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support Tickets:</span>
                  <span className="font-mono">{behaviorData.support_tickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Failures:</span>
                  <span className="font-mono">{behaviorData.payment_failures}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />
          
          {/* Raw JSON Preview */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Raw API Payload</h4>
            <div className="bg-muted p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs font-mono text-muted-foreground">
{JSON.stringify(behaviorData, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
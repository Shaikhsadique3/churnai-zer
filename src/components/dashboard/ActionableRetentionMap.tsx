import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Shield, AlertTriangle, BarChart3 } from "lucide-react";

interface RetentionFeature {
  feature_name: string;
  retention_percentage: number;
  revenue_contribution: number;
  user_count: number;
}

interface ChurnCluster {
  cluster_name: string;
  reason_examples: string[];
  percentage: number;
  user_count: number;
}

export const ActionableRetentionMap: React.FC = () => {
  const { data: retentionData = [], isLoading: loadingRetention } = useQuery({
    queryKey: ['retention-analytics'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from('retention_analytics')
        .select('*')
        .eq('user_id', session.user.id)
        .order('retention_percentage', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as RetentionFeature[];
    },
  });

  const { data: churnClusters = [], isLoading: loadingClusters } = useQuery({
    queryKey: ['churn-clusters'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from('churn_reason_clusters')
        .select('*')
        .eq('user_id', session.user.id)
        .order('percentage', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as ChurnCluster[];
    },
  });

  const topFeatures = retentionData.slice(0, 3);
  const topClusters = churnClusters.slice(0, 3);

  if (loadingRetention || loadingClusters) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Actionable Retention Map</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (retentionData.length === 0 && churnClusters.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Actionable Retention Map</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Not Available
            </CardTitle>
            <CardDescription>
              Upload CSV data with 'feature_adopted' and 'cancellation_reason' columns to see retention insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                To enable Retention Analytics, include these optional columns in your CSV:
              </p>
              <div className="mt-4 space-y-2">
                <Badge variant="outline">feature_adopted</Badge>
                <Badge variant="outline">cancellation_reason</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Actionable Retention Map</h2>
      
      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* What Keeps Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              What Keeps Users
            </CardTitle>
            <CardDescription>Top features driving retention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topFeatures.length > 0 ? (
              topFeatures.map((feature, index) => (
                <div key={feature.feature_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {index + 1}. {feature.feature_name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {Math.round(feature.retention_percentage)}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No feature data available</p>
            )}
          </CardContent>
        </Card>

        {/* Why They Leave */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Why They Leave
            </CardTitle>
            <CardDescription>Top churn reason clusters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topClusters.length > 0 ? (
              topClusters.map((cluster, index) => (
                <div key={cluster.cluster_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {index + 1}. {cluster.cluster_name}
                    </span>
                  </div>
                  <Badge variant="destructive">
                    {Math.round(cluster.percentage)}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No churn data available</p>
            )}
          </CardContent>
        </Card>

        {/* Combined View */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Action Plan
            </CardTitle>
            <CardDescription>Strategic recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium text-green-700 mb-1">Keep/Invest:</div>
                {topFeatures.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Double down on {topFeatures[0]?.feature_name} 
                    ({Math.round(topFeatures[0]?.retention_percentage || 0)}% retention)
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Upload feature data to see recommendations</p>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium text-red-700 mb-1">Fix/Address:</div>
                {topClusters.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Priority: {topClusters[0]?.cluster_name} 
                    ({Math.round(topClusters[0]?.percentage || 0)}% of churns)
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Upload cancellation data to see issues</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      {(retentionData.length > 0 || churnClusters.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Retention Details */}
          {retentionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Feature-Retention Fit
                </CardTitle>
                <CardDescription>Features ranked by retention impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {retentionData.map((feature, index) => (
                    <div key={feature.feature_name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium text-sm">{feature.feature_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {feature.user_count} users • ${feature.revenue_contribution.toLocaleString()} revenue
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{Math.round(feature.retention_percentage)}%</div>
                        <div className="text-xs text-muted-foreground">retention</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Churn Reason Clusters */}
          {churnClusters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Churn Reason Clusters
                </CardTitle>
                <CardDescription>Grouped cancellation reasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churnClusters.map((cluster, index) => (
                    <div key={cluster.cluster_name} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{cluster.cluster_name}</div>
                        <Badge variant="outline">{Math.round(cluster.percentage)}%</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cluster.user_count} users affected
                      </div>
                      {cluster.reason_examples && cluster.reason_examples.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium mb-1">Examples:</div>
                          <div className="text-xs text-muted-foreground">
                            "{cluster.reason_examples[0]}"
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

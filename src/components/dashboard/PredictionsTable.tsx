import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logApiSuccess, logApiFailure } from "@/utils/apiLogger";

interface UserPrediction {
  id: string;
  user_id: string;
  churn_score: number;
  risk_level: 'low' | 'medium' | 'high';
  churn_reason: string;
  action_recommended: string;
  monthly_revenue: number;
  created_at: string;
}

interface PredictionsTableProps {
  onUploadClick: () => void;
  isDemoData: boolean;
}

export const PredictionsTable: React.FC<PredictionsTableProps> = ({ onUploadClick, isDemoData }) => {
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['user-predictions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const query = supabase
        .from('user_data')
        .select('id, user_id, churn_score, risk_level, churn_reason, action_recommended, monthly_revenue, created_at')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      console.log("Request sent:", {
        table: 'user_data',
        owner_id: session.user.id,
        endpoint: '/rest/v1/user_data'
      });

      const startTime = Date.now();
      const { data, error } = await query;

      if (error) {
        console.log("Error response received:", error);
        logApiFailure('/rest/v1/user_data', 'GET', Date.now() - startTime);
        throw error;
      }
      
      console.log("Response received:", {
        count: data?.length || 0,
        sample: data?.slice(0, 2) || [],
        timestamp: new Date().toISOString()
      });
      
      logApiSuccess('/rest/v1/user_data', 'GET', Date.now() - startTime);
      
      return data as UserPrediction[];
    },
  });

  const getRiskBadge = (riskLevel: string, score: number) => {
    const riskPercentage = Math.round(score * 100);
    
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive" className="font-medium">{riskPercentage}% High Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 font-medium">{riskPercentage}% Medium Risk</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 font-medium">{riskPercentage}% Low Risk</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{riskPercentage}%</Badge>;
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cancel-Intent Predictions</CardTitle>
          <CardDescription>Loading predictions...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CardContent>
    </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cancel-Intent Predictions</CardTitle>
          <CardDescription>Real-time predictions from your uploaded data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No predictions yet. Upload a CSV file to see real cancel-intent predictions.
            </p>
            <Button onClick={onUploadClick} variant="outline">
              Upload Customer Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Cancel-Intent Predictions ({predictions.length})
        </CardTitle>
        {isDemoData ? (
          <Alert className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>⚠️ Currently showing Demo Insights</AlertDescription>
          </Alert>
        ) : (
          <Alert className="mt-2 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>✅ Showing Live Insights</AlertDescription>
          </Alert>
        )}
        <CardDescription>
          Real-time ML predictions showing customer cancel risk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Recommended Action</TableHead>
                <TableHead>Predicted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(prediction.risk_level)}
                      {prediction.user_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(prediction.risk_level, prediction.churn_score)}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${(prediction.monthly_revenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <span className="text-sm text-muted-foreground">
                      {prediction.action_recommended || prediction.churn_reason || 'Monitor engagement closely'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(prediction.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
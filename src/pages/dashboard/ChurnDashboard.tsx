import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, TrendingUp, Users, AlertTriangle, Download, Target, DollarSign } from 'lucide-react';
import { DynamicHead } from "@/components/common/DynamicHead";

interface ChurnPrediction {
  id: string;
  customer_id: string;
  churn_probability: number;
  risk_level: 'high' | 'medium' | 'low';
  contributing_factors: string[];
  recommended_actions: string[];
  monthly_revenue: number;
  subscription_plan: string;
}

interface AnalysisResult {
  id: string;
  total_customers: number;
  churn_rate: number;
  high_risk_customers: number;
  medium_risk_customers: number;
  low_risk_customers: number;
  avg_cltv: number;
  created_at: string;
}

const ChurnDashboard = () => {
  const { user } = useAuth();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  // Fetch analysis results
  const { data: analysisResults, isLoading: analysisLoading } = useQuery({
    queryKey: ['churn-analysis-results', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('churn_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AnalysisResult[];
    },
    enabled: !!user
  });

  // Fetch predictions for selected analysis
  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['churn-predictions', selectedAnalysis],
    queryFn: async () => {
      if (!selectedAnalysis) return [];
      
      const { data, error } = await supabase
        .from('customer_churn_predictions')
        .select('*')
        .eq('analysis_id', selectedAnalysis)
        .order('churn_probability', { ascending: false });
      
      if (error) throw error;
      return data as ChurnPrediction[];
    },
    enabled: !!selectedAnalysis
  });

  const latestAnalysis = analysisResults?.[0];

  React.useEffect(() => {
    if (latestAnalysis && !selectedAnalysis) {
      setSelectedAnalysis(latestAnalysis.id);
    }
  }, [latestAnalysis, selectedAnalysis]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const exportToCsv = () => {
    if (!predictions) return;
    
    const headers = ['Customer ID', 'Churn Probability', 'Risk Level', 'Monthly Revenue', 'Plan', 'Top Factors', 'Recommended Actions'];
    const rows = predictions.map(p => [
      p.customer_id,
      (p.churn_probability * 100).toFixed(1) + '%',
      p.risk_level,
      '$' + p.monthly_revenue.toFixed(2),
      p.subscription_plan,
      p.contributing_factors.slice(0, 2).join('; '),
      p.recommended_actions.slice(0, 2).join('; ')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `churn_predictions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your churn analysis dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (analysisLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your analysis...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisResults?.length) {
    return (
      <>
        <DynamicHead 
          title="Churn Dashboard - Upload Data to Get Started"
          description="Upload your customer data to get AI-powered churn predictions and insights"
        />
        <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>No Analysis Data Found</CardTitle>
              <CardDescription>
                Upload your customer data CSV to get started with churn predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <a href="/csv-upload">Upload Customer Data</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <DynamicHead 
        title="Churn Prediction Dashboard - Customer Analysis"
        description="View AI-powered churn predictions, risk analysis, and actionable insights for your customers"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Churn Prediction Dashboard
              </h1>
              <p className="text-muted-foreground">
                AI-powered insights to identify at-risk customers
              </p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button onClick={exportToCsv} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button asChild>
                <a href="/csv-upload">Upload New Data</a>
              </Button>
            </div>
          </div>

          {/* Analysis Selector */}
          {analysisResults.length > 1 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>Select an analysis to view detailed predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.map((analysis) => (
                    <Button
                      key={analysis.id}
                      variant={selectedAnalysis === analysis.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAnalysis(analysis.id)}
                    >
                      {new Date(analysis.created_at).toLocaleDateString()} 
                      ({analysis.total_customers} customers)
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          {latestAnalysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{latestAnalysis.total_customers}</div>
                  <p className="text-xs text-muted-foreground">Analyzed in latest upload</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{latestAnalysis.high_risk_customers}</div>
                  <p className="text-xs text-muted-foreground">
                    {((latestAnalysis.high_risk_customers / latestAnalysis.total_customers) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(latestAnalysis.churn_rate * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Predicted churn rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg CLTV</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${latestAnalysis.avg_cltv?.toFixed(0) || 0}</div>
                  <p className="text-xs text-muted-foreground">Customer lifetime value</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Predictions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Risk Analysis</CardTitle>
              <CardDescription>
                Detailed churn predictions and recommended actions for each customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading predictions...</p>
                </div>
              ) : !predictions?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No predictions found for this analysis
                </div>
              ) : (
                <Tabs defaultValue="high" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="high">High Risk ({predictions.filter(p => p.risk_level === 'high').length})</TabsTrigger>
                    <TabsTrigger value="medium">Medium Risk ({predictions.filter(p => p.risk_level === 'medium').length})</TabsTrigger>
                    <TabsTrigger value="low">Low Risk ({predictions.filter(p => p.risk_level === 'low').length})</TabsTrigger>
                  </TabsList>
                  
                  {['high', 'medium', 'low'].map(riskLevel => (
                    <TabsContent key={riskLevel} value={riskLevel} className="mt-6">
                      <div className="space-y-4">
                        {predictions
                          .filter(p => p.risk_level === riskLevel)
                          .map((prediction) => (
                            <Card key={prediction.id} className="border-l-4 border-l-primary">
                              <CardContent className="pt-6">
                                <div className="grid lg:grid-cols-4 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">{prediction.customer_id}</h4>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                      <p>Plan: {prediction.subscription_plan}</p>
                                      <p>Revenue: ${prediction.monthly_revenue?.toFixed(2) || 0}/mo</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium">Churn Risk:</span>
                                      <Badge className={getRiskColor(prediction.risk_level)}>
                                        {(prediction.churn_probability * 100).toFixed(1)}%
                                      </Badge>
                                    </div>
                                    <Badge className={getRiskColor(prediction.risk_level)}>
                                      {prediction.risk_level.toUpperCase()}
                                    </Badge>
                                  </div>
                                  
                                  <div>
                                    <h5 className="text-sm font-medium mb-2">Key Risk Factors:</h5>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                      {prediction.contributing_factors.slice(0, 3).map((factor, i) => (
                                        <li key={i}>• {factor}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className="text-sm font-medium mb-2">Recommended Actions:</h5>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                      {prediction.recommended_actions.slice(0, 3).map((action, i) => (
                                        <li key={i}>• {action}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        
                        {predictions.filter(p => p.risk_level === riskLevel).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No {riskLevel} risk customers found
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ChurnDashboard;
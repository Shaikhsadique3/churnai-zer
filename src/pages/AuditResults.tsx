import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { AccuracyMeter } from "@/components/report/AccuracyMeter";
import { ScoreBadge } from "@/components/report/ScoreBadge";
import { ActionPlan } from "@/components/report/ActionPlan";
import { calculateBenchmark, getAIInsight } from "@/lib/reportUtils";

export default function AuditResults() {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [audit, setAudit] = useState<any>(null);
  const [categoryResults, setCategoryResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [auditId]);

  const loadResults = async () => {
    try {
      // Load audit
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .single();

      if (auditError) throw auditError;
      setAudit(auditData);

      // Load category results
      const { data: categoryData, error: categoryError } = await supabase
        .from('category_results')
        .select(`
          *,
          category:categories(title, description)
        `)
        .eq('audit_id', auditId);

      if (categoryError) throw categoryError;
      setCategoryResults(categoryData || []);
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "Good") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "Average") return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const handleDownloadReport = () => {
    navigate(`/report/${auditId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  const chartData = categoryResults.map(cr => ({
    category: cr.category.title.split(' ')[0],
    score: Math.round(cr.score)
  }));

  const radarData = categoryResults.map(cr => ({
    category: cr.category.title.split(' ')[0],
    value: Math.round(cr.score)
  }));

  const benchmark = calculateBenchmark(audit.overall_score || 0);
  const aiInsight = getAIInsight(categoryResults);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">Your Retention Health Report</h1>
            <p className="text-xl text-muted-foreground">
              Personalized insights to predict and prevent churn
            </p>
            <p className="text-sm text-muted-foreground italic">
              "Know your retention. Prove it with data."
            </p>
          </div>

          {/* Overall Score Card */}
          <Card className="p-10 space-y-6 border-2">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center md:text-left space-y-3">
                <h2 className="text-lg font-medium text-muted-foreground uppercase tracking-wider">
                  Overall Score
                </h2>
                <div className="text-7xl font-bold text-primary">
                  {Math.round(audit.overall_score || 0)}
                </div>
                <ScoreBadge score={audit.overall_score || 0} size="lg" />
              </div>

              <div className="flex justify-center">
                <AccuracyMeter accuracy={audit.accuracy || 60} size={140} />
              </div>

              <div className="space-y-4 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end gap-2 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">{benchmark.message}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {audit.audit_mode === 'question' && "Based on self-assessment responses"}
                  {audit.audit_mode === 'data' && `Analyzed ${audit.data_metrics_count} retention metrics`}
                  {audit.audit_mode === 'merged' && `Combined ${audit.data_metrics_count} metrics + self-assessment`}
                </p>
              </div>
            </div>

            {/* AI Insight */}
            <div className="pt-6 border-t">
              <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-accent mb-1">AI-Powered Insight</div>
                  <p className="text-sm text-foreground">{aiInsight}</p>
                </div>
              </div>
            </div>

            {/* Upload CTA */}
            {audit.audit_mode === 'question' && (
              <div className="pt-6 border-t text-center">
                <p className="text-muted-foreground mb-4">
                  📊 Upload your customer data to increase accuracy to 90%
                </p>
                <Button 
                  size="lg"
                  onClick={() => navigate(`/upload?mergeWith=${auditId}`)}
                >
                  Upload CSV to Boost Accuracy
                </Button>
              </div>
            )}
          </Card>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Retention Profile</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Category Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-center py-3 px-4">Score</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryResults.map((cr) => (
                    <tr key={cr.id} className="border-b last:border-0">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">{cr.category.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {cr.category.description}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`text-lg font-bold ${getScoreColor(cr.score)}`}>
                          {Math.round(cr.score)}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(cr.status)}
                          <span className="font-medium">{cr.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Wins */}
          <Card className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Quick Wins (24-Hour Fixes)</h3>
              <p className="text-muted-foreground">
                Start improving retention today with these actionable steps
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {categoryResults
                .filter(cr => cr.status !== "Good")
                .slice(0, 4)
                .map((cr, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-muted/50 rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-primary">{cr.category.title}</div>
                      <div className="text-sm mt-1">
                        {cr.status === "Poor" 
                          ? "Set up exit surveys and basic health scoring immediately"
                          : "Review current processes and identify one optimization"
                        }
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* 30/60/90 Day Plan */}
          <ActionPlan categoryResults={categoryResults} />

          {/* CTA */}
          <div className="text-center space-y-6 py-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready for Your Complete Report?</h3>
              <p className="text-muted-foreground">
                Download the full PDF with detailed playbooks, metrics to track, and implementation guides
              </p>
            </div>
            <Button size="lg" onClick={handleDownloadReport} className="text-lg px-10 py-6">
              <Download className="mr-2 h-5 w-5" />
              Download Full Report (PDF)
            </Button>
            <p className="text-xs text-muted-foreground">
              Generated by Churnaizer — Predict & Prevent SaaS Churn with AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
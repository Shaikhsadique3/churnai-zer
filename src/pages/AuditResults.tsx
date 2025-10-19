import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
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
    category: cr.category.title.split(' ')[0], // Shorten for display
    score: Math.round(cr.score)
  }));

  const radarData = categoryResults.map(cr => ({
    category: cr.category.title.split(' ')[0],
    value: Math.round(cr.score)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Your Retention Health Report</h1>
            <p className="text-muted-foreground">
              Here's your comprehensive analysis across 5 retention categories
            </p>
          </div>

          {/* Overall Score */}
          <Card className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Overall Retention Health Score
            </h2>
            <div className={`text-7xl font-bold ${getScoreColor(audit.overall_score || 0)}`}>
              {Math.round(audit.overall_score || 0)}
            </div>
            <p className="text-xl font-medium">{audit.status}</p>
            
            {/* Accuracy Bar */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Accuracy Score</span>
                <span className="font-semibold">{Math.round(audit.accuracy || 60)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${audit.accuracy || 60}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {audit.audit_mode === 'question' && "Based on question responses"}
                {audit.audit_mode === 'data' && `Based on ${audit.data_metrics_count} data metrics`}
                {audit.audit_mode === 'merged' && "Combined question + data analysis"}
              </p>
            </div>

            {/* Upload Option */}
            {audit.audit_mode === 'question' && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Want more accurate insights? Upload your customer data
                </p>
                <Button 
                  variant="outline" 
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

          {/* Next Actions */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Recommended Next Steps</h3>
            <div className="space-y-3">
              {categoryResults
                .filter(cr => cr.status !== "Good")
                .slice(0, 3)
                .map((cr, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-accent rounded-lg">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{cr.category.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {cr.status === "Poor" 
                          ? "Critical area - prioritize immediate improvements in this category"
                          : "Moderate performance - look for quick wins to boost retention"
                        }
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* CTA */}
          <div className="flex justify-center">
            <Button size="lg" onClick={handleDownloadReport} className="text-lg px-8">
              <Download className="mr-2 h-5 w-5" />
              Download Full Report (PDF)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
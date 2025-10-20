import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Download, CheckCircle2, TrendingUp } from "lucide-react";
import { ScoreBadge } from "@/components/report/ScoreBadge";
import { AccuracyMeter } from "@/components/report/AccuracyMeter";
import { calculateBenchmark, getAIInsight, getPlaybookRecommendations } from "@/lib/reportUtils";

export default function ReportPDF() {
  const { auditId } = useParams();
  const [audit, setAudit] = useState<any>(null);
  const [categoryResults, setCategoryResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [auditId]);

  const loadData = async () => {
    const { data: auditData } = await supabase
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .single();

    const { data: categoryData } = await supabase
      .from('category_results')
      .select(`
        *,
        category:categories(title, description)
      `)
      .eq('audit_id', auditId);

    setAudit(auditData);
    setCategoryResults(categoryData || []);
    setIsLoading(false);
  };

  const handleDownload = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const benchmark = calculateBenchmark(audit.overall_score || 0);
  const aiInsight = getAIInsight(categoryResults);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-8 py-12 max-w-4xl space-y-12">
        {/* Print Button */}
        <div className="no-print flex justify-end mb-4">
          <Button onClick={handleDownload} size="lg">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Cover Page */}
        <div className="text-center space-y-8 pb-12 border-b-2" style={{ borderColor: '#3366FF' }}>
          <div className="space-y-2">
            <h1 className="text-6xl font-bold" style={{ color: '#262A33' }}>
              Retention Health Report
            </h1>
            <p className="text-2xl" style={{ color: '#697386' }}>
              Personalized Data-Driven Insights
            </p>
            {audit.email && (
              <p className="text-lg font-medium" style={{ color: '#3366FF' }}>
                Prepared for: {audit.email}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-12 py-8">
            <div className="text-center">
              <div className="text-7xl font-bold mb-4" style={{ color: '#3366FF' }}>
                {Math.round(audit.overall_score || 0)}
              </div>
              <ScoreBadge score={audit.overall_score || 0} size="lg" />
            </div>
            <div className="no-print">
              <AccuracyMeter accuracy={audit.accuracy || 60} size={160} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2" style={{ color: '#3366FF' }}>
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">{benchmark.message}</span>
            </div>
            <p className="text-sm" style={{ color: '#697386' }}>
              Generated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm italic" style={{ color: '#697386' }}>
              "Know your retention. Prove it with data."
            </p>
          </div>
        </div>

        {/* AI Insight */}
        <section className="p-6 rounded-lg border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#00C6AE' }}>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00C6AE' }}>
              <span className="text-white text-xl">✨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#00C6AE' }}>
                AI-Powered Insight
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {aiInsight}
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Executive Summary */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold" style={{ color: '#262A33' }}>Executive Summary</h2>
          <p className="text-gray-700 leading-relaxed">
            Most SaaS founders chase new users instead of fixing churn. The data is clear: increasing retention by just 5% can boost profits by up to 95% (Bain & Co). Yet most businesses leak 5-7% of their customer base monthly without understanding why.
          </p>
          <p className="text-gray-700 leading-relaxed">
            This report reveals where your customers are silently leaving — and provides a data-driven roadmap to prevent it.
          </p>
        </section>

        {/* Score Interpretation */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold" style={{ color: '#262A33' }}>Score Interpretation</h2>
          <div className="space-y-3">
            <div className="p-4 border-l-4 rounded-r" style={{ borderColor: '#22C55E', backgroundColor: '#F0FDF4' }}>
              <strong style={{ color: '#22C55E' }}>81-100: Strong Retention System</strong>
              <p className="text-sm mt-1 text-gray-700">
                You have solid processes in place. Focus on optimization and scaling.
              </p>
            </div>
            <div className="p-4 border-l-4 rounded-r" style={{ borderColor: '#3B82F6', backgroundColor: '#EFF6FF' }}>
              <strong style={{ color: '#3B82F6' }}>61-80: Stable but Untapped</strong>
              <p className="text-sm mt-1 text-gray-700">
                Good foundation with significant room for improvement and revenue expansion.
              </p>
            </div>
            <div className="p-4 border-l-4 rounded-r" style={{ borderColor: '#F59E0B', backgroundColor: '#FFFBEB' }}>
              <strong style={{ color: '#F59E0B' }}>31-60: Needs Attention</strong>
              <p className="text-sm mt-1 text-gray-700">
                Significant retention leaks. Prioritize quick wins and systematic improvements.
              </p>
            </div>
            <div className="p-4 border-l-4 rounded-r" style={{ borderColor: '#E12D39', backgroundColor: '#FEF2F2' }}>
              <strong style={{ color: '#E12D39' }}>0-30: Critical Risk</strong>
              <p className="text-sm mt-1 text-gray-700">
                Urgent intervention required. Focus on stopping the bleeding immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Your Category Breakdown</h2>
          {categoryResults.map((cr) => (
            <Card key={cr.id} className="p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold">{cr.category.title}</h3>
                  <p className="text-gray-600">{cr.category.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{Math.round(cr.score)}</div>
                  <div className="text-sm font-medium">{cr.status}</div>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Actionable Playbooks */}
        <section className="space-y-6 page-break">
          <h2 className="text-3xl font-bold">Retention Playbooks by Category</h2>
          
          {categoryResults.filter(cr => cr.status !== "Good").map((cr) => (
            <div key={cr.id} className="space-y-3">
              <h3 className="text-2xl font-semibold text-primary">{cr.category.title}</h3>
              <div className="space-y-2 pl-4">
                {getPlaybookRecommendations(cr.category.title, cr.status).map((rec, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-bold text-primary">→</span>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 30/60/90 Day Action Plan */}
        <section className="space-y-6 page-break">
          <h2 className="text-3xl font-bold" style={{ color: '#262A33' }}>Your 30/60/90 Day Action Plan</h2>
          <p className="text-gray-700">Prioritized roadmap to systematically improve retention</p>
          
          {[
            { 
              days: 30, 
              title: "Foundation",
              subtitle: "Set up systems and gather data",
              actions: [
                "Audit current retention metrics and set up dashboards",
                "Implement exit surveys for churned customers",
                "Define customer health score framework",
              ]
            },
            { 
              days: 60, 
              title: "Activation",
              subtitle: "Launch campaigns and optimize flows",
              actions: [
                "Launch reactivation campaigns for inactive users",
                "Optimize onboarding to reduce time-to-first-value",
                "Create customer success playbooks for each risk level",
              ]
            },
            { 
              days: 90, 
              title: "Scaling",
              subtitle: "Automate and build predictive capabilities",
              actions: [
                "Build predictive churn model using historical data",
                "Launch loyalty program or upgrade incentives",
                "Schedule quarterly business reviews for top accounts",
              ]
            },
          ].map((phase) => (
            <Card key={phase.days} className="p-6 border-2" style={{ borderColor: '#E3E8EE' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3366FF', color: 'white' }}>
                  <span className="text-xl font-bold">{phase.days}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{phase.title}</h3>
                  <p className="text-sm text-gray-600">{phase.subtitle}</p>
                </div>
              </div>
              <div className="space-y-2">
                {phase.actions.map((action, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#00C6AE' }} />
                    <p className="text-gray-700">{action}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </section>

        {/* Metrics to Track */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold" style={{ color: '#262A33' }}>Key Retention Metrics to Track</h2>
          <div className="grid gap-4">
            {[
              { metric: "Activation Rate", desc: "% of users reaching first value milestone within 24 hours" },
              { metric: "Feature Adoption", desc: "Active usage of your top 3 core features" },
              { metric: "Customer Health Score", desc: "Composite metric of usage + engagement + support" },
              { metric: "Renewal Rate", desc: "% of customers renewing subscriptions on time" },
              { metric: "Time-to-First-Value", desc: "How quickly new users experience their first win" },
              { metric: "Engagement Frequency", desc: "Daily/weekly active users by cohort" }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg border" style={{ backgroundColor: '#F6F8FA', borderColor: '#E3E8EE' }}>
                <strong style={{ color: '#3366FF' }}>{item.metric}</strong>
                <p className="text-sm text-gray-700 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick-Win Checklist */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Quick-Win Checklist (24-Hour Fixes)</h2>
          <ol className="space-y-2 list-decimal list-inside">
            {[
              "Set up a basic exit survey for churned users",
              "Create a weekly customer health dashboard",
              "Send a re-engagement email to inactive users",
              "Add a feature announcement banner for unused features",
              "Schedule monthly check-ins with top 10% of customers",
              "Implement NPS survey for customer feedback",
              "Create a customer success onboarding checklist",
              "Set up automated renewal reminders",
              "Build a simple case study from your happiest customer",
              "Track time-to-first-value for new signups"
            ].map((item, i) => (
              <li key={i} className="text-gray-700">{item}</li>
            ))}
          </ol>
        </section>

        {/* Footer */}
        <div className="text-center pt-12 border-t-2 space-y-3" style={{ borderColor: '#E3E8EE' }}>
          <p className="text-lg font-semibold" style={{ color: '#3366FF' }}>
            Generated by Churnaizer — Predict & Prevent SaaS Churn with AI
          </p>
          <p className="text-sm" style={{ color: '#697386' }}>
            "Know your retention. Prove it with data."
          </p>
          <p className="text-xs text-gray-500">
            This report contains proprietary insights. For questions or support, contact your Churnaizer team.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none; }
          .page-break { page-break-before: always; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
        }
        @media screen {
          body {
            background: #f6f8fa;
          }
        }
      `}</style>
    </div>
  );
}
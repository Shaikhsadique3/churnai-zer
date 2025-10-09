import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-8 py-12 max-w-4xl space-y-12">
        {/* Print Button */}
        <div className="no-print flex justify-end mb-4">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Cover Page */}
        <div className="text-center space-y-6 pb-12 border-b-2">
          <h1 className="text-5xl font-bold">Retention Health Audit Report</h1>
          <p className="text-xl text-gray-600">Personalized Assessment & Action Plan</p>
          <div className="text-4xl font-bold text-primary mt-8">
            Score: {Math.round(audit.overall_score || 0)}/100
          </div>
          <p className="text-lg font-medium">{audit.status}</p>
          <p className="text-sm text-gray-500">
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Section 1: The Retention Blindspot */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">The Retention Blindspot</h2>
          <p className="text-gray-700 leading-relaxed">
            Most founders chase new users instead of fixing churn. The data is clear: increasing retention by just 5% can boost profits by up to 95% (Bain & Co). Yet most SaaS businesses leak 5-7% of their customer base monthly without understanding why.
          </p>
          <p className="text-gray-700 leading-relaxed">
            This audit reveals where your customers are silently leaving — and more importantly, what you can do about it.
          </p>
        </section>

        {/* Section 2: Understanding Your Score */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">How to Read Your Score</h2>
          <div className="space-y-3">
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <strong>81-100: Strong Retention System</strong> - You have solid processes in place
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <strong>61-80: Stable but Untapped</strong> - Good foundation, room for optimization
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <strong>31-60: Needs Attention</strong> - Significant retention leaks to address
            </div>
            <div className="p-4 border-l-4 border-red-500 bg-red-50">
              <strong>0-30: Critical Risk</strong> - Urgent intervention required
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

        {/* Metrics to Track */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Retention Metrics You Should Track</h2>
          <div className="grid gap-4">
            {[
              { metric: "Activation Rate", desc: "% of users reaching first value milestone" },
              { metric: "Feature Adoption", desc: "Active usage of key product features" },
              { metric: "Renewal Rate", desc: "% of customers renewing subscriptions" },
              { metric: "Customer Health Score", desc: "Composite metric of engagement signals" }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <strong>{item.metric}</strong> - {item.desc}
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
        <div className="text-center pt-12 border-t text-sm text-gray-500">
          <p>This report was generated by Retention Audit App</p>
          <p className="mt-2">Want more retention strategies? Visit our playbook library.</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
      `}</style>
    </div>
  );
}

function getPlaybookRecommendations(category: string, status: string): string[] {
  const recommendations: Record<string, string[]> = {
    "Onboarding & Activation": [
      "Create a 'First Value' checklist that guides users to their first win within 24 hours",
      "Set up milestone tracking with celebration emails for key activation points",
      "Implement time-to-first-value (TTFV) tracking in your analytics"
    ],
    "Customer Engagement": [
      "Build an automated reactivation campaign triggered after 14 days of inactivity",
      "Create monthly feature highlight emails showing unused valuable features",
      "Set up cohort-based engagement tracking to identify at-risk segments"
    ],
    "Product Feedback & Experience": [
      "Add an exit survey for users who cancel or downgrade",
      "Create a feedback categorization system and monthly review process",
      "Implement proactive support ticket analysis to identify recurring issues"
    ],
    "Retention Marketing": [
      "Design a renewal reminder sequence starting 30 days before expiration",
      "Create a loyalty rewards program or annual plan incentive",
      "Build a case study automation workflow featuring successful customers"
    ],
    "Customer Success Process": [
      "Assign a retention owner and define clear KPIs beyond churn rate",
      "Create a customer health score combining usage + engagement + support data",
      "Schedule quarterly business reviews for high-value accounts"
    ]
  };

  return recommendations[category] || [];
}
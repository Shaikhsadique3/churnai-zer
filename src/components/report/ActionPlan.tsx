import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ActionPlanProps {
  categoryResults: Array<{
    category: { title: string };
    score: number;
    status: string;
  }>;
}

export function ActionPlan({ categoryResults }: ActionPlanProps) {
  const getActions = (timeframe: "30" | "60" | "90") => {
    const lowScoreCategories = categoryResults
      .filter((cr) => cr.score < 70)
      .sort((a, b) => a.score - b.score);

    const actions = {
      "30": [
        {
          title: "Audit your current retention metrics",
          description: "Set up dashboards to track activation rate, feature usage, and renewal rates",
          category: lowScoreCategories[0]?.category.title || "General",
        },
        {
          title: "Implement exit surveys",
          description: "Create a simple 3-question survey for churned users to understand why they left",
          category: "Product Feedback & Experience",
        },
        {
          title: "Define your customer health score",
          description: "Combine usage, engagement, and support data into a single metric",
          category: "Customer Success Process",
        },
      ],
      "60": [
        {
          title: "Launch reactivation campaigns",
          description: "Build automated email sequences for inactive users with personalized win-back offers",
          category: "Customer Engagement",
        },
        {
          title: "Optimize onboarding flow",
          description: "Reduce time-to-first-value by 50% through guided product tours and milestone tracking",
          category: "Onboarding & Activation",
        },
        {
          title: "Create customer success playbooks",
          description: "Document intervention strategies for each risk level and customer segment",
          category: lowScoreCategories[1]?.category.title || "Customer Success Process",
        },
      ],
      "90": [
        {
          title: "Build predictive churn model",
          description: "Use historical data to identify at-risk customers 30 days before they churn",
          category: "Retention Marketing",
        },
        {
          title: "Launch loyalty program",
          description: "Reward long-term customers with exclusive features, discounts, or priority support",
          category: "Retention Marketing",
        },
        {
          title: "Quarterly business reviews",
          description: "Schedule strategic check-ins with high-value accounts to align on goals and ROI",
          category: "Customer Success Process",
        },
      ],
    };

    return actions[timeframe];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Your 30/60/90 Day Action Plan</h2>
        <p className="text-muted-foreground">
          Prioritized roadmap to systematically improve retention across all categories
        </p>
      </div>

      {(["30", "60", "90"] as const).map((timeframe) => (
        <Card key={timeframe} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{timeframe}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">First {timeframe} Days</h3>
              <p className="text-sm text-muted-foreground">
                {timeframe === "30" && "Foundation - Set up systems and gather data"}
                {timeframe === "60" && "Activation - Launch campaigns and optimize flows"}
                {timeframe === "90" && "Scaling - Automate and build predictive capabilities"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {getActions(timeframe).map((action, i) => (
              <div key={i} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </div>
                  <div className="text-xs text-primary mt-2">
                    Focus: {action.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function calculateBenchmark(overallScore: number): {
  percentile: number;
  message: string;
} {
  // Simulated benchmark based on score distribution
  // In production, this would query actual database of completed audits
  let percentile = 50; // Default median

  if (overallScore >= 85) percentile = 90;
  else if (overallScore >= 75) percentile = 75;
  else if (overallScore >= 65) percentile = 60;
  else if (overallScore >= 50) percentile = 45;
  else if (overallScore >= 35) percentile = 30;
  else percentile = 15;

  const message = `You scored higher than ${percentile}% of similar SaaS startups in our database.`;

  return { percentile, message };
}

export function getAIInsight(
  categoryResults: Array<{ category: { title: string }; score: number; status: string }>
): string {
  const lowestCategory = categoryResults.reduce((min, cr) =>
    cr.score < min.score ? cr : min
  );

  const insights: Record<string, string> = {
    "Onboarding & Activation":
      "Your biggest opportunity is activation. Focus on reducing time-to-first-value — users who experience a quick win are 3x more likely to convert to paying customers.",
    "Customer Engagement":
      "Engagement is your weak point. Build automated re-activation campaigns and feature adoption nudges to keep users active and prevent silent churn.",
    "Product Feedback & Experience":
      "You're missing critical feedback signals. Implement exit surveys and NPS tracking to understand why customers leave before it's too late.",
    "Retention Marketing":
      "Your renewal process needs work. Create a proactive reminder sequence starting 30 days before expiration, with incentives for annual upgrades.",
    "Customer Success Process":
      "You lack a systematic retention framework. Assign a retention owner, define customer health scores, and create intervention playbooks for at-risk accounts.",
  };

  return (
    insights[lowestCategory.category.title] ||
    "Focus on building systematic processes to identify and prevent churn before it happens."
  );
}

export function getPlaybookRecommendations(
  category: string,
  status: string
): string[] {
  const recommendations: Record<string, string[]> = {
    "Onboarding & Activation": [
      "Create a 'First Value' checklist that guides users to their first win within 24 hours",
      "Set up milestone tracking with celebration emails for key activation points",
      "Implement time-to-first-value (TTFV) tracking in your analytics",
      "Build an interactive product tour highlighting your top 3 features",
      "Send a personalized welcome email with getting-started resources",
    ],
    "Customer Engagement": [
      "Build an automated reactivation campaign triggered after 14 days of inactivity",
      "Create monthly feature highlight emails showing unused valuable features",
      "Set up cohort-based engagement tracking to identify at-risk segments",
      "Implement in-app messaging for contextual feature announcements",
      "Track daily/weekly active users and set engagement thresholds",
    ],
    "Product Feedback & Experience": [
      "Add an exit survey for users who cancel or downgrade",
      "Create a feedback categorization system and monthly review process",
      "Implement proactive support ticket analysis to identify recurring issues",
      "Set up quarterly NPS surveys with follow-up workflows",
      "Build a public roadmap to show customers you're listening",
    ],
    "Retention Marketing": [
      "Design a renewal reminder sequence starting 30 days before expiration",
      "Create a loyalty rewards program or annual plan incentive",
      "Build a case study automation workflow featuring successful customers",
      "Implement win-back campaigns for recently churned customers",
      "Offer upgrade paths with clear ROI messaging for existing customers",
    ],
    "Customer Success Process": [
      "Assign a retention owner and define clear KPIs beyond churn rate",
      "Create a customer health score combining usage + engagement + support data",
      "Schedule quarterly business reviews for high-value accounts",
      "Build intervention playbooks for different risk levels",
      "Set up automated alerts when health scores drop below thresholds",
    ],
  };

  return recommendations[category] || [];
}

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingDown, Shield, Zap, BarChart3, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <TrendingDown className="h-4 w-4" />
              AI-Powered Churn Prevention
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Most SaaS teams only realize{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                churn after it happens
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Churnaizer is an AI dashboard that predicts who's about to churn, how much revenue is at risk, and what actions can save them.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                onClick={() => window.open("https://churnaizer.streamlit.app/predict", "_blank")}
                className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all"
              >
                Start Predicting Churn
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>94% Prediction Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Real-time Risk Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Automated Actions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              The Hidden Cost of Reactive Churn Management
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              By the time you notice a customer has churned, it's too late. Exit surveys and cancellation flows only tell you what went wrong — not who's at risk right now or what you can do to save them.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Predict, Prevent, Protect Your Revenue
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to reduce churn and maximize customer lifetime value
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "AI Churn Prediction",
                description: "Machine learning models analyze user behavior, engagement patterns, and billing data to predict churn probability with 94% accuracy."
              },
              {
                icon: BarChart3,
                title: "Revenue Risk Analysis",
                description: "See exactly how much MRR is at risk and prioritize customers by revenue impact, not just churn score."
              },
              {
                icon: Zap,
                title: "Smart Actions",
                description: "Get AI-powered recommendations on specific retention actions for each at-risk customer segment."
              },
              {
                icon: Clock,
                title: "Early Warning System",
                description: "Detect churn signals weeks before cancellation with real-time behavioral monitoring and alerts."
              },
              {
                icon: Shield,
                title: "Automated Retention",
                description: "Trigger personalized email sequences, in-app messages, or CRM notifications when users hit risk thresholds."
              },
              {
                icon: TrendingDown,
                title: "Recovery Analytics",
                description: "Track retention rate improvements, revenue saved, and campaign performance with detailed ROI metrics."
              }
            ].map((feature, i) => (
              <Card key={i} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Churnaizer Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From data to action in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Connect Your Data",
                description: "Integrate with your product analytics, CRM, or upload a CSV. We securely analyze user behavior, billing data, and engagement metrics."
              },
              {
                step: "02",
                title: "AI Predicts Risk",
                description: "Our models score every customer on a 0-100 churn risk scale, identifying early warning signs and revenue at risk."
              },
              {
                step: "03",
                title: "Take Action",
                description: "Get prioritized recommendations and trigger automated retention campaigns to save customers before they leave."
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: "94%", label: "Prediction Accuracy" },
              { value: "47%", label: "Avg. Churn Reduction" },
              { value: "$12M+", label: "Revenue Saved" },
              { value: "500+", label: "SaaS Companies" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Stop Losing Customers Before It's Too Late
            </h2>
            <p className="text-xl text-muted-foreground">
              Every day you wait, more customers churn. Start predicting and preventing churn today with AI-powered insights.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.open("https://churnaizer.streamlit.app/predict", "_blank")}
              className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started with Churnaizer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              5-minute setup • No credit card required • Start free
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Churnaizer. Predict & Prevent SaaS Churn with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 py-20">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find out your Retention Health Score in under 3 minutes
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Answer a few quick questions and get a personalized dashboard showing where you're losing customers — and how to fix it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/start")}
              className="text-lg px-8 py-6"
            >
              Start Free Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/sample-report")}
              className="text-lg px-8 py-6"
            >
              See Sample Report
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 py-16">
          {[
            {
              title: "3-Minute Audit",
              description: "Quick, focused questions that get to the heart of your retention challenges"
            },
            {
              title: "Instant Insights",
              description: "See your score breakdown across 5 critical retention categories"
            },
            {
              title: "Actionable Report",
              description: "Download a personalized PDF with next steps and proven playbooks"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-card border rounded-lg p-6 space-y-3 hover:shadow-lg transition-shadow">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Trusted by forward-thinking founders
          </p>
          <p className="text-lg text-muted-foreground italic">
            "Most founders chase new users while their existing customers quietly leave. This audit shows you exactly where to plug the leaks."
          </p>
        </div>
      </div>
    </div>
  );
}
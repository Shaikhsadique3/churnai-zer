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
            Most SaaS teams only realize churn after it happens
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Churnaizer is an AI dashboard that predicts who's about to churn, how much revenue is at risk, and what actions can save them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={() => window.open("https://churnaizer.streamlit.app/predict", "_blank")}
              className="text-lg px-8 py-6"
            >
              Fix Churn Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/start")}
              className="text-lg px-8 py-6"
            >
              Start Free Audit
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 py-16">
          {[
            {
              title: "AI Churn Prediction",
              description: "Machine learning models analyze behavior patterns to predict who's about to leave"
            },
            {
              title: "Revenue Risk Analysis",
              description: "See exactly how much revenue is at risk and which customers need attention first"
            },
            {
              title: "Smart Actions",
              description: "Get AI-powered recommendations on specific actions to save each at-risk customer"
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
            Stop churn before it happens
          </p>
          <p className="text-lg text-muted-foreground italic">
            "Predict who's leaving, understand why, and take action before they're gone. Churnaizer gives you the insights you need to save your customers."
          </p>
        </div>
      </div>
    </div>
  );
}
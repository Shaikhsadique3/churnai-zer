import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  eventLimit: string;
  popular?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started with feature adoption insights",
    eventLimit: "Up to 1,000 events/month",
    features: [
      "Basic feature adoption analytics",
      "CSV upload and processing", 
      "Simple dashboard with charts",
      "Date range filtering",
      "Power user identification",
      "Email support"
    ],
    cta: "Get Started Free"
  },
  {
    name: "Basic",
    price: "$10",
    description: "Ideal for small teams tracking feature adoption",
    eventLimit: "Up to 10,000 events/month",
    features: [
      "Everything in Free",
      "Advanced adoption analytics",
      "Plan-based adoption insights", 
      "Weekly email reports",
      "Data export capabilities",
      "Priority email support",
      "30-day data retention"
    ],
    popular: true,
    cta: "Start Basic Plan"
  },
  {
    name: "Pro", 
    price: "$19",
    description: "For growing companies with serious feature adoption needs",
    eventLimit: "Up to 100,000 events/month",
    features: [
      "Everything in Basic",
      "Real-time adoption tracking",
      "Custom date ranges", 
      "Advanced user segmentation",
      "API access for integrations",
      "Slack/Teams notifications",
      "1-year data retention",
      "Phone support"
    ],
    cta: "Go Pro"
  }
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FA</span>
              </div>
              <span className="font-bold text-lg">Feature Adoption</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              Back to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Choose the plan that fits your feature adoption tracking needs. 
          Upgrade or downgrade at any time.
        </p>
        
        {/* ROI Calculator Preview */}
        <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto mb-12">
          <h3 className="font-semibold mb-2">ROI Calculator</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Companies using feature adoption analytics see:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Feature adoption increase:</span>
              <span className="font-medium text-green-600">+35%</span>
            </div>
            <div className="flex justify-between">
              <span>User retention improvement:</span>
              <span className="font-medium text-green-600">+28%</span>
            </div>
            <div className="flex justify-between">
              <span>Development focus accuracy:</span>
              <span className="font-medium text-green-600">+60%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{plan.eventLimit}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    if (plan.name === "Free") {
                      navigate('/auth');
                    } else {
                      // For paid plans, this would integrate with Stripe
                      navigate('/auth');
                    }
                  }}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">What counts as an event?</h3>
              <p className="text-muted-foreground text-sm">
                An event is any feature adoption action tracked in your CSV upload. 
                Each row in your CSV represents one event.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What data formats do you support?</h3>
              <p className="text-muted-foreground text-sm">
                We currently support CSV files with user_id, feature_name, event_date, 
                and plan columns. Additional columns are stored as metadata.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely! We use enterprise-grade security with encryption at rest 
                and in transit. Your data is never shared with third parties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                We offer a 30-day money-back guarantee for all paid plans. 
                No questions asked!
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I get a demo?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Start with our free plan to explore all features with sample data, 
                or contact us for a personalized demo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Feature Adoption Dashboard. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
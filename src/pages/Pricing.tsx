import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      description: "Perfect for testing & very early SaaS companies",
      features: [
        "100 predictions/month",
        "Basic churn prediction",
        "3 email templates", 
        "Dashboard access",
        "Community support",
        "Basic analytics"
      ],
      cta: "Start Free Trial",
      popular: false,
      savings: null,
      roi: null
    },
    {
      name: "Starter",
      price: "$49",
      period: "month",
      description: "For early-stage SaaS (1-50 customers, $5k-20k MRR)",
      features: [
        "1,000 predictions/month",
        "Custom email sequences",
        "Webhook integrations",
        "Priority email support",
        "Recovery analytics",
        "A/B testing",
        "Real-time alerts"
      ],
      cta: "Start Growing",
      popular: true,
      savings: "$251/month",
      roi: "4-6x ROI"
    },
    {
      name: "Professional", 
      price: "$149",
      period: "month",
      description: "For growing SaaS (50-500 customers, $20k-200k MRR)",
      features: [
        "10,000 predictions/month",
        "Advanced AI models",
        "Custom integrations",
        "Priority support",
        "Revenue attribution",
        "Cohort analysis",
        "Team collaboration",
        "White-label emails"
      ],
      cta: "Scale Your Business",
      popular: false,
      savings: "$2,371/month",
      roi: "10-15x ROI"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large SaaS (500+ customers, $200k+ MRR)",
      features: [
        "Unlimited predictions",
        "Custom AI model training", 
        "Dedicated success manager",
        "Phone support",
        "SLA guarantees",
        "Custom reporting",
        "Advanced security features",
        "Multi-team access"
      ],
      cta: "Contact Sales",
      popular: false,
      savings: "$10k-20k/month",
      roi: "20-40x ROI"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-foreground">Churnaizer</h1>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          💰 Save 10-20x Your Subscription Cost
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">Pricing Built for Growing SaaS</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Start free and only pay when Churnaizer saves you customers. Our pricing scales with your business growth, 
          with each tier typically saving 10-20x its cost in prevented churn.
        </p>
        
        {/* ROI Calculator Preview */}
        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto mb-8">
          <div className="text-sm text-muted-foreground mb-2">ROI Calculator</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">$49</div>
              <div className="text-xs text-muted-foreground">Monthly Cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">$300</div>
              <div className="text-xs text-muted-foreground">Revenue Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">6x</div>
              <div className="text-xs text-muted-foreground">Return on Investment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period !== "contact us" && (
                    <span className="text-muted-foreground ml-2">/{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* ROI Information */}
                {plan.savings && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-6 text-center">
                    <div className="text-sm font-medium text-primary">Typical Customer Saves</div>
                    <div className="text-lg font-bold text-foreground">{plan.savings}</div>
                    <div className="text-xs text-muted-foreground">{plan.roi}</div>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/auth">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">How accurate are the churn predictions?</h3>
              <p className="text-muted-foreground">
                Our AI models achieve 94% accuracy by analyzing user behavior patterns, engagement metrics, and billing data. 
                The more data you provide, the more accurate predictions become.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">How long does it take to see results?</h3>
              <p className="text-muted-foreground">
                Most customers see their first at-risk user alerts within 24 hours of integration. 
                Significant retention improvements typically occur within 30-60 days.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">
                Yes. We're SOC 2 compliant and use bank-level encryption. Your data is never shared with third parties 
                and we follow strict privacy protocols.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">What if I have a custom tech stack?</h3>
              <p className="text-muted-foreground">
                Our SDK works with any JavaScript-based application. We also provide REST APIs and webhooks 
                for custom integrations with any platform.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I customize the retention emails?</h3>
              <p className="text-muted-foreground">
                Absolutely. You can create custom email templates, set up multi-step sequences, and A/B test different approaches. 
                We also provide proven templates to get you started.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you integrate with existing tools?</h3>
              <p className="text-muted-foreground">
                Yes! We integrate with popular CRMs (Salesforce, HubSpot), email platforms (Mailchimp, SendGrid), 
                and analytics tools (Mixpanel, Amplitude) via webhooks and APIs.
              </p>
            </div>
          </div>
          
          {/* CTA in FAQ */}
          <div className="text-center mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Ready to Stop Losing Customers?</h3>
            <p className="text-muted-foreground mb-6">
              Join 500+ SaaS founders who trust Churnaizer to protect their revenue. Start with 100 free predictions.
            </p>
            <Button size="lg" asChild>
              <Link to="/auth">Start Your Free Trial</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <Link to="/refund-policy" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
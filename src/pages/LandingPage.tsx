
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Mail, BookOpen, ArrowRight, Star, CheckCircle, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "TaskFlow",
      size: "12k MRR",
      quote: "We were bleeding $8k monthly to churn. Churnaizer's calculator showed us exactly what we were losing and the email templates helped us recover 23% of at-risk customers in the first month.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      company: "DataSync Pro",
      size: "45k MRR",
      quote: "The retention playbooks are gold. We implemented the 'Easy' strategies first and saw our churn drop from 8% to 5.2%. Simple but effective.",
      rating: 5
    },
    {
      name: "Jessica Park",
      company: "CloudBase",
      size: "28k MRR", 
      quote: "Finally, something that doesn't require a PhD to understand. The revenue calculator was eye-opening - we had no idea we were losing $12k annually to preventable churn.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: "Revenue Loss Calculator",
      description: "See exactly how much money you're losing to churn every month. Input your MRR and churn rate to get instant insights.",
      benefit: "Know your numbers"
    },
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: "AI Retention Emails",
      description: "Generate personalized retention emails that actually work. Templates proven to recover 15-30% of churning customers.",
      benefit: "Win back customers"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Retention Playbooks",
      description: "Step-by-step strategies from Easy to Advanced. Start reducing churn today with actionable frameworks.",
      benefit: "Take action immediately"
    }
  ];

  const painPoints = [
    "Customers disappearing without warning",
    "Revenue targets missed month after month",
    "No idea why users are leaving",
    "Generic retention emails that don't work",
    "Complex analytics tools that confuse more than help"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Churnaizer</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Stop Losing Revenue to
            <span className="text-primary block">Silent Customer Churn</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Most SaaS founders don't realize they're bleeding money until it's too late. 
            Calculate your churn impact, generate winning retention emails, and get proven playbooks—all in 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/auth">
                Start Free Calculator <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              No signup required • See results instantly
            </p>
          </div>
          
          {/* Pain Point Checker */}
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-4 text-foreground">Sound familiar?</h3>
            <div className="grid grid-cols-1 gap-2 text-left">
              {painPoints.map((pain, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span className="text-sm text-muted-foreground">{pain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Fight Churn
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three powerful tools in one simple dashboard. No complexity, no confusion—just results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center text-primary font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {feature.benefit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real Results from Real Founders
            </h2>
            <p className="text-lg text-muted-foreground">
              SaaS founders using Churnaizer to protect their revenue
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="border-t border-border pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    <div className="text-xs text-primary font-medium">{testimonial.size}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Stop the Revenue Leak?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 500+ SaaS founders who've already reduced their churn and protected their revenue with Churnaizer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/auth">
                Start Your Free Analysis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>✓ No credit card</span>
                <span>✓ Instant results</span>
                <span>✓ 5-minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Churnaizer</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Churnaizer. Stop churn, save revenue.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

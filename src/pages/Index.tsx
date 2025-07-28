import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Brain, DollarSign, Database, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicHead } from "@/components/common/DynamicHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-waitlist-email', {
        body: { email, firstName: name }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll be in touch soon!",
      });
      
      setEmail("");
      setName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DynamicHead 
        title="Churnaizer – Predict and Prevent SaaS Churn with AI"
        description="Track user behavior, predict churn, and send AI-powered retention emails – all in one SDK. Trusted by 100+ SaaS founders."
      />
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-primary">Churnaizer</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#features" className="text-foreground/70 hover:text-foreground font-medium">
                Features
              </Link>
              <Link to="#how-it-works" className="text-foreground/70 hover:text-foreground font-medium">
                How It Works
              </Link>
              <Link to="#testimonials" className="text-foreground/70 hover:text-foreground font-medium">
                Testimonials
              </Link>
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90">Dashboard</Button>
                </Link>
              ) : (
                <Button className="bg-primary hover:bg-primary/90">Join Waitlist</Button>
              )}
            </div>
          </div>
        </nav>

        {/* Announcement Banner */}
        <div className="bg-muted text-center py-3">
          <p className="text-sm text-muted-foreground">
            Launching Soon — Join the Waitlist
          </p>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Reduce SaaS Customer{" "}
                <span className="text-primary">Churn Effortlessly</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Leverage AI-driven insights to retain customers and boost recurring revenue.
              </p>
              
              {!user && (
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 mb-6 max-w-md">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? "Joining..." : "Join Waitlist"}
                  </Button>
                </form>
              )}
              
              <Link 
                to="#how-it-works" 
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
              >
                See How It Works <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <img 
                  src="/placeholder.svg" 
                  alt="Churnaizer dashboard for AI-driven SaaS revenue optimization"
                  className="w-full h-80 object-cover rounded-lg bg-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/30 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Why SaaS Founders Trust <span className="text-primary">Churnaizer</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Optimize your revenue operations and reduce churn with our comprehensive suite 
                of tools designed specifically for SaaS businesses.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center border-0 bg-background shadow-sm">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Track MRR & Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Monitor your monthly recurring revenue and growth metrics in real-time with intuitive dashboards.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-0 bg-background shadow-sm">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">AI-Driven Churn Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Use advanced AI to identify at-risk customers before they cancel, with actionable retention strategies.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-0 bg-background shadow-sm">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Automate Payment Recovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Recapture lost revenue with smart dunning processes and payment failure prevention.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-0 bg-background shadow-sm">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Database className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Seamless CRM Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Connect with HubSpot, Salesforce, and more for unified customer data and actions.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-16">
              <p className="text-lg font-medium text-foreground mb-6">Integrates Seamlessly With</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="h-12 w-32 bg-muted rounded flex items-center justify-center text-sm font-medium">
                  HubSpot
                </div>
                <div className="h-12 w-32 bg-muted rounded flex items-center justify-center text-sm font-medium">
                  Salesforce
                </div>
                <div className="h-12 w-32 bg-muted rounded flex items-center justify-center text-sm font-medium">
                  Zoho CRM
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                How Churnaizer Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Our simple four-step process helps you optimize revenue and reduce churn
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    01
                  </div>
                  <div className="h-32 w-full bg-muted/30 rounded-lg mb-4"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create an account in just 2 minutes. No credit card required.
                </p>
              </div>
              
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    02
                  </div>
                  <div className="h-32 w-full bg-muted/30 rounded-lg mb-4"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Integrate Payments & CRM</h3>
                <p className="text-muted-foreground">
                  Connect Stripe/Razorpay & sync your CRM for better customer insights.
                </p>
              </div>
              
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    03
                  </div>
                  <div className="h-32 w-full bg-muted/30 rounded-lg mb-4"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get AI-Driven Insights</h3>
                <p className="text-muted-foreground">
                  Churnaizer predicts churn risk & provides action steps inside your CRM.
                </p>
              </div>
              
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    04
                  </div>
                  <div className="h-32 w-full bg-muted/30 rounded-lg mb-4"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Increase Revenue & Retain Users</h3>
                <p className="text-muted-foreground">
                  Take automated actions to reduce churn & grow faster.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Button className="bg-primary hover:bg-primary/90" size="lg">
                Join the Waitlist
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-muted/30 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Trusted by SaaS Founders
              </h2>
              <p className="text-xl text-muted-foreground">
                Join 1,000+ SaaS founders who use Churnaizer to reduce churn and scale revenue
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-background border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                      JS
                    </div>
                    <div>
                      <div className="font-semibold text-lg">James Smith</div>
                      <div className="text-muted-foreground">Founder, GrowthMetrics</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "Churnaizer + HubSpot integration helped us reduce churn by 20% in just one month! 
                    The AI predictions are amazingly accurate."
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                      SP
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Sarah Peterson</div>
                      <div className="text-muted-foreground">CEO, LeadSquared</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "The Salesforce integration is seamless. Our customer success team now has all 
                    the churn prediction data exactly where they need it."
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                      MK
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Michael Kim</div>
                      <div className="text-muted-foreground">Founder, RevenuePilot</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "Automated payment recovery alone increased our MRR by 8%. The ROI was immediate 
                    and the setup took minutes."
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-8">
                Trusted by 1,000+ SaaS founders to reduce churn & scale revenue
              </p>
              
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4">Why SaaS Founders Trust Churnaizer</h3>
                <p className="text-muted-foreground mb-6">
                  Backed by Product Hunt and designed by founders who understand your revenue challenges
                </p>
                <div className="flex justify-center">
                  <div className="h-12 w-48 bg-muted rounded flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary mr-2" />
                    <span className="text-sm font-medium">Featured on Product Hunt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Don't Miss Out – Get AI-Driven Revenue Optimization Inside Your CRM!
            </h2>
            
            <div className="bg-muted/30 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold mb-6">Join the Waitlist</h3>
              {!user && (
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isLoading ? "Joining..." : "Join Waitlist"}
                  </Button>
                </form>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                By joining, you agree to receive updates about Churnaizer. We respect your privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background py-8">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary mb-4">Churnaizer</h3>
              <p className="text-sm text-muted-foreground">
                © 2024 Churnaizer. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Brain, DollarSign, Database, Award, AlertTriangle, Code, Shield, Zap, BarChart3, Mail, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicHead } from "@/components/common/DynamicHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import dashboardPreview from "@/assets/dashboard-preview.png";
import retentionAlert from "@/assets/retention-alert-modal.png";
import dashboardVideo from "@/assets/dashboard-video-preview.png";

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
                Stop Guessing. Start Predicting.{" "}
                <span className="text-primary">Grow with Churnaizer.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Churnaizer connects in under 2 minutes, shows user risk in real time, and guides you on how to retain high-value customers.
              </p>
              
              {!user && (
                <div className="space-y-4 mb-8">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
                    size="lg"
                    onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Get Your SDK Code
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    No code. No complexity. Just paste 1 line of code.
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>2-min Setup</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={dashboardPreview} 
                alt="Churnaizer dashboard showing retention rates and churn risk analysis"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                You lose revenue every month... and you don't even know why.
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Most SaaS tools only show you metrics after users churn. Churnaizer warns you before they quit.
              </p>
              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="p-6 bg-background rounded-lg">
                  <h3 className="font-semibold text-destructive mb-3">🔴 Without Churnaizer</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Losing users silently</li>
                    <li>Manual guesswork</li>
                    <li>Revenue loss</li>
                  </ul>
                </div>
                <div className="p-6 bg-background rounded-lg">
                  <h3 className="font-semibold text-primary mb-3">✅ With Churnaizer</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Get churn alerts</li>
                    <li>AI-based decisions</li>
                    <li>Predictable growth</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Features → Benefits in Simple Terms
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Use non-technical language for maximum clarity and impact
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center border-0 bg-background shadow-sm p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Easy Setup</h3>
                <p className="text-muted-foreground text-sm">
                  Paste one JavaScript snippet, and you're done in under 2 minutes.
                </p>
              </Card>

              <Card className="text-center border-0 bg-background shadow-sm p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Real-Time Churn Scores</h3>
                <p className="text-muted-foreground text-sm">
                  Instantly know which users are at risk.
                </p>
              </Card>

              <Card className="text-center border-0 bg-background shadow-sm p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Auto Email Recommendations</h3>
                <p className="text-muted-foreground text-sm">
                  Psychology-driven messages written for you.
                </p>
              </Card>

              <Card className="text-center border-0 bg-background shadow-sm p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">One Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  See all user trends, risk levels, and action suggestions in one place.
                </p>
              </Card>
            </div>

            <div className="text-center mt-16">
              <div className="mb-6">
                <img 
                  src={retentionAlert} 
                  alt="Retention alert showing churn prediction and email automation"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
                />
              </div>
              <p className="text-lg font-medium text-foreground mb-6">Trusted by SaaS teams worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="h-12 w-32 bg-muted rounded flex items-center justify-center text-sm font-medium">
                  GDPR Compliant
                </div>
                <div className="h-12 w-32 bg-muted rounded flex items-center justify-center text-sm font-medium">
                  SSL Secure
                </div>
                <div className="h-12 w-32 bg-muted rounded flex items-center justify-center text-sm font-medium">
                  Supabase
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-muted/30 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                How It Works (3 Steps)
              </h2>
              <p className="text-xl text-muted-foreground">
                Connect your app → Track & predict churn → Act instantly
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  01
                </div>
                <h3 className="text-xl font-semibold mb-4">Connect your app</h3>
                <p className="text-muted-foreground">
                  2-min setup — paste one JavaScript snippet and you're done.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  02
                </div>
                <h3 className="text-xl font-semibold mb-4">Track & Predict churn with AI</h3>
                <p className="text-muted-foreground">
                  Get real-time alerts when users are at risk of churning.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-6">
                  03
                </div>
                <h3 className="text-xl font-semibold mb-4">Act instantly with retention playbooks</h3>
                <p className="text-muted-foreground">
                  Send AI-powered retention emails automatically.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <div className="mb-8">
                <img 
                  src={dashboardVideo} 
                  alt="Watch demo of Churnaizer dashboard in action"
                  className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl cursor-pointer"
                />
                <div className="flex items-center justify-center mt-4">
                  <Play className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">Watch Demo (90s)</span>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90" size="lg">
                Try it in sandbox →
              </Button>
            </div>
          </div>
        </section>

        {/* What You'll Save Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-foreground mb-8">
              What You'll Save
            </h2>
            <p className="text-xl text-primary font-semibold mb-12">
              "Founders using Churnaizer save up to $2,700/month on lost revenue."
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="p-8 bg-destructive/5 border border-destructive/20 rounded-lg">
                <h3 className="font-semibold text-destructive mb-6 text-lg">Without Churnaizer</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <span className="text-destructive">🔴</span>
                    <span className="text-muted-foreground">Losing users silently</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive">😵</span>
                    <span className="text-muted-foreground">Manual guesswork</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive">💸</span>
                    <span className="text-muted-foreground">Revenue loss</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-8 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold text-primary mb-6 text-lg">With Churnaizer</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✅</span>
                    <span className="text-muted-foreground">Get churn alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary">🤖</span>
                    <span className="text-muted-foreground">AI-based decisions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary">💰</span>
                    <span className="text-muted-foreground">Predictable growth</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials Section */}
        <section id="testimonials" className="bg-muted/30 py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Social Proof That Counts
              </h2>
              <p className="text-xl text-muted-foreground">
                Join 100+ early-stage SaaS founders using Churnaizer
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-background border-0 shadow-sm p-8">
                <p className="text-muted-foreground italic leading-relaxed mb-6">
                  "We lost 5 customers last month—Churnaizer flagged the high-risk users and the founder sent AI-generated emails. No churn since. Priceless."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                    SF
                  </div>
                  <div>
                    <div className="font-semibold">SaaS Founder</div>
                    <div className="text-muted-foreground text-sm">Early Beta User</div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-background border-0 shadow-sm p-8">
                <p className="text-muted-foreground italic leading-relaxed mb-6">
                  "We recovered 13 users in our first month using Churnaizer. The email automation alone pays for itself."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                    CF
                  </div>
                  <div>
                    <div className="font-semibold">Co-founder</div>
                    <div className="text-muted-foreground text-sm">B2B SaaS</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center mt-16">
              <div className="max-w-lg mx-auto">
                <p className="text-lg font-semibold mb-4">Psychological Triggers</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4">
                    <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">On average, losing 5% of customers shrinks MRR by up to 95%</p>
                  </div>
                  <div className="p-4">
                    <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">100+ SaaS founders using Churnaizer</p>
                  </div>
                  <div className="p-4">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Only a few founder slots available in this launch round</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                FAQ Section to Handle Objections
              </h2>
              <p className="text-xl text-muted-foreground">
                Clear answers to common founder questions
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-background border rounded-lg">
                  <h3 className="font-semibold mb-3">How does Churnaizer collect user data?</h3>
                  <p className="text-muted-foreground text-sm">
                    Just one snippet connects securely to your site—no databases to sync.
                  </p>
                </div>
                
                <div className="p-6 bg-background border rounded-lg">
                  <h3 className="font-semibold mb-3">Do I need a technical team?</h3>
                  <p className="text-muted-foreground text-sm">
                    Absolutely not. Setup takes under 2 minutes.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-background border rounded-lg">
                  <h3 className="font-semibold mb-3">Can I try it before paying?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes—access is carefully curated. You can join as a beta-user before launch.
                  </p>
                </div>
                
                <div className="p-6 bg-background border rounded-lg">
                  <h3 className="font-semibold mb-3">What's the pricing?</h3>
                  <p className="text-muted-foreground text-sm">
                    Beta Access Only — Invite Required. Starts at $49/month. No long-term commitment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20" id="waitlist-form">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Get Your Access Code
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Stay on our waitlist → you'll get early access code, exclusive pricing, and founder support.
            </p>
            
            <div className="bg-muted/30 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold mb-6">Request Access</h3>
              {!user && (
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Company"
                    className="mb-4"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isLoading ? "Requesting..." : "Get Your SDK Code"}
                  </Button>
                </form>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                No long-term commitment. Cancel anytime.
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, BarChart3, Shield, Zap, Users, CheckCircle, Upload, Brain, Target, TrendingUp, Mail, Eye, Play } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WaitlistLanding = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-waitlist-email', {
        body: { name: formData.firstName, email: formData.email, company: formData.company }
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Welcome to the waitlist! 🎉",
        description: "Check your email for confirmation.",
      });
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4 animate-fade-in">You're on the list!</h1>
          <p className="text-muted-foreground mb-6 animate-fade-in">
            Thanks for joining the Churnaizer waitlist. We've sent a confirmation email to {formData.email}.
          </p>
          <p className="text-sm text-muted-foreground">
            We'll keep you updated on our launch and give you early access to exclusive features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex items-center space-x-3">
          <Logo size="md" />
          <h1 className="text-2xl font-bold text-foreground">Churnaizer</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = 'https://auth.churnaizer.com/auth'}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Predict and Prevent SaaS Churn with AI.
          </h1>
          <p className="text-2xl text-primary font-semibold mb-8 animate-fade-in">
            Stop guessing. Start retaining.
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
            Join 100+ founders who are rethinking customer retention with Churnaizer.
          </p>
          
          {/* Waitlist Form */}
          <Card className="max-w-lg mx-auto shadow-lg animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl">Join the Waitlist</CardTitle>
              <CardDescription>
                Be the first to predict churn like a pro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Your first name"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="your@email.com"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Your company name"
                    className="h-12"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold hover-scale" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
              
              {/* Trust Tags */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  Built for SaaS teams
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  Backed by AI
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  GDPR-ready & secure
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4 animate-fade-in">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-lg">
          Three simple steps to predict and prevent churn
        </p>
        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">1️⃣ Upload Your Data</h3>
            <p className="text-muted-foreground">
              Import your user behavior via CSV or SDK
            </p>
          </div>
          
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
              <Brain className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">2️⃣ AI Predicts Churn Risk</h3>
            <p className="text-muted-foreground">
              Instantly segment users by churn likelihood
            </p>
          </div>
          
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
              <Target className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">3️⃣ Retain Smarter</h3>
            <p className="text-muted-foreground">
              Take action with psychology-based email & automation playbooks
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4">
          Who It's For
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg max-w-3xl mx-auto">
          "If churn is hurting your growth, Churnaizer gives you clarity, predictions, and automation — all in one place."
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { title: "SaaS Founders", icon: Users },
            { title: "Customer Success Teams", icon: Shield },
            { title: "Product Managers", icon: TrendingUp },
            { title: "Marketing Ops Teams", icon: Mail }
          ].map((item, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300 hover-scale">
              <item.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground">{item.title}</h3>
            </Card>
          ))}
        </div>
      </section>

      {/* What You'll Get Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4">
          What You'll Get
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Everything you need to predict and prevent churn
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 hover-scale">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">🚦 AI-Powered Churn Predictions</h3>
                <p className="text-muted-foreground">See who's about to leave, before it happens</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 hover-scale">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">✉️ Smart Retention Campaigns</h3>
                <p className="text-muted-foreground">Auto-generated emails using behavior psychology</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 hover-scale">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">📈 Insights Dashboard</h3>
                <p className="text-muted-foreground">Visual breakdown of risk levels, usage, support trends</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300 hover-scale">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">🧠 Retention Playbook Templates</h3>
                <p className="text-muted-foreground">Proven strategies for every churn trigger</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4">
          Why Trust Churnaizer?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
          <div className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">🔒 Secure Infrastructure</h3>
            <p className="text-sm text-muted-foreground">Powered by Supabase + Resend</p>
          </div>
          
          <div className="text-center">
            <Eye className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">🔍 Privacy First</h3>
            <p className="text-sm text-muted-foreground">No shady tracking — your data stays yours</p>
          </div>
          
          <div className="text-center">
            <Users className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">🤝 Built by Founders</h3>
            <p className="text-sm text-muted-foreground">Real founders building in public</p>
          </div>
          
          <div className="text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">📬 Trusted Email</h3>
            <p className="text-sm text-muted-foreground">Sent via nexa@churnaizer.com</p>
          </div>
        </div>
        
        {/* Psychology Hooks */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Early Access Benefits:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  Priority beta invitations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  Retention Playbook Library access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  Help shape the product
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Backed by Research:</h3>
              <p className="text-muted-foreground">
                Inspired by psychology research on loss aversion, friction, and motivation to create proven retention strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Be the first to predict churn like a pro
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            — before your next renewal cycle.
          </p>
          
          <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm animate-scale-in">
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="flex-1"
                  type="email"
                />
                <Button className="hover-scale">
                  Join Waitlist
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                ✅ You'll receive a confirmation email from nexa@churnaizer.com
              </p>
            </CardContent>
          </Card>
          
          <div className="mt-12 text-center">
            <p className="text-primary-foreground/80 text-lg">
              🔥 <span className="font-semibold">100+ SaaS leaders</span> have already signed up
            </p>
            <p className="text-primary-foreground/70 text-sm mt-2">
              We're onboarding users in limited batches.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WaitlistLanding;
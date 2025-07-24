import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, BarChart3, Shield, Zap, Users, CheckCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const WaitlistLanding = () => {
  const [formData, setFormData] = useState({
    name: '',
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
        body: formData
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
          <h1 className="text-3xl font-bold text-foreground mb-4">You're on the list!</h1>
          <p className="text-muted-foreground mb-6">
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
          <h2 className="text-6xl font-bold text-foreground mb-6">
            AI-Powered Churn Prevention for SaaS Founders
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Stop losing customers before they leave. Get AI-driven insights, automated retention campaigns, 
            and proactive alerts to keep your SaaS growing.
          </p>
          
          {/* Waitlist Form */}
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Join the Waitlist</CardTitle>
              <CardDescription>
                Be the first to access Churnaizer when we launch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Your company name"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center text-foreground mb-4">
          Why SaaS Founders Choose Churnaizer
        </h3>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Three core features that protect your customer base
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-foreground">AI Churn Prediction</CardTitle>
              <CardDescription className="text-muted-foreground">
                Machine learning algorithms analyze user behavior patterns to predict churn risk before it happens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Real-time risk scoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Behavioral pattern analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Proactive alerts
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-foreground">Automated Retention</CardTitle>
              <CardDescription className="text-muted-foreground">
                Psychology-driven email campaigns that automatically engage at-risk users with personalized messaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  AI-generated content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Psychology-based messaging
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Automated workflows
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors duration-300 hover:shadow-lg">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-foreground">User Intelligence</CardTitle>
              <CardDescription className="text-muted-foreground">
                Complete customer journey tracking with actionable insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  User behavior tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Engagement analytics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Action recommendations
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials/Social Proof */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-secondary-foreground mb-12">
            Trusted by Forward-Thinking SaaS Founders
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <div className="text-secondary-foreground/80">Churn Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">3x</div>
              <div className="text-secondary-foreground/80">Faster Detection</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-secondary-foreground/80">Automated Monitoring</div>
            </div>
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
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-sm">
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
import { DynamicHead } from "@/components/common/DynamicHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Lightbulb, TrendingUp, Shield, Zap, BarChart3, Code, DollarSign, Users, Bell } from "lucide-react";

const Features = () => {
  return (
    <>
      <DynamicHead 
        title="Churnaizer - Features"
        description="Explore the powerful features of Churnaizer: AI-powered churn prediction, real-time alerts, SDK integration, and more."
      />
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-primary">Churnaizer</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-foreground/70 hover:text-foreground font-medium">
                Home
              </Link>
              <Link to="/features" className="text-foreground/70 hover:text-foreground font-medium">
                Features
              </Link>
              <Link to="/blog" className="text-foreground/70 hover:text-foreground font-medium">
                Blog
              </Link>
              <Link to="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">Dashboard</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 max-w-6xl text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Powerful Features to Prevent Churn
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Churnaizer provides everything you need to understand, predict, and act on customer churn.
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
            size="lg"
            onClick={() => document.getElementById('sdk-instructions')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="AI-Powered Churn Prediction"
              description="Leverage advanced machine learning to accurately predict which users are at risk of churning before they leave."
            />
            <FeatureCard 
              icon={<Bell className="h-10 w-10 text-primary" />}
              title="Real-Time Churn Alerts"
              description="Receive instant notifications when a high-value customer shows signs of churn, allowing for timely intervention."
            />
            <FeatureCard 
              icon={<Code className="h-10 w-10 text-primary" />}
              title="Easy SDK Integration"
              description="Integrate Churnaizer with your SaaS product in minutes using our lightweight JavaScript SDK. No complex setup required."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Comprehensive Analytics Dashboard"
              description="Gain deep insights into user behavior, churn trends, and retention metrics through an intuitive and customizable dashboard."
            />
            <FeatureCard 
              icon={<Lightbulb className="h-10 w-10 text-primary" />}
              title="Actionable Retention Strategies"
              description="Get data-driven recommendations and automated workflows to re-engage at-risk users and improve retention rates."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="GDPR Compliant & Secure"
              description="Your data privacy and security are our top priorities. Churnaizer is built with robust security measures and is fully GDPR compliant."
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-primary" />}
              title="User Segmentation"
              description="Segment your users based on their behavior, value, and churn risk to tailor your retention efforts effectively."
            />
            <FeatureCard 
              icon={<DollarSign className="h-10 w-10 text-primary" />}
              title="Revenue Impact Analysis"
              description="Understand the direct impact of churn on your revenue and see how Churnaizer helps you recover lost revenue."
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Automated Email Campaigns"
              description="Set up automated email campaigns to reach out to at-risk users with personalized messages and offers."
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary text-primary-foreground py-20 text-center">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Stop Churning and Start Growing?
            </h2>
            <p className="text-xl mb-8">
              Join the growing number of SaaS businesses using Churnaizer to predict and prevent churn.
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => document.getElementById('sdk-instructions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Free Demo Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t py-8">
          <div className="container mx-auto px-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Churnaizer. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-card p-8 rounded-lg shadow-md text-center">
      <div className="flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Features;
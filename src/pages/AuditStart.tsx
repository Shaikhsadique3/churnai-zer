import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, BarChart3, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AuditStart() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStart = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create new audit
      const { data: audit, error } = await supabase
        .from('audits')
        .insert({
          user_id: user?.id || null,
          email: email || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to audit with the audit ID
      navigate(`/audit/${audit.id}`);
    } catch (error) {
      console.error('Error starting audit:', error);
      toast({
        title: "Error",
        description: "Failed to start audit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Let's Diagnose Your Retention Health</h1>
            <p className="text-lg text-muted-foreground">
              This audit takes under 3 minutes and gives you a clear picture of where customers are slipping away
            </p>
          </div>

          {/* Steps Overview */}
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-semibold">Here's how it works:</h2>
            
            <div className="space-y-4">
              {[
                {
                  icon: Clock,
                  title: "Step 1: Quick Questions",
                  description: "17 simple questions about your customer journey (1-5 scale)"
                },
                {
                  icon: BarChart3,
                  title: "Step 2: Instant Analysis",
                  description: "We calculate your Retention Health Score across 5 key categories"
                },
                {
                  icon: FileText,
                  title: "Step 3: Personalized Report",
                  description: "Download a PDF with insights, benchmarks, and action items"
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Email Input */}
            <div className="pt-6 space-y-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-md"
                />
                <p className="text-sm text-muted-foreground">
                  Get a copy of your report and save your progress
                </p>
              </div>

              <Button 
                size="lg" 
                onClick={handleStart}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Starting..." : "Begin Audit"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Privacy Note */}
          <p className="text-sm text-muted-foreground text-center">
            Your data is private and only used to generate your personalized report
          </p>
        </div>
      </div>
    </div>
  );
}
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold">Choose Your Audit Method</h1>
            <p className="text-muted-foreground text-lg">
              Know your retention. Prove it with data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Audit Option */}
            <Card className="p-8 space-y-6 hover:border-primary transition-colors">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Quick Audit</h2>
                  <p className="text-muted-foreground">Answer 20 questions in 3 minutes</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>20 retention questions (1-5 scale)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>5 category breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>60% accuracy baseline</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Label htmlFor="email-quick">Email (optional)</Label>
                  <Input
                    id="email-quick"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  
                  <Button onClick={handleStart} disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? "Starting..." : "Start Quick Audit"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Data Upload Option */}
            <Card className="p-8 space-y-6 hover:border-primary transition-colors">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Data Upload</h2>
                  <p className="text-muted-foreground">Upload CSV for precise analysis</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Upload user metrics CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Auto-detect retention metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Up to 90% accuracy</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => navigate("/upload")} className="w-full" size="lg">
                    Upload Data
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-muted/50">
            <div className="text-center space-y-2">
              <p className="font-medium">💡 Pro Tip</p>
              <p className="text-sm text-muted-foreground">
                Complete both audits for the highest accuracy! Merged results use: 40% questions + 60% data
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
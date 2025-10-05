import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Copy, Download, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailsTabProps {
  predictions: any[];
  uploadData: any;
}

export function EmailsTab({ predictions, uploadData }: EmailsTabProps) {
  const [generatedEmails, setGeneratedEmails] = useState<{ [key: string]: any }>({});
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const atRiskCustomers = predictions.filter(
    p => p.risk_level === 'high' || p.risk_level === 'medium'
  );

  const generateEmail = async (prediction: any) => {
    setGeneratingIds(prev => new Set(prev).add(prediction.customer_id));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('generate-email', {
        body: {
          prediction_id: prediction.id,
          customer_id: prediction.customer_id,
          churn_reason: prediction.churn_reason,
          risk_level: prediction.risk_level,
          usp_text: uploadData.usp_text,
          website_link: uploadData.website_link
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        if (error.message?.includes('Rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (error.message?.includes('credits')) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw error;
      }

      setGeneratedEmails(prev => ({
        ...prev,
        [prediction.customer_id]: data.email
      }));

      toast({
        title: "Email generated!",
        description: `Personalized retention email created for customer ${prediction.customer_id}`
      });

    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate email",
        variant: "destructive"
      });
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(prediction.customer_id);
        return next;
      });
    }
  };

  const copyEmail = (email: any) => {
    const emailText = `Subject: ${email.subject}\n\n${email.body}\n\nCTA: ${email.cta_text} - ${email.cta_link}`;
    navigator.clipboard.writeText(emailText);
    toast({
      title: "Copied to clipboard",
      description: "Email content copied successfully"
    });
  };

  const downloadAllEmails = () => {
    const csvContent = [
      ['Customer ID', 'Subject', 'Body', 'CTA Text', 'CTA Link'].join(','),
      ...Object.values(generatedEmails).map((email: any) => 
        [
          email.customer_id,
          `"${email.subject}"`,
          `"${email.body.replace(/"/g, '""')}"`,
          `"${email.cta_text}"`,
          email.cta_link
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retention-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Download started",
      description: `Downloading ${Object.keys(generatedEmails).length} emails`
    });
  };

  const generateAllEmails = async () => {
    for (const prediction of atRiskCustomers) {
      if (!generatedEmails[prediction.customer_id]) {
        await generateEmail(prediction);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return 'destructive';
    if (risk === 'medium') return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generated Retention Emails</h2>
          <p className="text-muted-foreground">
            {Object.keys(generatedEmails).length} of {atRiskCustomers.length} emails generated
          </p>
        </div>
        <div className="flex gap-2">
          {Object.keys(generatedEmails).length > 0 && (
            <Button onClick={downloadAllEmails} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          )}
          <Button 
            onClick={generateAllEmails}
            disabled={generatingIds.size > 0}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate All
          </Button>
        </div>
      </div>

      {/* Email Cards */}
      <div className="grid gap-4">
        {atRiskCustomers.map((prediction) => {
          const email = generatedEmails[prediction.customer_id];
          const isGenerating = generatingIds.has(prediction.customer_id);

          return (
            <Card key={prediction.customer_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Customer: {prediction.customer_id}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Churn Score: {prediction.churn_score}/100 • 
                      Revenue: ${prediction.monthly_revenue}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(prediction.risk_level)}>
                      {prediction.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!email && !isGenerating && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {prediction.churn_reason}
                    </p>
                    <Button onClick={() => generateEmail(prediction)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Email
                    </Button>
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Generating personalized retention email...
                    </p>
                  </div>
                )}

                {email && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Subject:</p>
                      <p className="font-medium">{email.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Body:</p>
                      <div 
                        className="prose prose-sm max-w-none p-4 bg-muted rounded-lg"
                        dangerouslySetInnerHTML={{ __html: email.body }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Call to Action:</p>
                      <Button asChild className="w-full">
                        <a href={email.cta_link} target="_blank" rel="noopener noreferrer">
                          {email.cta_text}
                        </a>
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => copyEmail(email)} className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Email
                      </Button>
                      <Button variant="outline" onClick={() => generateEmail(prediction)} className="flex-1">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

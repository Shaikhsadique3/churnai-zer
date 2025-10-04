import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Copy, Download, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailGeneratorTabProps {
  results: any;
  uspContent: string;
  websiteLink: string;
}

export function EmailGeneratorTab({ results, uspContent, websiteLink }: EmailGeneratorTabProps) {
  const [generatedEmails, setGeneratedEmails] = useState<Map<string, any>>(new Map());
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  if (!results) return null;

  const atRiskCustomers = results.results.filter(
    (r: any) => r.risk_level === 'critical' || r.risk_level === 'high'
  );

  const generateEmail = async (customer: any) => {
    setGenerating(prev => new Set(prev).add(customer.customer_id));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('generate-retention-emails', {
        body: {
          customer_id: customer.customer_id,
          customer_name: customer.customer_email?.split('@')[0] || 'there',
          churn_reason: customer.reason,
          risk_level: customer.risk_level,
          recommendations: customer.recommendations,
          usp_content: uspContent,
          website_link: websiteLink
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (error.message?.includes('402')) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw error;
      }

      setGeneratedEmails(prev => new Map(prev).set(customer.customer_id, data.email));
      
      toast({
        title: "Email generated!",
        description: `Personalized retention email created for ${customer.customer_id}`
      });

    } catch (error: any) {
      console.error('Email generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate email",
        variant: "destructive"
      });
    } finally {
      setGenerating(prev => {
        const newSet = new Set(prev);
        newSet.delete(customer.customer_id);
        return newSet;
      });
    }
  };

  const copyEmail = (email: any) => {
    const fullEmail = `Subject: ${email.subject}\n\n${email.body}\n\nCTA: ${email.cta_text}\nLink: ${email.cta_link}`;
    navigator.clipboard.writeText(fullEmail);
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard"
    });
  };

  const downloadAllEmails = () => {
    const emailsArray = Array.from(generatedEmails.entries());
    const csvContent = [
      ['Customer ID', 'Subject', 'Body', 'CTA Text', 'CTA Link'].join(','),
      ...emailsArray.map(([customerId, email]) => [
        customerId,
        `"${email.subject}"`,
        `"${email.body.replace(/"/g, '""')}"`,
        `"${email.cta_text}"`,
        email.cta_link
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retention-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `Downloaded ${emailsArray.length} emails`
    });
  };

  const generateAllEmails = async () => {
    const customersToGenerate = atRiskCustomers.filter(
      (c: any) => !generatedEmails.has(c.customer_id)
    );

    toast({
      title: "Generating emails...",
      description: `Processing ${customersToGenerate.length} customers`
    });

    // Generate in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < customersToGenerate.length; i += batchSize) {
      const batch = customersToGenerate.slice(i, i + batchSize);
      await Promise.all(batch.map(customer => generateEmail(customer)));
      
      // Wait 1 second between batches to respect rate limits
      if (i + batchSize < customersToGenerate.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {atRiskCustomers.length} At-Risk Customers
          </h3>
          <p className="text-sm text-gray-600">
            {generatedEmails.size} emails generated • {atRiskCustomers.length - generatedEmails.size} remaining
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={downloadAllEmails}
            disabled={generatedEmails.size === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download All
          </Button>
          <Button 
            onClick={generateAllEmails}
            disabled={generatedEmails.size === atRiskCustomers.length}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate All Emails
          </Button>
        </div>
      </div>

      {/* Customer Email Cards */}
      <div className="space-y-4">
        {atRiskCustomers.map((customer: any) => {
          const email = generatedEmails.get(customer.customer_id);
          const isGenerating = generating.has(customer.customer_id);

          return (
            <Card key={customer.customer_id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      {customer.customer_id}
                      <Badge className={getRiskColor(customer.risk_level)}>
                        {customer.risk_level}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {customer.reason}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {(customer.churn_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">churn risk</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {!email && !isGenerating && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-600 mb-4">
                      No email generated yet
                    </p>
                    <Button onClick={() => generateEmail(customer)} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate Email
                    </Button>
                  </div>
                )}

                {isGenerating && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-3 text-primary animate-spin" />
                    <p className="text-sm text-gray-600">
                      AI is crafting a personalized retention email...
                    </p>
                  </div>
                )}

                {email && !isGenerating && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">SUBJECT</div>
                      <div className="text-base font-semibold">{email.subject}</div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-2">EMAIL BODY</div>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: email.body }}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-xs font-semibold text-blue-800 mb-2">CALL TO ACTION</div>
                      <Button className="w-full" asChild>
                        <a href={email.cta_link} target="_blank" rel="noopener noreferrer">
                          {email.cta_text}
                        </a>
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => copyEmail(email)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy Email
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => generateEmail(customer)}
                      >
                        <Sparkles className="w-4 h-4" />
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

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Mail, Copy, Wand2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CalculationData, CompanyInfo } from '@/pages/RevenueRecoveryDashboard';

interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
  type: 'gentle' | 'urgent' | 'value-focused';
}

interface EmailGeneratorProps {
  calculationData: CalculationData | null;
  companyInfo: CompanyInfo;
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({
  calculationData,
  companyInfo
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateTemplates = async () => {
    if (!calculationData || !companyInfo.companyName) {
      toast({
        title: "Missing Information",
        description: "Please complete the revenue calculator and company info first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate 3 different email templates with different approaches
      const generatedTemplates: EmailTemplate[] = [
        {
          id: '1',
          type: 'gentle',
          subject: `We'd love to hear from you, ${companyInfo.companyName}`,
          body: `Hi there,

We noticed you haven't been as active with ${companyInfo.productType} lately, and we wanted to reach out personally.

At ${companyInfo.companyName}, your success is our priority. We're here to help you get the most value from our platform.

Is there anything specific you're struggling with? Our team is ready to help you achieve your goals in the ${companyInfo.industry} space.

Would you like to schedule a quick 15-minute call to discuss how we can better support your needs?

Best regards,
Customer Success Team`
        },
        {
          id: '2', 
          type: 'value-focused',
          subject: `Don't miss out on ${companyInfo.productType} ROI opportunities`,
          body: `Hello,

We've analyzed similar ${companyInfo.industry} companies and found they typically see 3x ROI within 90 days of full ${companyInfo.productType} implementation.

Since you're currently at risk of missing these benefits, we'd like to offer:

✅ Free strategy session with our ${companyInfo.industry} specialist
✅ Custom implementation roadmap
✅ 30-day dedicated support

Based on your current MRR of $${calculationData.mrr.toLocaleString()}, optimizing your retention could save you $${calculationData.recovery30.toLocaleString()} monthly.

Ready to unlock this potential? Let's talk.

Best,
Growth Team`
        },
        {
          id: '3',
          type: 'urgent',
          subject: `Action needed: Your ${companyInfo.companyName} account`,
          body: `Hi,

We've noticed decreased engagement with your ${companyInfo.productType} account and want to ensure you're not missing critical opportunities.

For ${companyInfo.industry} businesses like yours, the cost of delayed action can be significant - potentially $${Math.round(calculationData.monthlyRevenueLoss / 30).toLocaleString()} per day in lost opportunities.

We're offering immediate support:
• Priority onboarding review
• Direct access to our ${companyInfo.industry} expert
• Custom optimization plan

This offer expires in 48 hours. Let's get you back on track.

Reply now or call us directly.

Urgent Support Team`
        }
      ];

      setTemplates(generatedTemplates);
      toast({
        title: "✅ Templates Generated",
        description: "3 retention email templates are ready for use."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: `${type} copied to clipboard.`
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gentle': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'value-focused': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!calculationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Complete Calculator First
          </CardTitle>
          <CardDescription>
            Please complete the revenue calculator to generate personalized retention emails.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            AI-Powered Retention Email Generator
          </CardTitle>
          <CardDescription>
            Generate personalized retention emails based on your churn data and company profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateTemplates}
            disabled={loading || !companyInfo.companyName}
            className="w-full"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? 'Generating Templates...' : 'Generate Retention Email Templates'}
          </Button>
        </CardContent>
      </Card>

      {templates.length > 0 && (
        <div className="grid gap-6">
          {templates.map((template, index) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Template {index + 1}</CardTitle>
                  <Badge className={getTypeColor(template.type)}>
                    {template.type.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Subject Line</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(template.subject, 'Subject line')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{template.subject}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Email Body</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(template.body, 'Email body')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={template.body}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

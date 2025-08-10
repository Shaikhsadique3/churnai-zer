import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code, CopyCheck, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from '@/components/layout/PageLayout';

const snippet = `
<script>
  window.churnaizer = window.churnaizer || function() {
    (window.churnaizer.q = window.churnaizer.q || []).push(arguments);
  };

  // Identify the user (replace with actual user ID)
  churnaizer('identify', 'USER_ID');

  // Track user events (example)
  churnaizer('track', 'feature_used', { feature_name: 'dashboard' });
</script>
<script async src="https://app.churnaizer.com/script.js"></script>
`;

const IntegrationGuide = () => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          Integration Guide
        </CardTitle>
        <CardDescription>
          Add the Churnaizer script to your website to start tracking user behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="snippet">Code Snippet</Label>
          <Textarea
            id="snippet"
            value={snippet}
            readOnly
            rows={8}
            className="font-mono text-sm resize-none"
          />
          <Button size="sm" onClick={handleCopy} disabled={copied}>
            {copied ? (
              <>
                <CopyCheck className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Code className="h-4 w-4 mr-2" />
                Copy Snippet
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Instructions</Label>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Copy the code snippet above.
            </li>
            <li>
              Paste it into the `<head>` section of your website's HTML, ideally right before the closing `</head>` tag.
            </li>
            <li>
              Replace `"USER_ID"` with the actual unique identifier for each logged-in user on your site.
            </li>
            <li>
              Use the `churnaizer('track', 'event_name', { event_properties })` function to track key user actions, like feature usage, page views, etc.
            </li>
            <li>
              <Badge variant="secondary">
                <Link className="h-4 w-4 mr-2" />
                <a href="https://app.churnaizer.com/docs" target="_blank" rel="noopener noreferrer">
                  View Full Documentation
                </a>
              </Badge>
            </li>
          </ol>
        </div>

        <div className="space-y-2">
          <Label>Example: Identify User</Label>
          <Textarea
            readOnly
            value={`churnaizer('identify', 'user123');`}
            rows={1}
            className="font-mono text-sm resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Example: Track Feature Usage</Label>
          <Textarea
            readOnly
            value={`churnaizer('track', 'button_clicked', { button_name: 'Submit' });`}
            rows={1}
            className="font-mono text-sm resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const IntegrationPage = () => {
  return (
    <PageLayout 
      title="Website Integration" 
      description="Integrate Churnaizer with your website and track user behavior"
      icon={<Code className="h-8 w-8 text-primary" />}
    >
      <IntegrationGuide />
    </PageLayout>
  );
};

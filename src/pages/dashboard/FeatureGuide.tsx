
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Code, 
  Mail, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  Eye, 
  MessageSquare,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureGuide = () => {
  const features = [
    {
      page: 'Dashboard',
      icon: LayoutDashboard,
      route: '/dashboard',
      button: 'Refresh',
      buttonIcon: RefreshCw,
      function: 'Reloads predictions',
      description: 'Pulls new data from your integrated systems and updates churn predictions in real-time',
      status: 'live'
    },
    {
      page: 'SDK Integration',
      icon: Code,
      route: '/sdk',
      button: 'Check SDK Integration',
      buttonIcon: CheckCircle,
      function: 'Real-time test',
      description: 'Validates the complete integration flow from your website to our prediction engine',
      status: 'live'
    },
    {
      page: 'Email Logs',
      icon: Mail,
      route: '/email-logs',
      button: 'Expand',
      buttonIcon: Eye,
      function: 'Show full email',
      description: 'View complete AI-generated retention emails powered by OpenRouter AI content generation',
      status: 'live'
    },
    {
      page: 'Admin Inbox',
      icon: MessageSquare,
      route: '/admin/inbox',
      button: 'Email Entry',
      buttonIcon: MessageSquare,
      function: 'View support email',
      description: 'Access support communications routed through Supabase mail system',
      status: 'live'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <BookOpen className="h-4 w-4" />
          Feature Guide
        </div>
        <h1 className="text-4xl font-bold">Production-Ready Features</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete guide to all live features in your Churnaizer dashboard. Every feature listed here is fully functional and ready for production use.
        </p>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Quick Navigation
          </CardTitle>
          <CardDescription>
            Jump directly to any feature from here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Link key={index} to={feature.route}>
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm font-medium">{feature.page}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Features Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Reference</CardTitle>
          <CardDescription>
            Detailed breakdown of all production features and their functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature, index) => {
              const PageIcon = feature.icon;
              const ButtonIcon = feature.buttonIcon;
              
              return (
                <div key={index} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <PageIcon className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold">{feature.page}</h3>
                        <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                    <Link to={feature.route}>
                      <Button variant="outline" size="sm">
                        Visit Page
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Key Button</p>
                      <div className="flex items-center gap-2">
                        <ButtonIcon className="h-4 w-4" />
                        <span>{feature.button}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Function</p>
                      <p>{feature.function}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Recommended flow for new users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Set up SDK Integration</p>
                <p className="text-sm text-muted-foreground">Install our SDK on your website and verify the connection is working</p>
                <Link to="/sdk" className="inline-block mt-1">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Go to SDK Integration →
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Monitor your Dashboard</p>
                <p className="text-sm text-muted-foreground">View real-time churn predictions and user behavior analytics</p>
                <Link to="/dashboard" className="inline-block mt-1">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Go to Dashboard →
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Review Email Campaigns</p>
                <p className="text-sm text-muted-foreground">Check AI-generated retention emails sent to at-risk users</p>
                <Link to="/email-logs" className="inline-block mt-1">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Go to Email Logs →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureGuide;

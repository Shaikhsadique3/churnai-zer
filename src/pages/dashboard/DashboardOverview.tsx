
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Mail, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome to Churnaizer</h1>
        <p className="text-muted-foreground">
          Your AI-powered churn prevention dashboard. Get started with analytics and insights.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="text-center pb-2">
            <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Analytics Hub</CardTitle>
            <CardDescription>
              View comprehensive analytics and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/dashboard/analytics">
              <Button className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="text-center pb-2">
            <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <CardTitle className="text-lg">User Predictions</CardTitle>
            <CardDescription>
              Monitor churn predictions and user behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/dashboard/user-predictions">
              <Button variant="outline" className="w-full">
                View Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="text-center pb-2">
            <Mail className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-lg">Email Automation</CardTitle>
            <CardDescription>
              AI-powered retention email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/dashboard/email-automation">
              <Button variant="outline" className="w-full">
                View Emails
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="text-center pb-2">
            <BarChart3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <CardTitle className="text-lg">CSV Upload</CardTitle>
            <CardDescription>
              Import and analyze customer data
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/dashboard/csv-upload">
              <Button variant="outline" className="w-full">
                Upload Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to set up your churn prevention system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Set up Website Integration</p>
                <p className="text-sm text-muted-foreground">Install our SDK to start tracking user behavior</p>
                <Link to="/integration" className="inline-block mt-1">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Go to Integration →
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Upload Customer Data</p>
                <p className="text-sm text-muted-foreground">Import your existing customer data for analysis</p>
                <Link to="/dashboard/csv-upload" className="inline-block mt-1">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Upload CSV →
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Monitor Analytics</p>
                <p className="text-sm text-muted-foreground">View insights and track your retention performance</p>
                <Link to="/dashboard/analytics" className="inline-block mt-1">
                  <Button variant="link" className="h-auto p-0 text-primary">
                    View Analytics →
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


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Users, TrendingUp } from "lucide-react";
import { SimpleCSVUploader } from "@/components/dashboard/SimpleCSVUploader";
import { UploadHistorySection } from "@/components/dashboard/UploadHistorySection";

export const CSVUploadPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Upload className="h-6 w-6" />
              CSV Data Upload
            </h1>
            <p className="text-muted-foreground">Upload your user data to generate churn predictions</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Processed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+425 from last upload</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+1.2% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Data</CardTitle>
              <CardDescription>
                Upload a CSV file with your user data to generate churn predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleCSVUploader />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Requirements</CardTitle>
              <CardDescription>
                Ensure your CSV includes these required fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Required Fields:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• user_id (unique identifier)</li>
                  <li>• email (user email address)</li>
                  <li>• signup_date (YYYY-MM-DD format)</li>
                  <li>• last_activity_date (YYYY-MM-DD format)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Optional Fields:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• subscription_tier (free, pro, enterprise)</li>
                  <li>• monthly_revenue (numeric value)</li>
                  <li>• feature_usage_score (0-100)</li>
                  <li>• support_tickets (number of tickets)</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full">
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload History */}
      <UploadHistorySection />
    </div>
  );
};

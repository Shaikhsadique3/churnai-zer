import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChurnTrendChart } from "@/components/dashboard/ChurnTrendChart";
import { WeeklyReportCard } from "@/components/dashboard/WeeklyReportCard";
import { ChurnScoreTable } from "@/components/dashboard/ChurnScoreTable";
import { ChurnReasonTable } from "@/components/dashboard/ChurnReasonTable";

export const ChurnReportsPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">📊 Churn Reports</h1>
        <p className="text-muted-foreground">Analyze customer churn patterns and trends</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChurnTrendChart />
        <WeeklyReportCard />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChurnScoreTable />
        <ChurnReasonTable />
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Key Insights</CardTitle>
          <CardDescription>AI-powered analysis of your churn data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🎯 Top Risk Factor</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Low feature adoption is the leading indicator of churn risk in your customer base.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">✅ Success Pattern</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Customers with regular weekly logins have 85% lower churn rates.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Early Warning</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                23% of your users haven't logged in for over 30 days.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">🚀 Opportunity</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Implementing onboarding could reduce early-stage churn by ~40%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
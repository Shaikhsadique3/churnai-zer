import React from 'react';
import { RecoveredUsersTable } from "@/components/dashboard/RecoveredUsersTable";
import { RecoveryMetricsCards } from "@/components/dashboard/RecoveryMetricsCards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, CheckCircle } from "lucide-react";

export const RecoveredUsersPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Churn Recovery Tracking
            </h1>
            <p className="text-muted-foreground">Track recovered users and measure revenue saved from churn prevention</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/integration">
              <Code className="h-4 w-4 mr-2" />
              SDK Setup
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <RecoveryMetricsCards />

      {/* Recovered Users Table */}
      <RecoveredUsersTable />
    </div>
  );
};
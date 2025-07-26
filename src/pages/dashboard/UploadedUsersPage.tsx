import React from 'react';
import { UserPredictionsTable } from "@/components/dashboard/UserPredictionsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, Users } from "lucide-react";

export const UploadedUsersPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6" />
              User Predictions
            </h1>
            <p className="text-muted-foreground">Real-time churn predictions from your SDK data</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/integration">
              <Code className="h-4 w-4 mr-2" />
              SDK Setup
            </Link>
          </Button>
        </div>
      </div>

      <UserPredictionsTable />
    </div>
  );
};
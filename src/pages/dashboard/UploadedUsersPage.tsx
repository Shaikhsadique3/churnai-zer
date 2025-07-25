import React from 'react';
import { UserPredictionsTable } from "@/components/dashboard/UserPredictionsTable";

export const UploadedUsersPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">🔮 User Predictions</h1>
        <p className="text-muted-foreground">Real-time churn predictions from your SDK data</p>
      </div>

      <UserPredictionsTable />
    </div>
  );
};
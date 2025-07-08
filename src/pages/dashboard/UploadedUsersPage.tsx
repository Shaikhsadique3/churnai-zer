import React from 'react';
import { UploadedUsersTable } from "@/components/dashboard/UploadedUsersTable";

export const UploadedUsersPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">👥 Uploaded Users</h1>
        <p className="text-muted-foreground">Manage and analyze your customer data</p>
      </div>

      <UploadedUsersTable />
    </div>
  );
};
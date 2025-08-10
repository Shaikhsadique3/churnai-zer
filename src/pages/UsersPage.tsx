
import React from 'react';
import { UsersTable } from "@/components/dashboard/UsersTable";
import { PageLayout } from '@/components/layout/PageLayout';
import { Users } from 'lucide-react';

export const UsersPage = () => {
  return (
    <PageLayout 
      title="User Predictions" 
      description="AI-powered churn predictions and user insights"
      icon={<Users className="h-8 w-8 text-primary" />}
    >
      <UsersTable />
    </PageLayout>
  );
};

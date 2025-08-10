import React from 'react';
import { RecoveredUsersDashboard } from "@/components/dashboard/RecoveredUsersDashboard";
import { PageLayout } from '@/components/layout/PageLayout';
import { CheckCircle } from 'lucide-react';

export const RecoveredUsersPage = () => {
  return (
    <PageLayout 
      title="Churn Recovery" 
      description="Track successfully recovered customers and retention campaigns"
      icon={<CheckCircle className="h-8 w-8 text-primary" />}
    >
      <RecoveredUsersDashboard />
    </PageLayout>
  );
};

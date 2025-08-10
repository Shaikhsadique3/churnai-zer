
import React from 'react';
import { EmailAutomationDashboard } from "@/components/dashboard/EmailAutomationDashboard";
import { PageLayout } from '@/components/layout/PageLayout';
import { Mail } from 'lucide-react';

export const EmailAutomationPage = () => {
  return (
    <PageLayout 
      title="Email Automation" 
      description="Automated email campaigns for customer retention"
      icon={<Mail className="h-8 w-8 text-primary" />}
    >
      <EmailAutomationDashboard />
    </PageLayout>
  );
};

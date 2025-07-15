import React from 'react';
import { EmailProviderStatus } from "@/components/dashboard/EmailProviderStatus";
import { CRMIntegrationPanel } from "@/components/dashboard/CRMIntegrationPanel";

export const IntegrationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground mb-6">
          Connect your external tools and services to automate your churn prevention workflows.
        </p>
      </div>
      
      <div className="max-w-4xl space-y-6">
        <EmailProviderStatus />
        <CRMIntegrationPanel />
      </div>
    </div>
  );
};
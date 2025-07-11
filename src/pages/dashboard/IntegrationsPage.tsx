import React from 'react';
import CRMIntegrationPanel from "@/components/dashboard/CRMIntegrationPanel";
import SMTPConfigPanel from "@/components/dashboard/SMTPConfigPanel";

export const IntegrationsPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">🧩 CRM & Email Integration</h1>
        <p className="text-muted-foreground">Connect your tools to automate customer engagement</p>
      </div>

      <CRMIntegrationPanel />
      <SMTPConfigPanel />
    </div>
  );
};
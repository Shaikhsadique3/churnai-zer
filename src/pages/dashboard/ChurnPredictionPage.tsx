import React from 'react';
import { UserRiskTable } from '@/components/dashboard/UserRiskTable';
import { RiskSummaryCards } from '@/components/dashboard/RiskSummaryCards';
import { ChurnTrendChart } from '@/components/dashboard/ChurnTrendChart';
import { ChurnReasonTable } from '@/components/dashboard/ChurnReasonTable';
import { AutomatedPlaybookTrigger } from '@/components/dashboard/AutomatedPlaybookTrigger';

export const ChurnPredictionPage = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-foreground">🎯 Churn Prediction Dashboard</h1>
        <p className="text-muted-foreground">Monitor user risk levels and automated interventions</p>
      </div>

      {/* Risk Summary Cards */}
      <RiskSummaryCards />

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChurnTrendChart />
        <ChurnReasonTable />
      </div>

      {/* User Risk Table */}
      <UserRiskTable />

      {/* Automated Playbook Trigger */}
      <AutomatedPlaybookTrigger />
    </div>
  );
};
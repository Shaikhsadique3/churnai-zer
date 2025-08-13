
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { RevenueCalculator } from '@/components/revenue-recovery/RevenueCalculator';
import { EmailGenerator } from '@/components/revenue-recovery/EmailGenerator';
import { RetentionPlaybooks } from '@/components/revenue-recovery/RetentionPlaybooks';
import { RecoveryReport } from '@/components/revenue-recovery/RecoveryReport';
import { Calculator, Mail, BookOpen, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface CalculationData {
  mrr: number;
  churnRate: number;
  activeCustomers: number;
  monthlyRevenueLoss: number;
  recovery10: number;
  recovery20: number;
  recovery30: number;
}

export interface CompanyInfo {
  companyName: string;
  industry: string;
  productType: string;
}

export default function RevenueRecoveryDashboard() {
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    industry: '',
    productType: ''
  });

  return (
    <PageLayout 
      title="Revenue Recovery Center" 
      description="Calculate churn impact, generate retention emails, and access proven playbooks"
      icon={<TrendingUp className="h-8 w-8 text-primary" />}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Revenue Calculator
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Generator
            </TabsTrigger>
            <TabsTrigger value="playbooks" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Retention Playbooks
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Full Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-0">
            <RevenueCalculator 
              onCalculate={setCalculationData}
              companyInfo={companyInfo}
              onCompanyInfoChange={setCompanyInfo}
            />
          </TabsContent>

          <TabsContent value="emails" className="space-y-0">
            <EmailGenerator 
              calculationData={calculationData}
              companyInfo={companyInfo}
            />
          </TabsContent>

          <TabsContent value="playbooks" className="space-y-0">
            <RetentionPlaybooks calculationData={calculationData} />
          </TabsContent>

          <TabsContent value="report" className="space-y-0">
            <RecoveryReport 
              calculationData={calculationData}
              companyInfo={companyInfo}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign } from 'lucide-react';
import { CalculationData, CompanyInfo } from '@/pages/RevenueRecoveryDashboard';

interface RevenueCalculatorProps {
  onCalculate: (data: CalculationData) => void;
  companyInfo: CompanyInfo;
  onCompanyInfoChange: (info: CompanyInfo) => void;
}

export const RevenueCalculator: React.FC<RevenueCalculatorProps> = ({
  onCalculate,
  companyInfo,
  onCompanyInfoChange
}) => {
  const [mrr, setMrr] = useState<string>('');
  const [churnRate, setChurnRate] = useState<string>('');
  const [activeCustomers, setActiveCustomers] = useState<string>('');

  const calculateRevenueLoss = () => {
    const mrrNum = parseFloat(mrr) || 0;
    const churnRateNum = parseFloat(churnRate) || 0;
    const activeCustomersNum = parseInt(activeCustomers) || 0;

    if (mrrNum <= 0 || churnRateNum <= 0 || activeCustomersNum <= 0) {
      return;
    }

    // Calculate monthly revenue loss: MRR * (churn_rate / 100)
    const monthlyRevenueLoss = mrrNum * (churnRateNum / 100);
    
    // Calculate recovery scenarios (reducing churn by 10%, 20%, 30%)
    const recovery10 = monthlyRevenueLoss * 0.1; // 10% of loss recovered
    const recovery20 = monthlyRevenueLoss * 0.2; // 20% of loss recovered  
    const recovery30 = monthlyRevenueLoss * 0.3; // 30% of loss recovered

    const calculationData: CalculationData = {
      mrr: mrrNum,
      churnRate: churnRateNum,
      activeCustomers: activeCustomersNum,
      monthlyRevenueLoss,
      recovery10,
      recovery20,
      recovery30
    };

    onCalculate(calculationData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            Tell us about your business for personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              placeholder="e.g., Acme SaaS"
              value={companyInfo.companyName}
              onChange={(e) => onCompanyInfoChange({ ...companyInfo, companyName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Marketing, Healthcare, E-commerce"
              value={companyInfo.industry}
              onChange={(e) => onCompanyInfoChange({ ...companyInfo, industry: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="product-type">Product Type</Label>
            <Input
              id="product-type"
              placeholder="e.g., CRM Software, Analytics Platform"
              value={companyInfo.productType}
              onChange={(e) => onCompanyInfoChange({ ...companyInfo, productType: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Revenue Metrics
          </CardTitle>
          <CardDescription>
            Enter your current SaaS metrics to calculate churn impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mrr">Monthly Recurring Revenue (MRR)</Label>
            <Input
              id="mrr"
              type="number"
              placeholder="50000"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">Your total monthly subscription revenue</p>
          </div>
          <div>
            <Label htmlFor="churn-rate">Monthly Churn Rate (%)</Label>
            <Input
              id="churn-rate"
              type="number"
              step="0.1"
              placeholder="5.5"
              value={churnRate}
              onChange={(e) => setChurnRate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">Percentage of customers who cancel each month</p>
          </div>
          <div>
            <Label htmlFor="active-customers">Active Customers</Label>
            <Input
              id="active-customers"
              type="number"
              placeholder="1200"
              value={activeCustomers}
              onChange={(e) => setActiveCustomers(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">Total number of paying customers</p>
          </div>
          <Button 
            onClick={calculateRevenueLoss} 
            className="w-full"
            disabled={!mrr || !churnRate || !activeCustomers}
          >
            Calculate Revenue Impact
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

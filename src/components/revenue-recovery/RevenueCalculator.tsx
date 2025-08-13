import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from "@/hooks/use-toast";
import { CalculationData, CompanyInfo } from '@/pages/RevenueRecoveryDashboard';
import { useFounderStats } from '@/hooks/useFounderStats';

interface RevenueCalculatorProps {
  onCalculate: (data: CalculationData) => void;
  companyInfo: CompanyInfo;
  onCompanyInfoChange: (info: (prevState: CompanyInfo) => CompanyInfo) => void;
}

export const RevenueCalculator: React.FC<RevenueCalculatorProps> = ({ 
  onCalculate, 
  companyInfo, 
  onCompanyInfoChange 
}) => {
  const [mrr, setMrr] = useState(companyInfo.monthlyRevenue || 10000);
  const [churnRate, setChurnRate] = useState(companyInfo.churnRate || 2.0);
  const [activeCustomers, setActiveCustomers] = useState(500);
  const { toast } = useToast();
  
  const { updateActivityStat, saveCompanyData } = useFounderStats();

  const handleCalculate = async () => {
    if (mrr <= 0 || churnRate <= 0 || activeCustomers <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid positive numbers for all fields.",
        variant: "destructive"
      });
      return;
    }

    const monthlyRevenueLoss = (mrr * churnRate) / 100;
    const recovery10 = monthlyRevenueLoss * 0.10;
    const recovery20 = monthlyRevenueLoss * 0.20;
    const recovery30 = monthlyRevenueLoss * 0.30;

    const calculationData = {
      mrr,
      churnRate,
      activeCustomers,
      monthlyRevenueLoss,
      recovery10,
      recovery20,
      recovery30
    };

    onCalculate(calculationData);

    // Update activity stats and save company data
    await updateActivityStat('calculationsUsed');
    await saveCompanyData({
      companyName: companyInfo.companyName,
      monthlyRevenue: mrr,
      churnRate: churnRate
    });

    toast({
      title: "Calculation Complete",
      description: "Your churn impact has been calculated successfully.",
    });
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* Company Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Enter your company details to personalize your recovery strategy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyInfo.companyName}
              onChange={(e) => onCompanyInfoChange(prevState => ({ ...prevState, companyName: e.target.value }))}
              placeholder="Your Company Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={companyInfo.industry}
              onChange={(e) => onCompanyInfoChange(prevState => ({ ...prevState, industry: e.target.value }))}
              placeholder="e.g., SaaS, E-commerce"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productType">Product Type</Label>
            <Input
              id="productType"
              value={companyInfo.productType}
              onChange={(e) => onCompanyInfoChange(prevState => ({ ...prevState, productType: e.target.value }))}
              placeholder="e.g., Subscription, One-time Purchase"
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Impact Calculator Card */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Impact Calculator</CardTitle>
          <CardDescription>Calculate potential revenue loss due to churn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mrr">Monthly Recurring Revenue ($)</Label>
            <Input
              type="number"
              id="mrr"
              value={mrr}
              onChange={(e) => setMrr(Number(e.target.value))}
              placeholder="Enter MRR"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="churnRate">Churn Rate (%)</Label>
            <Input
              type="number"
              id="churnRate"
              value={churnRate}
              onChange={(e) => setChurnRate(Number(e.target.value))}
              placeholder="Enter Churn Rate"
            />
            <Slider
              defaultValue={[churnRate]}
              max={10}
              step={0.1}
              onValueChange={(value) => setChurnRate(value[0])}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activeCustomers">Active Customers</Label>
            <Input
              type="number"
              id="activeCustomers"
              value={activeCustomers}
              onChange={(e) => setActiveCustomers(Number(e.target.value))}
              placeholder="Enter Active Customers"
            />
          </div>
          <Button onClick={handleCalculate} className="w-full">
            Calculate Impact
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

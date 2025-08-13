
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { CalculationData, CompanyInfo } from '@/pages/RevenueRecoveryDashboard';

interface RecoveryReportProps {
  calculationData: CalculationData | null;
  companyInfo: CompanyInfo;
}

export const RecoveryReport: React.FC<RecoveryReportProps> = ({
  calculationData,
  companyInfo
}) => {
  const generatePDFReport = () => {
    if (!calculationData) return;
    
    // Simple PDF generation using browser print
    const reportContent = `
      <html>
        <head>
          <title>Revenue Recovery Report - ${companyInfo.companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .metric { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            .highlight { background: #f0f9ff; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Revenue Recovery Analysis</h1>
            <h2>${companyInfo.companyName}</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="metric">
            <h3>Current Metrics</h3>
            <p>Monthly Recurring Revenue: $${calculationData.mrr.toLocaleString()}</p>
            <p>Monthly Churn Rate: ${calculationData.churnRate}%</p>
            <p>Active Customers: ${calculationData.activeCustomers.toLocaleString()}</p>
          </div>
          
          <div class="highlight">
            <h3>Revenue Impact Analysis</h3>
            <p><strong>Monthly Revenue Loss: $${calculationData.monthlyRevenueLoss.toLocaleString()}</strong></p>
            <p>Annual Impact: $${(calculationData.monthlyRevenueLoss * 12).toLocaleString()}</p>
          </div>
          
          <div class="metric">
            <h3>Recovery Scenarios</h3>
            <p>10% Churn Reduction: $${calculationData.recovery10.toLocaleString()}/month recovered</p>
            <p>20% Churn Reduction: $${calculationData.recovery20.toLocaleString()}/month recovered</p>
            <p>30% Churn Reduction: $${calculationData.recovery30.toLocaleString()}/month recovered</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(reportContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  if (!calculationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Complete Calculator First
          </CardTitle>
          <CardDescription>
            Please complete the revenue calculator to generate your full recovery report.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getRiskLevel = (churnRate: number) => {
    if (churnRate > 10) return { level: 'Critical', color: 'bg-red-100 text-red-800' };
    if (churnRate > 7) return { level: 'High', color: 'bg-orange-100 text-orange-800' };
    if (churnRate > 5) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const risk = getRiskLevel(calculationData.churnRate);
  const annualLoss = calculationData.monthlyRevenueLoss * 12;
  const annualRecovery30 = calculationData.recovery30 * 12;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Executive Summary
          </CardTitle>
          <CardDescription>
            Complete revenue recovery analysis for {companyInfo.companyName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Churn Risk Level:</span>
            <Badge className={risk.color}>{risk.level}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                ${calculationData.monthlyRevenueLoss.toLocaleString()}
              </p>
              <p className="text-sm text-red-700">Monthly Revenue at Risk</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                ${calculationData.recovery30.toLocaleString()}
              </p>
              <p className="text-sm text-green-700">Potential Monthly Recovery</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${calculationData.mrr.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{calculationData.churnRate}%</p>
            <p className="text-sm text-muted-foreground">Monthly customer churn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{calculationData.activeCustomers.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Current customer base</p>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Scenarios</CardTitle>
          <CardDescription>
            Potential revenue recovery through churn reduction strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">10% Churn Reduction</p>
                <p className="text-sm text-muted-foreground">Conservative improvement</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ${calculationData.recovery10.toLocaleString()}/mo
                </p>
                <p className="text-sm text-muted-foreground">
                  ${(calculationData.recovery10 * 12).toLocaleString()}/year
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">20% Churn Reduction</p>
                <p className="text-sm text-muted-foreground">Realistic target</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ${calculationData.recovery20.toLocaleString()}/mo
                </p>
                <p className="text-sm text-muted-foreground">
                  ${(calculationData.recovery20 * 12).toLocaleString()}/year
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg bg-green-50">
              <div>
                <p className="font-medium">30% Churn Reduction</p>
                <p className="text-sm text-muted-foreground">Aggressive optimization</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ${calculationData.recovery30.toLocaleString()}/mo
                </p>
                <p className="text-sm text-muted-foreground">
                  ${annualRecovery30.toLocaleString()}/year
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <p>
                Your current churn rate of {calculationData.churnRate}% is costing you{' '}
                <strong>${calculationData.monthlyRevenueLoss.toLocaleString()}</strong> monthly, or{' '}
                <strong>${annualLoss.toLocaleString()}</strong> annually.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <p>
                Reducing churn by just 30% could recover{' '}
                <strong>${annualRecovery30.toLocaleString()}</strong> in annual revenue.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <p>
                With {calculationData.activeCustomers.toLocaleString()} active customers, each 1% churn improvement saves{' '}
                <strong>${Math.round(calculationData.monthlyRevenueLoss / calculationData.churnRate).toLocaleString()}</strong> monthly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Report */}
      <Card>
        <CardHeader>
          <CardTitle>Download Full Report</CardTitle>
          <CardDescription>
            Get a comprehensive PDF report with all calculations and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generatePDFReport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

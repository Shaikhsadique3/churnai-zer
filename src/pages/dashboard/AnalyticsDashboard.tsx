
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Download, Filter } from 'lucide-react';
import { addDays, format } from 'date-fns';
import Papa from 'papaparse';

interface DashboardFilters {
  planType: string;
  riskLevel: string;
  recoveryStatus: string;
  activityLevel: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    planType: 'all',
    riskLevel: 'all',
    recoveryStatus: 'all',
    activityLevel: 'all',
    dateRange: {
      from: addDays(new Date(), -30),
      to: new Date(),
    },
  });

  // Check user plan for restrictions
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_profile')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch analytics data for export
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-data', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_deleted', false);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isPaidPlan = userProfile?.revenue_model === 'Pro' || userProfile?.revenue_model === 'Enterprise';

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${filename}.csv`);
  };

  const exportAsPDF = async (data: any[], filename: string) => {
    // Create a simple HTML table for PDF generation
    const tableHtml = `
      <html>
        <head>
          <title>Analytics Export - ${format(new Date(), 'yyyy-MM-dd')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header-info { text-align: center; margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Churnaizer Analytics Report</h1>
          <div class="header-info">
            <p>Generated on: ${format(new Date(), 'PPP')}</p>
            <p>Total Records: ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {}).map(key => `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value || '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'text/html' });
    downloadFile(blob, `${filename}.html`);
  };

  const exportData = async (exportFormat: 'csv' | 'pdf') => {
    if (!analyticsData || analyticsData.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no analytics records to export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Prepare export data
      const preparedExportData = analyticsData.map(record => ({
        user_id: record.user_id,
        plan: record.plan,
        monthly_revenue: record.usage,
        churn_score: record.churn_score,
        risk_level: record.risk_level,
        churn_probability: record.churn_score ? `${(record.churn_score * 100).toFixed(1)}%` : 'N/A',
        last_login: record.last_login ? format(new Date(record.last_login), 'yyyy-MM-dd') : 'Never',
        created_at: format(new Date(record.created_at), 'yyyy-MM-dd'),
        churn_reason: record.churn_reason || 'Not analyzed'
      }));

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const baseFilename = `churnaizer-analytics-${timestamp}`;

      if (exportFormat === 'csv') {
        exportAsCSV(preparedExportData, baseFilename);
        toast({
          title: "CSV Export Successful",
          description: `${preparedExportData.length} records exported successfully.`,
        });
      } else {
        await exportAsPDF(preparedExportData, baseFilename);
        toast({
          title: "PDF Export Successful", 
          description: `${preparedExportData.length} records exported as HTML (open in browser to print as PDF).`,
        });
      }

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Analytics Hub
          </h1>
          <p className="text-muted-foreground">
            SaaS-grade analytics powered by real-time data
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportData('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportData('pdf')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Plan Type</label>
              <Select value={filters.planType} onValueChange={(value) => handleFilterChange('planType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Risk Level</label>
              <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Recovery Status</label>
              <Select value={filters.recoveryStatus} onValueChange={(value) => handleFilterChange('recoveryStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="not_recovered">Not Recovered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Activity Level</label>
              <Select value={filters.activityLevel} onValueChange={(value) => handleFilterChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="high">High Activity</SelectItem>
                  <SelectItem value="medium">Medium Activity</SelectItem>
                  <SelectItem value="low">Low Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => handleFilterChange('dateRange', dateRange)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <AnalyticsSummaryCards filters={filters} isPaidPlan={isPaidPlan} />

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Chart coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Chart coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, FileSpreadsheet, Code2, Filter } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface UserData {
  id: string;
  user_id: string;
  plan: string;
  usage: number;
  last_login: string | null;
  churn_score: number;
  churn_reason: string | null;
  risk_level: 'low' | 'medium' | 'high';
  understanding_score?: number;
  user_stage?: string;
  days_until_mature?: number;
  action_recommended?: string;
  created_at: string;
}

interface DataExportOptionsProps {
  data: UserData[];
  selectedUserIds?: string[];
}

type ExportFormat = 'csv' | 'xlsx' | 'json';
type ExportType = 'all' | 'selected' | 'filtered';

const DataExportOptions = ({ data, selectedUserIds = [] }: DataExportOptionsProps) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportType, setExportType] = useState<ExportType>('all');
  const [includeChurnData, setIncludeChurnData] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getExportData = (): UserData[] => {
    switch (exportType) {
      case 'selected':
        return data.filter(user => selectedUserIds.includes(user.id));
      case 'filtered':
        // This would be filtered data based on current table filters
        // For now, returning all data as we don't have access to filters here
        return data;
      case 'all':
      default:
        return data;
    }
  };

  const formatDataForExport = (rawData: UserData[]) => {
    return rawData.map(user => {
      const baseData = {
        user_id: user.user_id,
        plan: user.plan,
        monthly_revenue: user.usage,
        last_login: user.last_login ? new Date(user.last_login).toISOString() : null,
      };

      const churnData = includeChurnData ? {
        churn_score: user.churn_score,
        churn_probability_percent: user.churn_score ? (user.churn_score * 100).toFixed(2) + '%' : null,
        churn_reason: user.churn_reason,
        risk_level: user.risk_level,
        understanding_score: user.understanding_score,
        user_stage: user.user_stage,
        days_until_mature: user.days_until_mature,
        action_recommended: user.action_recommended,
      } : {};

      const metadata = includeMetadata ? {
        record_id: user.id,
        created_at: user.created_at,
        last_updated: new Date().toISOString(),
        export_timestamp: new Date().toISOString(),
      } : {};

      return {
        ...baseData,
        ...churnData,
        ...metadata,
      };
    });
  };

  const exportAsCSV = (exportData: any[], filename: string) => {
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${filename}.csv`);
  };

  const exportAsXLSX = (exportData: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Churn Analysis Data');
    
    // Add some styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'EEEEEE' } }
      };
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(blob, `${filename}.xlsx`);
  };

  const exportAsJSON = (exportData: any[], filename: string) => {
    const jsonData = {
      export_info: {
        timestamp: new Date().toISOString(),
        total_records: exportData.length,
        export_type: exportType,
        includes_churn_data: includeChurnData,
        includes_metadata: includeMetadata,
      },
      data: exportData
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    downloadFile(blob, `${filename}.json`);
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

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const rawData = getExportData();
      
      if (rawData.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no records matching your export criteria.",
          variant: "destructive"
        });
        return;
      }

      const exportData = formatDataForExport(rawData);
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `churn-analysis-${exportType}-${timestamp}`;

      switch (exportFormat) {
        case 'csv':
          exportAsCSV(exportData, baseFilename);
          break;
        case 'xlsx':
          exportAsXLSX(exportData, baseFilename);
          break;
        case 'json':
          exportAsJSON(exportData, baseFilename);
          break;
      }

      toast({
        title: "Export successful",
        description: `${rawData.length} records exported as ${exportFormat.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getExportIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv': return <FileText className="h-4 w-4" />;
      case 'xlsx': return <FileSpreadsheet className="h-4 w-4" />;
      case 'json': return <Code2 className="h-4 w-4" />;
    }
  };

  const getRecordCount = () => {
    switch (exportType) {
      case 'selected': return selectedUserIds.length;
      case 'all': return data.length;
      case 'filtered': return data.length; // Would be actual filtered count
      default: return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Export Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Scope</Label>
            <Select value={exportType} onValueChange={(value: ExportType) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span>All Records</span>
                    <span className="text-muted-foreground">({data.length} records)</span>
                  </div>
                </SelectItem>
                <SelectItem value="selected" disabled={selectedUserIds.length === 0}>
                  <div className="flex items-center gap-2">
                    <span>Selected Records</span>
                    <span className="text-muted-foreground">({selectedUserIds.length} records)</span>
                  </div>
                </SelectItem>
                <SelectItem value="filtered">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    <span>Current Filter View</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">File Format</Label>
            <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>CSV (Comma Separated)</span>
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel (XLSX)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    <span>JSON (Structured Data)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Include in Export</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-churn" 
                  checked={includeChurnData}
                  onCheckedChange={(checked) => setIncludeChurnData(checked === true)}
                />
                <Label htmlFor="include-churn" className="text-sm">
                  Churn Analysis Results
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Includes churn scores, predictions, reasons, and AI recommendations
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-metadata" 
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                />
                <Label htmlFor="include-metadata" className="text-sm">
                  Record Metadata
                </Label>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Includes record IDs, timestamps, and export information
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Records to export:</span>
              <span className="font-medium">{getRecordCount()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium flex items-center gap-1">
                {getExportIcon(exportFormat)}
                {exportFormat.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated file size:</span>
              <span className="font-medium">
                {exportFormat === 'json' ? '~' + Math.ceil(getRecordCount() * 0.5) + ' KB' : 
                 exportFormat === 'xlsx' ? '~' + Math.ceil(getRecordCount() * 0.3) + ' KB' :
                 '~' + Math.ceil(getRecordCount() * 0.2) + ' KB'}
              </span>
            </div>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting || getRecordCount() === 0}
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {getRecordCount()} Records
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportOptions;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Mail, Calendar } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Monthly Churn Report",
      description: "Comprehensive monthly analysis of customer churn patterns",
      date: "January 2024",
      status: "Ready",
      type: "PDF"
    },
    {
      title: "Risk Assessment Summary",
      description: "Customer risk scores and recommendations",
      date: "This Week",
      status: "Generated",
      type: "CSV"
    },
    {
      title: "Retention Campaign Results",
      description: "Email campaign performance and customer responses",
      date: "Last 30 Days",
      status: "Processing",
      type: "PDF"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Download and manage your churn analysis reports.
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <Badge 
                  variant={report.status === "Ready" ? "default" : 
                          report.status === "Generated" ? "secondary" : "outline"}
                >
                  {report.status}
                </Badge>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{report.date}</span>
                  </div>
                  <Badge variant="outline">{report.type}</Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={report.status === "Processing"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Automated Reports
          </CardTitle>
          <CardDescription>
            Set up automated report delivery to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Weekly Churn Summary</p>
                <p className="text-sm text-muted-foreground">
                  Every Monday at 9:00 AM
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Monthly Risk Report</p>
                <p className="text-sm text-muted-foreground">
                  First day of each month
                </p>
              </div>
              <Badge variant="outline">Inactive</Badge>
            </div>
            <Button variant="outline" className="w-full">
              Configure Email Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
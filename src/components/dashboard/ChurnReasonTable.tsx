import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ChurnReason {
  userId: string;
  primaryReason: string;
  confidence: number;
  actionable: boolean;
}

const mockReasons: ChurnReason[] = [
  { userId: "USR-001", primaryReason: "Decreased feature usage by 78%", confidence: 0.92, actionable: true },
  { userId: "USR-003", primaryReason: "No logins for 5+ days", confidence: 0.89, actionable: true },
  { userId: "USR-004", primaryReason: "Support tickets unresolved", confidence: 0.85, actionable: true },
  { userId: "USR-006", primaryReason: "Plan downgrade attempted", confidence: 0.76, actionable: false },
  { userId: "USR-007", primaryReason: "Low engagement with new features", confidence: 0.71, actionable: true },
];

export const ChurnReasonTable = () => {
  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader className="bg-card">
        <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          AI Churn Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[80px]">User ID</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[150px] hidden md:table-cell">Primary Churn Driver</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[90px]">Confidence</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReasons.map((row) => (
              <TableRow key={row.userId} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground text-xs sm:text-sm truncate" title={row.userId}>{row.userId}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-foreground text-xs sm:text-sm truncate max-w-[150px]" title={row.primaryReason}>
                    {row.primaryReason}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 max-w-[50px] sm:max-w-[60px]">
                      <div 
                        className="h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-accent to-primary"
                        style={{ width: `${row.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-foreground font-medium text-xs sm:text-sm">
                      {(row.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={row.actionable ? "default" : "secondary"} className="font-medium text-xs">
                    {row.actionable ? "ACTION" : "MONITOR"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ChurnData {
  userId: string;
  churnScore: number;
  riskLevel: "low" | "medium" | "high";
  lastActivity: string;
}

const mockData: ChurnData[] = [
  { userId: "USR-001", churnScore: 0.85, riskLevel: "high", lastActivity: "2 days ago" },
  { userId: "USR-002", churnScore: 0.32, riskLevel: "low", lastActivity: "1 hour ago" },
  { userId: "USR-003", churnScore: 0.67, riskLevel: "medium", lastActivity: "5 days ago" },
  { userId: "USR-004", churnScore: 0.91, riskLevel: "high", lastActivity: "1 week ago" },
  { userId: "USR-005", churnScore: 0.24, riskLevel: "low", lastActivity: "30 mins ago" },
];

const getRiskBadgeVariant = (risk: string) => {
  switch (risk) {
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "default";
    default: return "default";
  }
};

export const ChurnScoreTable = () => {
  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader className="bg-card">
        <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          Churn Score Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[80px]">User ID</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[100px]">Churn Score</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[80px]">Risk Level</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm min-w-[90px] hidden sm:table-cell">Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.userId} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground text-xs sm:text-sm truncate" title={row.userId}>{row.userId}</TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 max-w-[60px] sm:max-w-[80px]">
                      <div 
                        className="h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${row.churnScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-foreground font-medium text-xs sm:text-sm">
                      {(row.churnScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(row.riskLevel)} className="font-medium text-xs sm:text-sm">
                    {row.riskLevel.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{row.lastActivity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
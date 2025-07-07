
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface UserData {
  id: string;
  user_id: string;
  plan: string;
  usage: number;
  last_login: string | null;
  churn_score: number;
  churn_reason: string | null;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

interface UserDataTableProps {
  data: UserData[];
  isLoading: boolean;
}

const UserDataTable = ({ data, isLoading }: UserDataTableProps) => {
      const getRiskBadge = (riskLevel: string, churnScore?: number) => {
    const config = {
      high: { variant: 'destructive' as const, emoji: '🔴', label: 'High Risk', bgColor: 'bg-red-50' },
      medium: { variant: 'secondary' as const, emoji: '🟡', label: 'Medium Risk', bgColor: 'bg-yellow-50' },
      low: { variant: 'default' as const, emoji: '🟢', label: 'Low Risk', bgColor: 'bg-green-50' },
    };
    
    const risk = config[riskLevel as keyof typeof config] || config.low;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${risk.bgColor}`}>
        <Badge variant={risk.variant}>
          {risk.emoji} {risk.label}
        </Badge>
        {churnScore !== undefined && (
          <span className="text-xs text-gray-600 ml-1">
            ({(churnScore * 100).toFixed(1)}%)
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No customer data yet. Upload a CSV file with AI model v5 features or use the API to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-foreground">User ID</TableHead>
            <TableHead className="font-semibold text-foreground">Plan</TableHead>
            <TableHead className="font-semibold text-foreground">Revenue</TableHead>
            <TableHead className="font-semibold text-foreground">Last Login</TableHead>
            <TableHead className="font-semibold text-foreground">Churn Score</TableHead>
            <TableHead className="font-semibold text-foreground">Churn Reason</TableHead>
            <TableHead className="font-semibold text-foreground">Risk Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user, index) => (
            <TableRow key={user.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
              <TableCell className="font-mono text-sm text-foreground">{user.user_id}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-muted-foreground/30">{user.plan}</Badge>
              </TableCell>
              <TableCell className="text-foreground">${user.usage?.toFixed(2) || '0.00'}</TableCell>
              <TableCell className="text-muted-foreground">
                {user.last_login ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true }) : 'Never'}
              </TableCell>
              <TableCell>
                <span className={`font-mono text-sm px-2 py-1 rounded ${
                  user.churn_score > 0.75 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'
                }`}>
                  {user.churn_score !== null ? (user.churn_score * 100).toFixed(1) + '%' : 'N/A'}
                </span>
              </TableCell>
              <TableCell className="max-w-xs">
                <span className="text-sm text-muted-foreground truncate block" title={user.churn_reason || ''}>
                  {user.churn_reason || 'No reason available'}
                </span>
              </TableCell>
              <TableCell>
                {getRiskBadge(user.risk_level, user.churn_score)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserDataTable;

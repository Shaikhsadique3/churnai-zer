
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
        <p className="text-gray-500">No customer data yet. Upload a CSV file or use the API to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Churn Score</TableHead>
            <TableHead>Risk Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.plan}</Badge>
              </TableCell>
              <TableCell>{user.usage}</TableCell>
              <TableCell>
                {user.last_login ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true }) : 'Never'}
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{user.churn_score !== null ? (user.churn_score * 100).toFixed(1) + '%' : 'N/A'}</span>
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

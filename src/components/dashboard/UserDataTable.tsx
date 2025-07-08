
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
  understanding_score?: number;
  user_stage?: string;
  days_until_mature?: number;
  action_recommended?: string;
  created_at: string;
}

interface UserDataTableProps {
  data: UserData[];
  isLoading: boolean;
}

const UserDataTable = ({ data, isLoading }: UserDataTableProps) => {
  const getStatusBadge = (user: UserData) => {
    const { user_stage, understanding_score, days_until_mature, churn_score } = user;
    
    // Enhanced status logic based on days_since_signup and churn_score
    let statusDisplay = '';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    let bgColor = 'bg-muted/20';
    
    if (user_stage === 'new_user' || (understanding_score && understanding_score < 50)) {
      statusDisplay = '🆕 New User (Insufficient Data)';
      variant = 'outline';
      bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    } else if (churn_score && churn_score > 0.8) {
      statusDisplay = '❌ High Risk';
      variant = 'destructive';
      bgColor = 'bg-red-50 dark:bg-red-900/20';
    } else if (churn_score && churn_score > 0.5) {
      statusDisplay = '⚠️ Medium Risk';
      variant = 'secondary';
      bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
    } else {
      statusDisplay = '✅ Low Risk';
      variant = 'default';
      bgColor = 'bg-green-50 dark:bg-green-900/20';
    }
    
    const getTooltipText = () => {
      if (!understanding_score) return 'No confidence data';
      if (understanding_score >= 80) return 'Excellent 🔥';
      if (understanding_score >= 50) return 'Moderate';
      return 'Weak confidence – more data needed';
    };
    
    return (
      <div className={`inline-flex flex-col space-y-1 px-2 py-1 rounded-lg ${bgColor}`}>
        <div className="flex items-center space-x-1">
          <Badge variant={variant} className="text-xs">
            <span className="hidden sm:inline">{statusDisplay}</span>
            <span className="sm:hidden">{statusDisplay.split(' ')[0]}</span>
          </Badge>
          {churn_score !== undefined && (
            <span className="text-xs font-medium text-foreground">
              {(churn_score * 100).toFixed(1)}%
            </span>
          )}
        </div>
        {understanding_score !== undefined && (
          <div className="flex items-center space-x-1" title={getTooltipText()}>
            <div className="w-full bg-muted rounded-full h-1.5 max-w-[60px]">
              <div 
                className="h-1.5 rounded-full bg-primary"
                style={{ width: `${understanding_score}%` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground">
              {understanding_score}%
            </span>
          </div>
        )}
        {days_until_mature !== undefined && days_until_mature > 0 && (
          <span className="text-xs text-muted-foreground">
            {days_until_mature}d to mature
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
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-foreground text-xs sm:text-sm min-w-[80px]">User ID</TableHead>
            <TableHead className="font-semibold text-foreground text-xs sm:text-sm min-w-[60px]">Plan</TableHead>
            <TableHead className="font-semibold text-foreground text-xs sm:text-sm min-w-[70px]">Revenue</TableHead>
            <TableHead className="font-semibold text-foreground text-xs sm:text-sm min-w-[90px] hidden sm:table-cell">Last Login</TableHead>
            <TableHead className="font-semibold text-foreground text-xs sm:text-sm min-w-[100px]">Churn Score</TableHead>
            <TableHead className="font-semibold text-foreground text-xs sm:text-sm min-w-[120px] hidden md:table-cell">Churn Reason</TableHead>
            <TableHead className="font-semibold text-foreground text-xs sm:text-sm min-w-[100px]">Status & Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user, index) => (
            <TableRow key={user.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
              <TableCell className="font-mono text-xs sm:text-sm text-foreground truncate max-w-[80px]" title={user.user_id}>
                {user.user_id}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-muted-foreground/30 text-xs sm:text-sm">{user.plan}</Badge>
              </TableCell>
              <TableCell className="text-foreground text-xs sm:text-sm">${user.usage?.toFixed(2) || '0.00'}</TableCell>
              <TableCell className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                {user.last_login ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true }) : 'Never'}
              </TableCell>
              <TableCell>
                <span className={`font-mono text-xs sm:text-sm px-1 sm:px-2 py-1 rounded ${
                  user.churn_score > 0.75 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'
                }`}>
                  {user.churn_score !== null ? (user.churn_score * 100).toFixed(1) + '%' : 'N/A'}
                </span>
              </TableCell>
              <TableCell className="max-w-[120px] hidden md:table-cell">
                <span className="text-xs sm:text-sm text-muted-foreground truncate block" title={user.churn_reason || ''}>
                  {user.churn_reason === "" || user.churn_reason === null 
                    ? "🕵️ No strong signals yet" 
                    : user.churn_reason}
                </span>
              </TableCell>
              <TableCell>
                {getStatusBadge(user)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserDataTable;

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  Search, Filter, MoreHorizontal, Edit, Trash2, RefreshCw, Download, 
  Mail, ChevronLeft, ChevronRight, Eye, EyeOff, Settings
} from "lucide-react";

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

interface EnhancedUserDataTableProps {
  data: UserData[];
  isLoading: boolean;
  onEditUser?: (user: UserData) => void;
  onDeleteUser?: (userId: string) => void;
  onRerunAnalysis?: (userId: string) => void;
  onBulkAction?: (action: string, userIds: string[]) => void;
}

const ITEMS_PER_PAGE = 20;

const EnhancedUserDataTable = ({ 
  data, 
  isLoading, 
  onEditUser,
  onDeleteUser,
  onRerunAnalysis,
  onBulkAction
}: EnhancedUserDataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [daysSinceLoginFilter, setDaysSinceLoginFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const { toast } = useToast();

  // Available columns for toggle
  const availableColumns = [
    { key: 'plan', label: 'Plan' },
    { key: 'usage', label: 'Revenue' },
    { key: 'last_login', label: 'Last Login' },
    { key: 'churn_score', label: 'Churn Score' },
    { key: 'churn_reason', label: 'Churn Reason' },
    { key: 'understanding_score', label: 'AI Confidence' },
    { key: 'action_recommended', label: 'Recommended Action' }
  ];

  // Filter and search logic
  const filteredData = useMemo(() => {
    return data.filter(user => {
      // Search filter
      if (searchTerm && !user.user_id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Risk level filter
      if (riskFilter !== "all" && user.risk_level !== riskFilter) {
        return false;
      }

      // Plan filter
      if (planFilter !== "all" && user.plan !== planFilter) {
        return false;
      }

      // Days since login filter
      if (daysSinceLoginFilter !== "all" && user.last_login) {
        const daysSince = Math.floor((Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24));
        switch (daysSinceLoginFilter) {
          case "7": return daysSince > 7;
          case "30": return daysSince > 30;
          case "90": return daysSince > 90;
        }
      }

      return true;
    });
  }, [data, searchTerm, riskFilter, planFilter, daysSinceLoginFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (user: UserData) => {
    const { user_stage, understanding_score, days_until_mature, churn_score } = user;
    
    let statusDisplay = '';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    let bgColor = 'bg-muted/20';
    
    if (user_stage === 'new_user' || (understanding_score && understanding_score < 50)) {
      statusDisplay = '🆕 New User';
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
    
    return (
      <div className={`inline-flex flex-col space-y-1 px-2 py-1 rounded-lg ${bgColor}`}>
        <div className="flex items-center space-x-1">
          <Badge variant={variant} className="text-xs">
            {statusDisplay}
          </Badge>
          {churn_score !== undefined && (
            <span className="text-xs font-medium text-foreground">
              {(churn_score * 100).toFixed(1)}%
            </span>
          )}
        </div>
        {understanding_score !== undefined && (
          <div className="flex items-center space-x-1">
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedData.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select users to perform bulk actions.",
        variant: "destructive"
      });
      return;
    }

    onBulkAction?.(action, selectedUsers);
    setSelectedUsers([]);
  };

  const toggleColumn = (columnKey: string) => {
    if (hiddenColumns.includes(columnKey)) {
      setHiddenColumns(hiddenColumns.filter(col => col !== columnKey));
    } else {
      setHiddenColumns([...hiddenColumns, columnKey]);
    }
  };

  const isColumnVisible = (columnKey: string) => !hiddenColumns.includes(columnKey);

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
        <p className="text-muted-foreground">No customer data yet. Upload a CSV file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>
          
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={daysSinceLoginFilter} onValueChange={setDaysSinceLoginFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Last Login" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="7">&gt; 7 days</SelectItem>
              <SelectItem value="30">&gt; 30 days</SelectItem>
              <SelectItem value="90">&gt; 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {/* Column Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableColumns.map(column => (
                <DropdownMenuItem key={column.key} onClick={() => toggleColumn(column.key)}>
                  <div className="flex items-center space-x-2">
                    {isColumnVisible(column.key) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span>{column.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  {selectedUsers.length} Selected
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('email')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Retention Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('rerun')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-run Analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedUsers.length === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-foreground min-w-[100px]">User ID</TableHead>
              {isColumnVisible('plan') && <TableHead className="font-semibold text-foreground">Plan</TableHead>}
              {isColumnVisible('usage') && <TableHead className="font-semibold text-foreground">Revenue</TableHead>}
              {isColumnVisible('last_login') && <TableHead className="font-semibold text-foreground hidden sm:table-cell">Last Login</TableHead>}
              {isColumnVisible('churn_score') && <TableHead className="font-semibold text-foreground">Churn Score</TableHead>}
              {isColumnVisible('churn_reason') && <TableHead className="font-semibold text-foreground hidden md:table-cell">Churn Reason</TableHead>}
              <TableHead className="font-semibold text-foreground">Status & Risk</TableHead>
              {isColumnVisible('understanding_score') && <TableHead className="font-semibold text-foreground hidden lg:table-cell">AI Confidence</TableHead>}
              {isColumnVisible('action_recommended') && <TableHead className="font-semibold text-foreground hidden xl:table-cell">Recommended Action</TableHead>}
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((user, index) => (
              <TableRow key={user.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm text-foreground">
                  {user.user_id}
                </TableCell>
                {isColumnVisible('plan') && (
                  <TableCell>
                    <Badge variant="outline">{user.plan}</Badge>
                  </TableCell>
                )}
                {isColumnVisible('usage') && (
                  <TableCell className="text-foreground">${user.usage?.toFixed(2) || '0.00'}</TableCell>
                )}
                {isColumnVisible('last_login') && (
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {user.last_login ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true }) : 'Never'}
                  </TableCell>
                )}
                {isColumnVisible('churn_score') && (
                  <TableCell>
                    <span className={`font-mono text-sm px-2 py-1 rounded ${
                      user.churn_score > 0.75 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'
                    }`}>
                      {user.churn_score !== null ? (user.churn_score * 100).toFixed(1) + '%' : 'N/A'}
                    </span>
                  </TableCell>
                )}
                {isColumnVisible('churn_reason') && (
                  <TableCell className="max-w-[200px] hidden md:table-cell">
                    <span className="text-sm text-muted-foreground truncate block" title={user.churn_reason || ''}>
                      {user.churn_reason === "" || user.churn_reason === null 
                        ? "🕵️ No strong signals yet" 
                        : user.churn_reason}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  {getStatusBadge(user)}
                </TableCell>
                {isColumnVisible('understanding_score') && (
                  <TableCell className="hidden lg:table-cell">
                    {user.understanding_score && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${user.understanding_score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{user.understanding_score}%</span>
                      </div>
                    )}
                  </TableCell>
                )}
                {isColumnVisible('action_recommended') && (
                  <TableCell className="max-w-[200px] hidden xl:table-cell">
                    <span className="text-xs text-muted-foreground truncate block" title={user.action_recommended || ''}>
                      {user.action_recommended || 'No specific action needed'}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEditUser?.(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRerunAnalysis?.(user.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-run Analysis
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteUser?.(user.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserDataTable;
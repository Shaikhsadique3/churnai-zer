import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Clock, Brain, Users, Filter, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface UserData {
  id: string;
  user_id: string;
  plan: string;
  usage: number;
  churn_score: number;
  risk_level: string;
  last_login: string;
  churn_reason: string;
}

interface EmailLog {
  id: string;
  target_email: string;
  subject?: string;
  body?: string;
  status: string;
  sent_at?: string;
  psychology_style?: string;
  error_message?: string;
  scheduled_for?: string;
  created_at: string;
  ai_generated?: boolean;
}

const psychologyStyles = [
  { value: 'loss_aversion', label: 'Loss Aversion', description: 'Focus on what they\'ll lose' },
  { value: 'urgency', label: 'Urgency', description: 'Create time pressure' },
  { value: 'curiosity', label: 'Curiosity', description: 'Pique their interest' },
  { value: 'scarcity', label: 'Scarcity', description: 'Limited availability' },
  { value: 'social_proof', label: 'Social Proof', description: 'Show others\' success' },
  { value: 'authority', label: 'Authority', description: 'Expert credibility' },
  { value: 'reciprocity', label: 'Reciprocity', description: 'Offer value first' },
];

const AIEmailCampaignsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [psychologyStyle, setPsychologyStyle] = useState('loss_aversion');
  const [customMessage, setCustomMessage] = useState('');
  const [scheduleFor, setScheduleFor] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<{subject: string, body: string} | null>(null);

  // Fetch high/medium risk users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['high-risk-users', riskFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_data')
        .select('*')
        .order('churn_score', { ascending: false });
      
      if (riskFilter !== 'all') {
        query = query.eq('risk_level', riskFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as UserData[];
    },
  });

  // Fetch email logs
  const { data: emailLogs = [] } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as EmailLog[];
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: {
      targetUsers: UserData[];
      psychologyStyle: string;
      customMessage?: string;
      scheduleFor?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-and-send-email', {
        body: emailData
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Email Campaign Completed",
        description: `Sent: ${data.sent}, Failed: ${data.failed}, Scheduled: ${data.scheduled}`,
      });
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
      setSelectedUsers([]);
      setCustomMessage('');
      setScheduleFor('');
      setPreviewEmail(null);
    },
    onError: (error) => {
      toast({
        title: "Campaign Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filteredUsers = users.filter(user => 
      riskFilter === 'all' || user.risk_level === riskFilter
    );
    setSelectedUsers(filteredUsers.map(user => user.id));
  };

  const handleGeneratePreview = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to preview the email.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const firstUser = users.find(u => u.id === selectedUsers[0]);
      if (!firstUser) return;

      const { data, error } = await supabase.functions.invoke('generate-and-send-email', {
        body: {
          targetUsers: [firstUser],
          psychologyStyle,
          customMessage,
          preview: true
        }
      });

      if (error) throw error;
      
      if (data.results && data.results[0]) {
        setPreviewEmail({
          subject: data.results[0].subject,
          body: data.results[0].body || 'Preview generation failed'
        });
      }
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmails = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to send emails.",
        variant: "destructive",
      });
      return;
    }

    const targetUsers = users.filter(user => selectedUsers.includes(user.id));
    
    sendEmailMutation.mutate({
      targetUsers,
      psychologyStyle,
      customMessage: customMessage || undefined,
      scheduleFor: scheduleFor || undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI Email Campaigns
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate psychology-driven retention emails using AI to re-engage at-risk users
        </p>
      </div>

      <Tabs defaultValue="composer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="composer">Email Composer</TabsTrigger>
          <TabsTrigger value="logs">Campaign Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Target Audience */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Target Audience
                </CardTitle>
                <CardDescription>
                  Select at-risk users to send personalized retention emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <Label>Risk Level:</Label>
                    </div>
                    <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSelectAll}
                      disabled={users.length === 0}
                    >
                      Select All ({users.length})
                    </Button>
                  </div>

                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Select</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Last Login</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              Loading users...
                            </TableCell>
                          </TableRow>
                        ) : users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No users found for the selected risk level
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={() => handleUserSelect(user.id)}
                                  className="rounded border-gray-300"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{user.user_id}</TableCell>
                              <TableCell>
                                <Badge variant={getRiskBadgeColor(user.risk_level)}>
                                  {user.risk_level.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.plan}</TableCell>
                              <TableCell>{user.churn_score.toFixed(2)}</TableCell>
                              <TableCell>
                                {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy') : 'Never'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Psychology Style</Label>
                  <Select value={psychologyStyle} onValueChange={setPsychologyStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {psychologyStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Message (Optional)</Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add any specific context or instructions for the AI..."
                    className="min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Schedule For (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={scheduleFor}
                    onChange={(e) => setScheduleFor(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleGeneratePreview}
                    disabled={isGenerating || selectedUsers.length === 0}
                    variant="outline"
                    className="w-full"
                  >
                    {isGenerating ? 'Generating...' : 'Preview Email'}
                  </Button>
                  
                  <Button 
                    onClick={handleSendEmails}
                    disabled={sendEmailMutation.isPending || selectedUsers.length === 0}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendEmailMutation.isPending ? 'Sending...' : `Send to ${selectedUsers.length} users`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Preview */}
          {previewEmail && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Subject:</Label>
                    <p className="text-sm bg-muted p-2 rounded mt-1">{previewEmail.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Body:</Label>
                    <div 
                      className="text-sm bg-muted p-4 rounded mt-1"
                      dangerouslySetInnerHTML={{ __html: previewEmail.body }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Campaign Logs
              </CardTitle>
              <CardDescription>
                View the history of your AI-generated email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Psychology Style</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Scheduled For</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No email campaigns yet. Create your first campaign above!
                        </TableCell>
                      </TableRow>
                    ) : (
                      emailLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="capitalize">{log.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{log.target_email}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {psychologyStyles.find(s => s.value === log.psychology_style)?.label || log.psychology_style}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.sent_at ? format(new Date(log.sent_at), 'MMM d, yyyy HH:mm') : '-'}
                          </TableCell>
                          <TableCell>
                            {log.scheduled_for ? format(new Date(log.scheduled_for), 'MMM d, yyyy HH:mm') : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIEmailCampaignsPage;
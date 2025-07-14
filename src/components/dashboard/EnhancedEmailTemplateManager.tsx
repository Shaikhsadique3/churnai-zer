import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEmailService } from "@/hooks/useEmailService";
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Copy, 
  Eye,
  Code,
  TestTube,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  is_active: boolean;
  created_at: string;
  variables?: string[];
}

interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

const AVAILABLE_VARIABLES: TemplateVariable[] = [
  { name: 'name', description: 'Customer name', example: 'John Doe' },
  { name: 'email', description: 'Customer email', example: 'john@example.com' },
  { name: 'churn_score', description: 'Churn risk score', example: '0.75' },
  { name: 'risk_level', description: 'Risk level', example: 'high' },
  { name: 'last_login', description: 'Last login date', example: '2024-01-15' },
  { name: 'usage_count', description: 'Usage count', example: '42' },
  { name: 'plan_type', description: 'Subscription plan', example: 'Pro' },
  { name: 'company', description: 'Company name', example: 'Acme Corp' },
];

const TEMPLATE_CATEGORIES = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'retention', label: 'Retention' },
  { value: 'winback', label: 'Win-back' },
  { value: 'notification', label: 'Notification' },
  { value: 'survey', label: 'Survey' },
  { value: 'custom', label: 'Custom' },
];

export const EnhancedEmailTemplateManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendTemplateEmail, testEmailConfig } = useEmailService();
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'custom',
  });

  useEffect(() => {
    if (user?.id) {
      loadTemplates();
    }
  }, [user?.id]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Extract variables from templates
      const templatesWithVariables = data?.map(template => ({
        ...template,
        variables: extractVariables(template.content + ' ' + template.subject)
      })) || [];
      
      setTemplates(templatesWithVariables);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '').trim()))];
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const templateId = crypto.randomUUID();
      const { error } = await supabase
        .from('email_templates')
        .insert({
          id: templateId,
          user_id: user?.id,
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: newTemplate.content,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "✅ Template Created",
        description: "Email template created successfully",
      });

      setNewTemplate({ name: '', subject: '', content: '', category: 'custom' });
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Email template deleted successfully",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
    }
  };

  const duplicateTemplate = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          id: crypto.randomUUID(),
          user_id: user?.id,
          name: `${template.name} (Copy)`,
          subject: template.subject,
          content: template.content,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Template Duplicated",
        description: "Template copied successfully",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  const testTemplate = async (template: EmailTemplate) => {
    if (!testEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendTemplateEmail(testEmail, template.id, testVariables);
      toast({
        title: "✅ Test Email Sent",
        description: `Template test sent to ${testEmail}`,
      });
    } catch (error) {
      console.error('Error testing template:', error);
    }
  };

  const insertVariable = (variable: string) => {
    const variableTag = `{{${variable}}}`;
    setNewTemplate(prev => ({
      ...prev,
      content: prev.content + variableTag
    }));
  };

  const previewTemplateWithVariables = (template: EmailTemplate) => {
    let previewContent = template.content;
    let previewSubject = template.subject;
    
    // Replace variables with example values
    AVAILABLE_VARIABLES.forEach(variable => {
      const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g');
      previewContent = previewContent.replace(regex, variable.example);
      previewSubject = previewSubject.replace(regex, variable.example);
    });
    
    return { content: previewContent, subject: previewSubject };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold">📧 Enhanced Email Templates</h1>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <Sparkles className="h-6 w-6" />
          <span>Enhanced Email Templates</span>
        </h1>
        <p className="text-muted-foreground">
          Create professional email templates with dynamic variables for automated campaigns
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TestTube className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Test Configuration</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Test your email setup
            </p>
            <Button 
              size="sm" 
              onClick={() => testEmailConfig()}
              className="w-full"
            >
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold">Active Templates</h3>
            <p className="text-lg font-bold text-green-600">
              {templates.filter(t => t.is_active).length}
            </p>
            <p className="text-sm text-muted-foreground">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Code className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold">Variables Available</h3>
            <p className="text-lg font-bold text-purple-600">
              {AVAILABLE_VARIABLES.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Dynamic fields
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Template</span>
          </CardTitle>
          <CardDescription>
            Build professional email templates with dynamic variables for personalization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="Welcome Email - High Risk Users"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select 
                value={newTemplate.category} 
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-subject">Subject Line *</Label>
            <Input
              id="template-subject"
              placeholder="Hi {{name}}, we noticed you haven't logged in recently"
              value={newTemplate.subject}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="template-content">Email Content (HTML) *</Label>
              <Textarea
                id="template-content"
                placeholder={`<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2>Hi {{name}},</h2>
  <p>We noticed you haven't logged into your account recently.</p>
  <p>Your current churn risk score is {{churn_score}} ({{risk_level}} risk).</p>
  <p>Last login: {{last_login}}</p>
  <a href="#" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    Login Now
  </a>
</div>`}
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Available Variables</Label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {AVAILABLE_VARIABLES.map(variable => (
                    <div 
                      key={variable.name}
                      className="p-2 border rounded cursor-pointer hover:bg-muted"
                      onClick={() => insertVariable(variable.name)}
                    >
                      <div className="font-mono text-sm text-blue-600">
                        {`{{${variable.name}}}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {variable.description}
                      </div>
                      <div className="text-xs text-green-600">
                        ex: {variable.example}
                      </div>
                    </div>
                  ))
                  }
                </div>
              </div>
            </div>
          </div>

          <Button onClick={createTemplate} disabled={creating} size="lg">
            {creating ? "Creating Template..." : "Create Template"}
            <Plus className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Existing Templates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Templates ({templates.length})</h2>
        
        {templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No templates yet</p>
              <p className="text-muted-foreground">Create your first email template to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{template.name}</span>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {template.subject}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Variables used */}
                    {template.variables && template.variables.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Variables used:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Preview content */}
                    <div className="text-sm text-muted-foreground max-h-20 overflow-hidden">
                      <div dangerouslySetInnerHTML={{ 
                        __html: template.content.substring(0, 150) + '...' 
                      }} />
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Template Preview: {template.name}</DialogTitle>
                            <DialogDescription>
                              Preview with sample data
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Subject:</Label>
                              <p className="font-semibold p-2 bg-muted rounded">
                                {previewTemplateWithVariables(template).subject}
                              </p>
                            </div>
                            <div>
                              <Label>Content:</Label>
                              <div 
                                className="p-4 border rounded bg-white"
                                dangerouslySetInnerHTML={{ 
                                  __html: previewTemplateWithVariables(template).content 
                                }}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Send className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Test Template</DialogTitle>
                            <DialogDescription>
                              Send a test email using this template
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Test Email Address</Label>
                              <Input
                                placeholder="test@example.com"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                              />
                            </div>
                            {template.variables && template.variables.length > 0 && (
                              <div>
                                <Label>Test Values for Variables</Label>
                                <div className="space-y-2 mt-2">
                                  {template.variables.map(variable => (
                                    <div key={variable}>
                                      <Label className="text-xs">{variable}</Label>
                                      <Input
                                        placeholder={AVAILABLE_VARIABLES.find(v => v.name === variable)?.example || 'Test value'}
                                        value={testVariables[variable] || ''}
                                        onChange={(e) => setTestVariables(prev => ({
                                          ...prev,
                                          [variable]: e.target.value
                                        }))}
                                      />
                                    </div>
                                  ))
                                  }
                                </div>
                              </div>
                            )}
                            <Button 
                              onClick={() => testTemplate(template)}
                              className="w-full"
                            >
                              Send Test Email
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => duplicateTemplate(template)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

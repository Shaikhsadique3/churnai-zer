import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVAutoMapperProps {
  csvHeaders: string[];
  csvPreview: any[];
  onMappingConfirmed: (mapping: ColumnMapping) => void;
  onCancel: () => void;
  savedMappings?: ColumnMapping;
}

export interface ColumnMapping {
  user_id: string;
  email: string;
  signup_date: string;
  last_login_date: string;
  subscription_plan: string;
  monthly_revenue: string;
  active_features_used: string;
  support_tickets_opened: string;
  payment_status: string;
  email_opens_last30days: string;
  billing_issue_count: string;
  // Optional fields
  days_since_signup?: string;
  last_login_days_ago?: string;
  number_of_logins_last30days?: string;
}

const REQUIRED_FIELDS = [
  { key: 'user_id', label: 'User ID', required: true, description: 'Unique identifier for each user' },
  { key: 'email', label: 'Email Address', required: false, description: 'User email address' },
  { key: 'signup_date', label: 'Signup Date', required: true, description: 'Date when user signed up (YYYY-MM-DD)' },
  { key: 'last_login_date', label: 'Last Login Date', required: true, description: 'Date of last login (YYYY-MM-DD)' },
  { key: 'subscription_plan', label: 'Subscription Plan', required: true, description: 'Free, Pro, Enterprise' },
  { key: 'monthly_revenue', label: 'Monthly Revenue', required: true, description: 'Revenue from this user per month' },
  { key: 'active_features_used', label: 'Active Features Used', required: true, description: 'Number of features actively used' },
  { key: 'support_tickets_opened', label: 'Support Tickets', required: true, description: 'Number of support tickets opened' },
  { key: 'payment_status', label: 'Payment Status', required: true, description: 'Success, Failed, Pending' },
  { key: 'email_opens_last30days', label: 'Email Opens (30d)', required: true, description: 'Email opens in last 30 days' },
  { key: 'billing_issue_count', label: 'Billing Issues', required: true, description: 'Number of billing issues' },
];

const OPTIONAL_FIELDS = [
  { key: 'days_since_signup', label: 'Days Since Signup', required: false, description: 'Will be calculated if not provided' },
  { key: 'last_login_days_ago', label: 'Last Login Days Ago', required: false, description: 'Will be calculated if not provided' },
  { key: 'number_of_logins_last30days', label: 'Logins (30d)', required: false, description: 'Login count in last 30 days' },
];

const CSVAutoMapper = ({ csvHeaders, csvPreview, onMappingConfirmed, onCancel, savedMappings }: CSVAutoMapperProps) => {
  const [mapping, setMapping] = useState<ColumnMapping>({
    user_id: '',
    email: '',
    signup_date: '',
    last_login_date: '',
    subscription_plan: '',
    monthly_revenue: '',
    active_features_used: '',
    support_tickets_opened: '',
    payment_status: '',
    email_opens_last30days: '',
    billing_issue_count: '',
  });
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  // Auto-suggest mappings based on header names
  const autoSuggestMapping = () => {
    const suggestions: Partial<ColumnMapping> = {};
    const normalizedHeaders = csvHeaders.map(h => h.toLowerCase().trim());

    // Common patterns for auto-mapping
    const patterns = {
      user_id: ['user_id', 'userid', 'id', 'customer_id', 'customerid', 'user'],
      email: ['email', 'email_address', 'user_email', 'customer_email'],
      signup_date: ['signup_date', 'created_at', 'registration_date', 'join_date', 'created', 'signup'],
      last_login_date: ['last_login', 'last_login_date', 'latest_login', 'recent_login'],
      subscription_plan: ['plan', 'subscription_plan', 'subscription', 'tier', 'plan_type'],
      monthly_revenue: ['revenue', 'monthly_revenue', 'mrr', 'amount', 'value', 'price'],
      active_features_used: ['features', 'active_features', 'feature_count', 'features_used'],
      support_tickets_opened: ['support_tickets', 'tickets', 'support_count', 'ticket_count'],
      payment_status: ['payment_status', 'payment_state', 'billing_status', 'payment'],
      email_opens_last30days: ['email_opens', 'opens', 'email_engagement', 'opens_30d'],
      billing_issue_count: ['billing_issues', 'billing_problems', 'payment_issues', 'failed_payments'],
      days_since_signup: ['days_since_signup', 'days_active', 'account_age'],
      last_login_days_ago: ['last_login_days_ago', 'days_since_login', 'login_days_ago'],
      number_of_logins_last30days: ['logins', 'login_count', 'logins_30d', 'monthly_logins'],
    };

    Object.entries(patterns).forEach(([field, keywords]) => {
      const matchedHeader = csvHeaders.find(header => {
        const normalized = header.toLowerCase().trim();
        return keywords.some(keyword => normalized.includes(keyword));
      });
      if (matchedHeader) {
        suggestions[field as keyof ColumnMapping] = matchedHeader;
      }
    });

    setMapping(prev => ({ ...prev, ...suggestions }));
    toast({
      title: "Auto-mapping applied",
      description: `Suggested ${Object.keys(suggestions).length} field mappings based on column names.`,
    });
  };

  // Load saved mappings on mount
  useEffect(() => {
    if (savedMappings) {
      setMapping(savedMappings);
      toast({
        title: "Previous mappings loaded",
        description: "Using your last saved column mappings.",
      });
    } else {
      autoSuggestMapping();
    }
  }, [csvHeaders, savedMappings]);

  // Validate mapping
  useEffect(() => {
    const requiredFieldsMapped = REQUIRED_FIELDS.filter(field => field.required)
      .every(field => mapping[field.key as keyof ColumnMapping] !== '');
    setIsValid(requiredFieldsMapped);
  }, [mapping]);

  const handleFieldMapping = (field: string, csvColumn: string) => {
    const value = csvColumn === "__not_mapped__" ? '' : csvColumn;
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    if (isValid) {
      // Save mapping to localStorage for future use
      localStorage.setItem('churnaizer_csv_mapping', JSON.stringify(mapping));
      onMappingConfirmed(mapping);
    }
  };

  const getFieldColor = (field: any) => {
    const mapped = mapping[field.key as keyof ColumnMapping];
    if (!mapped) return field.required ? 'destructive' : 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Map Your CSV Columns
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Match your CSV columns to the required fields. We've auto-suggested mappings based on your column names.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={autoSuggestMapping}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto-Suggest Again
            </Button>
          </div>

          {/* Required Fields */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Required Fields
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REQUIRED_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label}
                    <Badge variant={getFieldColor(field)} className="ml-2 text-xs">
                      {field.required ? 'Required' : 'Optional'}
                    </Badge>
                  </Label>
                  <Select
                    value={mapping[field.key as keyof ColumnMapping] || "__not_mapped__"}
                    onValueChange={(value) => handleFieldMapping(field.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__not_mapped__">-- Not mapped --</SelectItem>
                      {csvHeaders.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Optional Fields (Will be calculated if not provided)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPTIONAL_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label}
                    <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
                  </Label>
                  <Select
                    value={mapping[field.key as keyof ColumnMapping] || "__not_mapped__"}
                    onValueChange={(value) => handleFieldMapping(field.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__not_mapped__">-- Not mapped --</SelectItem>
                      {csvHeaders.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {csvPreview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview Mapped Data (First 3 rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border">
                <thead>
                  <tr className="bg-muted">
                    {REQUIRED_FIELDS.concat(OPTIONAL_FIELDS).map(field => (
                      <th key={field.key} className="p-2 text-left border">
                        {field.label}
                        {mapping[field.key as keyof ColumnMapping] && (
                          <div className="text-xs text-muted-foreground">
                            ← {mapping[field.key as keyof ColumnMapping]}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.slice(0, 3).map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {REQUIRED_FIELDS.concat(OPTIONAL_FIELDS).map(field => (
                        <td key={field.key} className="p-2 border">
                          {mapping[field.key as keyof ColumnMapping] 
                            ? row[mapping[field.key as keyof ColumnMapping]] || '-'
                            : '-'
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Alert */}
      {!isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please map all required fields before proceeding. Missing: {
              REQUIRED_FIELDS.filter(field => 
                field.required && !mapping[field.key as keyof ColumnMapping]
              ).map(field => field.label).join(', ')
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={!isValid}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Confirm Mapping & Process Data
        </Button>
      </div>
    </div>
  );
};

export default CSVAutoMapper;
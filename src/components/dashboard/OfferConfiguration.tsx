import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface OfferRule {
  id: string;
  condition: string;
  operator: string;
  value: string | number;
  logic: 'AND' | 'OR';
}

interface OfferConfigProps {
  offerType: string;
  config: any;
  onConfigChange: (config: any) => void;
}

const PLAN_TYPES = ['Free', 'Basic', 'Pro', 'Enterprise'];
const TENURE_RANGES = [
  { label: '0-7 days', value: '0-7' },
  { label: '8-30 days', value: '8-30' },
  { label: '31-90 days', value: '31-90' },
  { label: '91-365 days', value: '91-365' },
  { label: '365+ days', value: '365+' }
];

const CONDITIONS = [
  { label: 'Plan Type', value: 'plan', type: 'select' },
  { label: 'Tenure (days)', value: 'tenure_days', type: 'number' },
  { label: 'Monthly Revenue (MRR)', value: 'mrr', type: 'number' },
  { label: 'Last Login (days ago)', value: 'last_login_days', type: 'number' },
  { label: 'Usage Score', value: 'usage_score', type: 'number' },
];

const OPERATORS = [
  { label: 'Equals', value: 'eq' },
  { label: 'Greater than', value: 'gt' },
  { label: 'Less than', value: 'lt' },
  { label: 'Greater or equal', value: 'gte' },
  { label: 'Less or equal', value: 'lte' },
  { label: 'In list', value: 'in' },
];

export const OfferConfiguration: React.FC<OfferConfigProps> = ({
  offerType,
  config,
  onConfigChange
}) => {
  const updateConfig = (updates: any) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
  };

  const addRule = () => {
    const newRule: OfferRule = {
      id: Date.now().toString(),
      condition: 'plan',
      operator: 'eq',
      value: '',
      logic: 'AND'
    };
    
    const currentRules = config.targeting_rules || [];
    updateConfig({ targeting_rules: [...currentRules, newRule] });
  };

  const updateRule = (ruleId: string, updates: Partial<OfferRule>) => {
    const currentRules = config.targeting_rules || [];
    const updatedRules = currentRules.map((rule: OfferRule) =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    updateConfig({ targeting_rules: updatedRules });
  };

  const removeRule = (ruleId: string) => {
    const currentRules = config.targeting_rules || [];
    const filteredRules = currentRules.filter((rule: OfferRule) => rule.id !== ruleId);
    updateConfig({ targeting_rules: filteredRules });
  };

  const renderOfferSpecificConfig = () => {
    switch (offerType) {
      case 'discount':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select
                  value={config.discount_type || 'percentage'}
                  onValueChange={(value) => updateConfig({ discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount_value">
                  {config.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={[config.discount_value || 0]}
                    onValueChange={(value) => updateConfig({ discount_value: value[0] })}
                    max={config.discount_type === 'percentage' ? 100 : 1000}
                    step={config.discount_type === 'percentage' ? 5 : 10}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {config.discount_value || 0}{config.discount_type === 'percentage' ? '%' : '$'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration_months">Duration (months)</Label>
                <Select
                  value={config.duration_months?.toString() || '1'}
                  onValueChange={(value) => updateConfig({ duration_months: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="usage_cap">Usage Cap (per month)</Label>
                <Input
                  id="usage_cap"
                  type="number"
                  value={config.usage_cap || ''}
                  onChange={(e) => updateConfig({ usage_cap: parseInt(e.target.value) })}
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>
        );

      case 'pause':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pause_duration">Pause Duration</Label>
                <Select
                  value={config.pause_duration || '30'}
                  onValueChange={(value) => updateConfig({ pause_duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max_pauses">Max Pauses per Year</Label>
                <Input
                  id="max_pauses"
                  type="number"
                  value={config.max_pauses || '2'}
                  onChange={(e) => updateConfig({ max_pauses: parseInt(e.target.value) })}
                  min="1"
                  max="12"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="maintain_features"
                checked={config.maintain_features || false}
                onCheckedChange={(checked) => updateConfig({ maintain_features: checked })}
              />
              <Label htmlFor="maintain_features">Maintain access to core features during pause</Label>
            </div>
          </div>
        );

      case 'downgrade':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="target_plans">Target Plans</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PLAN_TYPES.map((plan) => (
                  <div key={plan} className="flex items-center space-x-2">
                    <Switch
                      id={`plan_${plan}`}
                      checked={(config.target_plans || []).includes(plan)}
                      onCheckedChange={(checked) => {
                        const currentPlans = config.target_plans || [];
                        const newPlans = checked
                          ? [...currentPlans, plan]
                          : currentPlans.filter((p: string) => p !== plan);
                        updateConfig({ target_plans: newPlans });
                      }}
                    />
                    <Label htmlFor={`plan_${plan}`}>{plan}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grace_period">Grace Period (days)</Label>
                <Input
                  id="grace_period"
                  type="number"
                  value={config.grace_period || '30'}
                  onChange={(e) => updateConfig({ grace_period: parseInt(e.target.value) })}
                  min="0"
                  max="90"
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="prorated_billing"
                  checked={config.prorated_billing || true}
                  onCheckedChange={(checked) => updateConfig({ prorated_billing: checked })}
                />
                <Label htmlFor="prorated_billing">Prorated billing</Label>
              </div>
            </div>
          </div>
        );

      case 'concierge':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_method">Contact Method</Label>
              <Select
                value={config.contact_method || 'email'}
                onValueChange={(value) => updateConfig({ contact_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="chat">Live Chat</SelectItem>
                  <SelectItem value="calendar">Schedule Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="response_time">Response Time Promise</Label>
              <Select
                value={config.response_time || '24h'}
                onValueChange={(value) => updateConfig({ response_time: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="1h">Within 1 hour</SelectItem>
                  <SelectItem value="4h">Within 4 hours</SelectItem>
                  <SelectItem value="24h">Within 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="escalation_level">Escalation Level</Label>
              <Select
                value={config.escalation_level || 'standard'}
                onValueChange={(value) => updateConfig({ escalation_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Support</SelectItem>
                  <SelectItem value="senior">Senior Specialist</SelectItem>
                  <SelectItem value="manager">Customer Success Manager</SelectItem>
                  <SelectItem value="executive">Executive Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback_type">Feedback Collection Method</Label>
              <Select
                value={config.feedback_type || 'survey'}
                onValueChange={(value) => updateConfig({ feedback_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="survey">Quick Survey</SelectItem>
                  <SelectItem value="form">Detailed Form</SelectItem>
                  <SelectItem value="interview">Exit Interview</SelectItem>
                  <SelectItem value="rating">Simple Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incentive_type">Incentive Type</Label>
                <Select
                  value={config.incentive_type || 'none'}
                  onValueChange={(value) => updateConfig({ incentive_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Incentive</SelectItem>
                    <SelectItem value="credit">Account Credit</SelectItem>
                    <SelectItem value="gift_card">Gift Card</SelectItem>
                    <SelectItem value="discount">Future Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="incentive_value">Incentive Value ($)</Label>
                <Input
                  id="incentive_value"
                  type="number"
                  value={config.incentive_value || ''}
                  onChange={(e) => updateConfig({ incentive_value: parseInt(e.target.value) })}
                  disabled={config.incentive_type === 'none'}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="required_completion"
                checked={config.required_completion || false}
                onCheckedChange={(checked) => updateConfig({ required_completion: checked })}
              />
              <Label htmlFor="required_completion">Require completion to continue cancellation</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Offer-specific Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {renderOfferSpecificConfig()}
        </CardContent>
      </Card>

      {/* Usage Caps */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="daily_cap">Daily Cap</Label>
              <Input
                id="daily_cap"
                type="number"
                value={config.daily_cap || ''}
                onChange={(e) => updateConfig({ daily_cap: parseInt(e.target.value) })}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <Label htmlFor="monthly_cap">Monthly Cap</Label>
              <Input
                id="monthly_cap"
                type="number"
                value={config.monthly_cap || ''}
                onChange={(e) => updateConfig({ monthly_cap: parseInt(e.target.value) })}
                placeholder="Unlimited"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="cooldown_enabled"
              checked={config.cooldown_enabled || false}
              onCheckedChange={(checked) => updateConfig({ cooldown_enabled: checked })}
            />
            <Label htmlFor="cooldown_enabled">Enable cooldown period between offers</Label>
          </div>
          
          {config.cooldown_enabled && (
            <div>
              <Label htmlFor="cooldown_days">Cooldown Period (days)</Label>
              <Input
                id="cooldown_days"
                type="number"
                value={config.cooldown_days || '30'}
                onChange={(e) => updateConfig({ cooldown_days: parseInt(e.target.value) })}
                min="1"
                max="365"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Targeting Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Targeting Rules</CardTitle>
            <Button onClick={addRule} variant="outline" size="sm">
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(config.targeting_rules || []).map((rule: OfferRule, index: number) => (
              <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {index > 0 && (
                      <Select
                        value={rule.logic}
                        onValueChange={(value) => updateRule(rule.id, { logic: value as 'AND' | 'OR' })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Badge variant="outline">Rule {index + 1}</Badge>
                  </div>
                  <Button
                    onClick={() => removeRule(rule.id)}
                    variant="ghost"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Condition</Label>
                    <Select
                      value={rule.condition}
                      onValueChange={(value) => updateRule(rule.id, { condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Operator</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(value) => updateRule(rule.id, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((operator) => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Value</Label>
                    {rule.condition === 'plan' ? (
                      <Select
                        value={rule.value as string}
                        onValueChange={(value) => updateRule(rule.id, { value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAN_TYPES.map((plan) => (
                            <SelectItem key={plan} value={plan}>
                              {plan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="number"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        placeholder="Enter value"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(!config.targeting_rules || config.targeting_rules.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No targeting rules configured.</p>
                <p className="text-sm">This offer will be available to all users.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
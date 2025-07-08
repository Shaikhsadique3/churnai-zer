import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

export const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">⚙️ Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Account Information</CardTitle>
          <CardDescription>Update your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value="UTC-8 (Pacific Time)" disabled className="bg-muted" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Preferences</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for high-risk customers
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Get weekly churn analysis summaries
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Integration Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about CRM and email tool status
                </p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle>🔑 API Access</CardTitle>
          <CardDescription>Manage your API keys and integration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input 
                type="password" 
                value="cg_••••••••••••••••••••••••••••••••" 
                disabled 
                className="bg-muted font-mono"
              />
              <Button variant="outline">Regenerate</Button>
              <Button variant="outline">Copy</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this key to integrate with our API. Keep it secure and don't share it.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input placeholder="https://your-app.com/webhooks/churn-guard" />
            <p className="text-xs text-muted-foreground">
              We'll send churn predictions and alerts to this endpoint.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Data Management</CardTitle>
          <CardDescription>Control your data retention and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Retention</Label>
                <p className="text-sm text-muted-foreground">
                  Keep customer data for 12 months after last update
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Allow usage analytics to improve ChurnGuard
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
            
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-2">
                <Label className="text-destructive">Delete All Data</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your customer data and predictions. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm">
                  Delete All Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
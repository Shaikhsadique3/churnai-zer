import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Settings, 
  Database,
  BarChart3,
  Shield,
  Globe,
  Mail
} from 'lucide-react';

const AdminPanel = () => {
  const { user, signOut } = useAuth();

  // Simple admin check - in production, you'd check against a proper admin role
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('@churnaizer.com');

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = 'https://dashboard.churnaizer.com'}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Churnaizer Management Console</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              <Users className="w-4 h-4 mr-1" />
              Admin
            </Badge>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Users Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Users:</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Today:</span>
                  <span className="font-medium">324</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New This Week:</span>
                  <span className="font-medium">89</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* System Analytics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>System Analytics</span>
              </CardTitle>
              <CardDescription>
                Platform usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls Today:</span>
                  <span className="font-medium">45,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Uptime:</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Response:</span>
                  <span className="font-medium">127ms</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Database Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Database</span>
              </CardTitle>
              <CardDescription>
                Database health and maintenance tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>DB Size:</span>
                  <span className="font-medium">2.4 GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tables:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Backup:</span>
                  <span className="font-medium">2h ago</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Database Tools
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common administrative tasks and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Settings className="w-6 h-6" />
                <span className="text-xs">System Config</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Mail className="w-6 h-6" />
                <span className="text-xs">Email Settings</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Globe className="w-6 h-6" />
                <span className="text-xs">Domain Config</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Shield className="w-6 h-6" />
                <span className="text-xs">Security</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest administrative events and system logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '2 minutes ago', action: 'New user registration', user: 'john@example.com' },
                { time: '15 minutes ago', action: 'API key generated', user: 'sarah@company.com' },
                { time: '1 hour ago', action: 'Database backup completed', user: 'System' },
                { time: '2 hours ago', action: 'Admin login', user: 'admin@churnaizer.com' },
                { time: '3 hours ago', action: 'Email campaign sent', user: 'System' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;
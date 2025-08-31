import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  User, 
  Bell, 
  Shield,  // Changed from Security to Shield
  Mail,
  Trash2,
  Save
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    company: user?.user_metadata?.company || '',
    website: user?.user_metadata?.website || ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    weeklyReports: true,
    riskNotifications: true,
    marketingEmails: false
  });

  const handleSave = () => {
    // Here you would typically save to your backend
    setIsEditing(false);
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a new profile picture
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                disabled={!isEditing}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailAlerts">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when customers are at high risk of churning
                </p>
              </div>
              <Switch
                id="emailAlerts"
                checked={notificationSettings.emailAlerts}
                onCheckedChange={(value) => handleNotificationChange('emailAlerts', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyReports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summary reports via email
                </p>
              </div>
              <Switch
                id="weeklyReports"
                checked={notificationSettings.weeklyReports}
                onCheckedChange={(value) => handleNotificationChange('weeklyReports', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="riskNotifications">Risk Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Instant notifications for high-risk customer changes
                </p>
              </div>
              <Switch
                id="riskNotifications"
                checked={notificationSettings.riskNotifications}
                onCheckedChange={(value) => handleNotificationChange('riskNotifications', value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Product updates, tips, and promotional content
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(value) => handleNotificationChange('marketingEmails', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">
            Change Password
          </Button>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
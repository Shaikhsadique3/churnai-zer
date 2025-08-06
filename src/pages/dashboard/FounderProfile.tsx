import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Shield,
  Key,
  Bell,
  CreditCard,
  Settings,
  Edit3,
  Save,
  Camera,
  Plus,
  Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const FounderProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    
    // Company Information
    companyName: "",
    website: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    
    // Business Metrics
    mrr: "",
    customers: "",
    churnRate: "",
    targetMarket: "",
    
    // Preferences
    notifications: {
      email: true,
      sms: false,
      dashboard: true
    }
  });

  const handleSave = () => {
    // TODO: Save to Supabase
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0">
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profileData.fullName || "Founder Profile"}
                </h1>
                <p className="text-muted-foreground">
                  {profileData.companyName ? `Founder @ ${profileData.companyName}` : "SaaS Founder"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Pro Plan</Badge>
                  <Badge variant="outline">Verified</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself and your entrepreneurial journey..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Information */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Details about your SaaS business and company.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={profileData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://acme.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={profileData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      disabled={!isEditing}
                      placeholder="SaaS, E-commerce, Fintech..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Input
                      id="companySize"
                      value={profileData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      disabled={!isEditing}
                      placeholder="1-10 employees"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      value={profileData.foundedYear}
                      onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                      disabled={!isEditing}
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetMarket">Target Market</Label>
                    <Input
                      id="targetMarket"
                      value={profileData.targetMarket}
                      onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                      disabled={!isEditing}
                      placeholder="B2B, SMB, Enterprise..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Metrics */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Monthly Recurring Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${profileData.mrr || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monthly recurring revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Total Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {profileData.customers || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active customers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    Churn Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {profileData.churnRate || "0"}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monthly churn rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-success" />
                    Retention Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {profileData.churnRate ? (100 - parseFloat(profileData.churnRate)).toFixed(1) : "100"}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer retention
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Update Business Metrics</CardTitle>
                <CardDescription>
                  Keep your business metrics up to date for better churn predictions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mrr">Monthly Recurring Revenue ($)</Label>
                    <Input
                      id="mrr"
                      type="number"
                      value={profileData.mrr}
                      onChange={(e) => handleInputChange('mrr', e.target.value)}
                      disabled={!isEditing}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customers">Total Customers</Label>
                    <Input
                      id="customers"
                      type="number"
                      value={profileData.customers}
                      onChange={(e) => handleInputChange('customers', e.target.value)}
                      disabled={!isEditing}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="churnRate">Monthly Churn Rate (%)</Label>
                    <Input
                      id="churnRate"
                      type="number"
                      step="0.1"
                      value={profileData.churnRate}
                      onChange={(e) => handleInputChange('churnRate', e.target.value)}
                      disabled={!isEditing}
                      placeholder="5.0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing & Subscription */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    Your current Churnaizer subscription plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Professional Plan</p>
                      <p className="text-sm text-muted-foreground">10,000 predictions/month</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Cost</span>
                    <span className="font-semibold">$149/month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Billing Date</span>
                    <span className="font-semibold">Jan 15, 2024</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Change Plan
                    </Button>
                    <Button variant="ghost" className="w-full text-destructive">
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage This Month</CardTitle>
                  <CardDescription>
                    Track your current usage against plan limits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Predictions Used</span>
                      <span>7,234 / 10,000</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>API Calls</span>
                      <span>45,678 / Unlimited</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Retention Emails</span>
                      <span>234 / Unlimited</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important events.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <input type="checkbox" checked={profileData.notifications.email} className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                    </div>
                    <input type="checkbox" checked={profileData.notifications.sms} className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dashboard Notifications</p>
                      <p className="text-sm text-muted-foreground">Show in-app notifications</p>
                    </div>
                    <input type="checkbox" checked={profileData.notifications.dashboard} className="rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage your API keys for integrating with Churnaizer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Production API Key</p>
                      <p className="text-sm text-muted-foreground font-mono">cg_••••••••••••••••••••••••••••••••••••••••••••••••••••••••</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Test API Key</p>
                      <p className="text-sm text-muted-foreground font-mono">test_••••••••••••••••••••••••••••••••••••••••••••••••••••</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will affect your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FounderProfile;
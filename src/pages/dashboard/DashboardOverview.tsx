import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Upload,
  Mail,
  Target,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardOverview() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Customers",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "At-Risk Customers",
      value: "127",
      change: "+8.2%",
      trend: "up",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Saved This Month",
      value: "34",
      change: "+156%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Revenue Protected",
      value: "$52,840",
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Upload Customer Data",
      description: "Upload CSV file to analyze churn risk",
      icon: Upload,
      action: () => navigate("/csv-upload"),
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      title: "View Analytics",
      description: "Detailed churn analytics and insights",
      icon: TrendingUp,
      action: () => navigate("/analytics"),
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "Email Campaigns",
      description: "Automated retention campaigns",
      icon: Mail,
      action: () => navigate("/reports"),
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your customer retention.
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">{stat.change}</span>
                    <span className="text-muted-foreground ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start text-left space-y-2 ${action.color}`}
                onClick={action.action}
              >
                <action.icon className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest churn predictions and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">High Risk Customer Detected</p>
                <p className="text-sm text-muted-foreground">
                  Customer ID: CUST_4821 - 87% churn probability
                </p>
              </div>
              <Badge variant="destructive">High Risk</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Customer Retention Success</p>
                <p className="text-sm text-muted-foreground">
                  Customer ID: CUST_3654 responded to retention email
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700">Retained</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New Data Upload</p>
                <p className="text-sm text-muted-foreground">
                  customers_jan_2024.csv - 1,247 records processed
                </p>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
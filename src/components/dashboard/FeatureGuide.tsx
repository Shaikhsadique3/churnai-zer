
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Upload, 
  Code, 
  Mail, 
  Users, 
  User,
  CheckCircle
} from "lucide-react";

const features = [
  {
    page: "Dashboard",
    icon: BarChart3,
    button: "Refresh",
    function: "Reloads predictions",
    description: "View churn analytics, risk summaries, and user predictions",
    status: "live"
  },
  {
    page: "CSV Upload",
    icon: Upload,
    button: "Upload File",
    function: "Predicts churn",
    description: "Bulk upload user data to get AI churn predictions",
    status: "live"
  },
  {
    page: "SDK Integration",
    icon: Code,
    button: "Check SDK Integration",
    function: "Real-time test",
    description: "Install SDK on your website for automatic user tracking",
    status: "live"
  },
  {
    page: "Email Logs",
    icon: Mail,
    button: "View Details",
    function: "Show email content",
    description: "Track retention emails sent to at-risk users",
    status: "live"
  },
  {
    page: "Recovered Users",
    icon: Users,
    button: "View Recovery",
    function: "Show revenue saved",
    description: "Monitor users who were saved from churning",
    status: "live"
  },
  {
    page: "Founder Profile",
    icon: User,
    button: "Update Profile",
    function: "Save company info",
    description: "Configure your company details and API keys",
    status: "live"
  }
];

export const FeatureGuide = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Feature Guide</h2>
        <p className="text-muted-foreground">
          Complete overview of all production-ready features in Churnaizer
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{feature.page}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {feature.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {feature.description}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Main Action:</span>
                  <code className="px-2 py-1 bg-muted rounded text-xs">
                    {feature.button}
                  </code>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Function:</span>
                  <span className="text-muted-foreground">{feature.function}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Frontend App</h4>
              <p className="text-sm text-muted-foreground">
                Shows results, triggers email/AI predictions, and manages user interface
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Churnaizer SDK</h4>
              <p className="text-sm text-muted-foreground">
                Tracks user behavior and sends metadata from your website
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Model</h4>
              <p className="text-sm text-muted-foreground">
                Predicts churn risk with fallback logic and email tone analysis
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Supabase Backend</h4>
              <p className="text-sm text-muted-foreground">
                Stores logs, user info, email attempts, and handles authentication
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

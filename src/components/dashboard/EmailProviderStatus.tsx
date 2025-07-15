import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

export const EmailProviderStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Service Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            ✅ Default Churnaizer Email Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Custom integrations coming soon!
        </p>
      </CardContent>
    </Card>
  );
};
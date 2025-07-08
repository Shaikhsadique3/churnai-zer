import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

export const AutomationBanner: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Automation Activated</span>
          </div>
          <Badge variant="outline" className="bg-white">
            <Clock className="h-3 w-3 mr-1" />
            Runs every 6 hours
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Your playbooks will automatically check for matching users and trigger actions.
        </p>
      </CardContent>
    </Card>
  );
};
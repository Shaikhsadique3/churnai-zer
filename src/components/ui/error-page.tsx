import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  type?: '404' | '500' | 'sdk' | 'general';
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRefreshButton?: boolean;
  customAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorPage({
  type = 'general',
  title,
  description,
  showHomeButton = true,
  showBackButton = true,
  showRefreshButton = false,
  customAction
}: ErrorPageProps) {
  const navigate = useNavigate();

  const getContent = () => {
    switch (type) {
      case '404':
        return {
          icon: '🚧',
          title: title || 'Page Not Found',
          description: description || "The page you're looking for doesn't exist or has moved."
        };
      case '500':
        return {
          icon: '⚠️',
          title: title || 'Server Error',
          description: description || "Something went wrong on our end. Please try again in a moment."
        };
      case 'sdk':
        return {
          icon: '🔧',
          title: title || 'SDK Integration Issue',
          description: description || "There's an issue with the SDK setup. Please check your configuration."
        };
      default:
        return {
          icon: '❌',
          title: title || 'Something went wrong',
          description: description || "We couldn't complete this action. Please try again or contact support."
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">{content.icon}</div>
            <h1 className="text-xl font-semibold text-foreground">
              {content.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {content.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              )}
              
              {showHomeButton && (
                <Button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              )}
              
              {showRefreshButton && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              )}
              
              {customAction && (
                <Button
                  onClick={customAction.onClick}
                  variant="secondary"
                >
                  {customAction.label}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
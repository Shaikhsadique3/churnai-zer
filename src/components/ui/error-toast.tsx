import { toast } from "@/hooks/use-toast";
import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react";

type ErrorType = 'error' | 'warning' | 'info' | 'sdk';

interface ErrorToastOptions {
  title: string;
  description?: string;
  type?: ErrorType;
  duration?: number;
}

export function showErrorToast(
  title: string,
  description?: string,
  type: ErrorType = 'error',
  duration: number = 5000
) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'sdk':
        return '🔧';
      default:
        return '❌';
    }
  };

  toast({
    title: `${getIcon()} ${title}`,
    description,
    variant: type === 'info' ? 'default' : 'destructive',
    duration,
    className: "border-l-4 border-l-primary",
  });
}

export function showSuccessToast(title: string, description?: string) {
  toast({
    title: `✅ ${title}`,
    description,
    variant: 'default',
    duration: 4000,
    className: "border-l-4 border-l-secondary bg-secondary/5",
  });
}

export function showWarningToast(title: string, description?: string) {
  showErrorToast(title, description, 'warning');
}

export function showInfoToast(title: string, description?: string) {
  showErrorToast(title, description, 'info');
}

export function showSDKErrorToast(description?: string) {
  showErrorToast(
    'SDK Integration Failed',
    description || "We couldn't detect user data or the SDK isn't configured properly.",
    'sdk'
  );
}

// Common error messages
export const errorMessages = {
  general: "Something went wrong. Please try again or contact support.",
  network: "Connection issue. Please check your internet and try again.",
  notFound: "The resource you're looking for doesn't exist or has moved.",
  unauthorized: "You don't have permission to perform this action.",
  sdkNotFound: "SDK not found. Please add the Churnaizer SDK to your website.",
  userDataMissing: "User data missing. Please check your setup.",
  apiKeyMissing: "API key not found. Please ensure you have an active API key.",
  timeout: "Request timeout. Please try again.",
  invalidData: "Invalid data format. Please check your input.",
};
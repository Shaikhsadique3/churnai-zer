import { CheckCircle2, AlertTriangle, AlertCircle, XCircle } from "lucide-react";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const getConfig = () => {
    if (score >= 81) {
      return {
        color: "hsl(var(--success))",
        bg: "hsl(142 71% 45% / 0.1)",
        icon: CheckCircle2,
        label: "Strong",
      };
    }
    if (score >= 61) {
      return {
        color: "hsl(var(--info))",
        bg: "hsl(217 91% 60% / 0.1)",
        icon: CheckCircle2,
        label: "Stable",
      };
    }
    if (score >= 31) {
      return {
        color: "hsl(var(--warning))",
        bg: "hsl(38 92% 50% / 0.1)",
        icon: AlertTriangle,
        label: "At Risk",
      };
    }
    return {
      color: "hsl(var(--critical))",
      bg: "hsl(0 72% 51% / 0.1)",
      icon: XCircle,
      label: "Critical",
    };
  };

  const config = getConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

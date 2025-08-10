
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  description, 
  icon,
  headerActions 
}) => {
  return (
    <div className="space-y-6 p-6 min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            {icon || <TrendingUp className="h-8 w-8 text-primary" />}
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-lg mt-2">{description}</p>
          )}
        </div>
        {headerActions && (
          <div className="flex items-center gap-4">
            {headerActions}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

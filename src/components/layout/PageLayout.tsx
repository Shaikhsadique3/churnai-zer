
import React, { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  description,
  icon 
}) => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </DashboardLayout>
  );
};

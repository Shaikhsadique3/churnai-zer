
import React, { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureLogout } from '@/hooks/useSecureLogout';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { secureLogout } = useSecureLogout();

  const handleLogout = async () => {
    await secureLogout(true); // Show toast notifications
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Fixed sidebar on desktop, collapsible on mobile */}
        <div className="hidden md:block md:w-[280px] md:flex-shrink-0">
          <AppSidebar />
        </div>
        
        {/* Mobile sidebar - shown as overlay */}
        <div className="md:hidden">
          <AppSidebar />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
          <DashboardHeader 
            userEmail={user?.email || ''} 
            onLogout={handleLogout} 
          />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

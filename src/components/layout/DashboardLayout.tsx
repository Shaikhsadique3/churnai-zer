
import React, { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Show loading state
      toast({
        title: "Signing out...",
        description: "Please wait while we sign you out."
      });

      // Perform sign out
      await signOut();
      
      // Force navigation to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Show error toast
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive"
      });
      
      // Force sign out even if error occurs
      try {
        // Clear local storage as fallback
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      } catch (fallbackError) {
        console.error('Fallback logout error:', fallbackError);
        // Last resort - reload page
        window.location.reload();
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
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

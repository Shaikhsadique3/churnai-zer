
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderProps {
  userEmail: string;
  onLogout: () => void;
  isDemoData: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userEmail, onLogout, isDemoData }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          {isMobile && <SidebarTrigger />}
          
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
            {isDemoData ? (
              <Badge variant="destructive" className="ml-2">Demo Data</Badge>
            ) : (
              <Badge variant="success" className="ml-2">Live Data</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs">
                {userEmail.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {user?.user_metadata?.full_name || userEmail.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px] md:max-w-[200px]">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground"
          >


// Add a success variant to the Badge component if it doesn't exist
// This assumes you have a `ui/badge.tsx` file where you can add new variants.
// Example addition to `cva` in `ui/badge.tsx`:
// success: "border-transparent bg-green-500 text-white hover:bg-green-500/80"
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

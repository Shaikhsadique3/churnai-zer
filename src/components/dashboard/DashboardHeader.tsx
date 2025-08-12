
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/common/NotificationBell";
import { useSecureLogout } from "@/hooks/useSecureLogout";

interface DashboardHeaderProps {
  userEmail: string;
  onLogout: () => Promise<void>;
}

const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();
  const { secureLogout } = useSecureLogout();

  const handleLogoutClick = async () => {
    if (isLoggingOut) return; // Prevent double-clicks
    
    setIsLoggingOut(true);
    try {
      await secureLogout(true); // Show toast notifications
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">
              churnaizer.com
            </h1>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              Welcome, {userEmail}
            </span>
            <NotificationBell />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? 'animate-spin' : ''}`} />
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-3">
              <span className="text-sm text-muted-foreground truncate">
                Welcome, {userEmail}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                <NotificationBell />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className="w-full justify-start transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? 'animate-spin' : ''}`} />
                {isLoggingOut ? 'Signing out...' : 'Logout'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;

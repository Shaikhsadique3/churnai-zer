
import { 
  Users, 
  Code,
  Upload,
  Mail,
  CheckCircle,
  TrendingUp,
  UserCircle,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

// Updated navigation items with Profile tab restored
const navigationItems = [
  { title: "Analytics Hub", url: "/dashboard", icon: TrendingUp },
  { title: "Website Integration", url: "/integration", icon: Code },
  { title: "User Predictions", url: "/users", icon: Users },
  { title: "CSV Upload", url: "/dashboard/csv-upload", icon: Upload },
  { title: "Email Automation", url: "/dashboard/email-automation", icon: Mail },
  { title: "Churn Recovery", url: "/dashboard/recovered-users", icon: CheckCircle },
  { title: "Profile", url: "/profile", icon: UserCircle },
];

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath === path || currentPath.startsWith(path);
  };

  const handleSignOut = async () => {
    if (isLoggingOut) return; // Prevent double-clicks
    
    setIsLoggingOut(true);
    
    try {
      // Show loading toast
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
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar
      className={`${!open && !isMobile ? "w-16" : "w-[280px]"} border-r border-sidebar-border bg-sidebar shadow-sm transition-all duration-300 h-screen`}
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center space-x-2">
          <Logo className="h-8 w-8 shrink-0" />
          {(open || isMobile) && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-sidebar-primary truncate">Churnaizer</h2>
              <p className="text-sm text-sidebar-foreground/70 truncate">Churn Prevention</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 px-4 py-4 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-lg h-10">
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center w-full transition-colors duration-200 px-3 py-2 ${
                        isActive(item.url)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <div className="flex items-center w-full">
                        <item.icon className={`h-5 w-5 shrink-0 ${(!open && !isMobile) ? "" : "mr-3"}`} />
                        {(open || isMobile) && <span className="font-medium text-sm truncate">{item.title}</span>}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        {user && (
          <div className={`flex items-center ${(!open && !isMobile) ? "justify-center" : "space-x-3 mb-3"}`}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {(open || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-primary truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}
        
        {(open || isMobile) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full text-sm text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground h-10 transition-all duration-200"
          >
            <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? 'animate-spin' : ''}`} />
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

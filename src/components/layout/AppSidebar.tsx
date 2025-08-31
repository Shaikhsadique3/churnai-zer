
import { 
  Users, 
  Upload,
  Mail,
  CheckCircle,
  TrendingUp,
  LogOut,
  Settings,
  UserCircle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useSecureLogout } from "@/hooks/useSecureLogout";

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

// Navigation items - Only working features
const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
  { title: "Cancel-Intent Predictor", url: "/csv-upload", icon: Upload },
];

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { secureLogout } = useSecureLogout();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath === path || currentPath.startsWith(path);
  };

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      await secureLogout(true);
    } catch (error) {
      console.error('Logout error:', error);
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
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-lg h-10">
              <NavLink 
                to="/profile" 
                className={`flex items-center w-full transition-colors duration-200 px-3 py-2 ${
                  isActive("/profile")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <div className="flex items-center w-full">
                  <UserCircle className={`h-5 w-5 shrink-0 ${(!open && !isMobile) ? "" : "mr-3"}`} />
                  {(open || isMobile) && <span className="font-medium text-sm truncate">Profile / Settings</span>}
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-lg h-10">
              <button 
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="flex items-center w-full transition-colors duration-200 px-3 py-2 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <div className="flex items-center w-full">
                  <LogOut className={`h-4 w-4 shrink-0 ${isLoggingOut ? 'animate-spin' : ''} ${(!open && !isMobile) ? "" : "mr-3"}`} />
                  {(open || isMobile) && <span className="font-medium text-sm truncate">{isLoggingOut ? 'Signing out...' : 'Logout'}</span>}
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

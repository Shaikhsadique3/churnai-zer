import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  LogOut,
  Shield,
  Code,
  Mail,
  BarChart3
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Navigation items matching the reference site structure
const navigationItems = [
  {
    title: "Website Integration",
    url: "/integration",
    icon: Code,
    isExact: true
  },
  {
    title: "User Predictions",
    url: "/users",
    icon: Users
  },
  {
    title: "Email Automation",
    url: "/automation",
    icon: Mail
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  const currentPath = location.pathname;

  const isActive = (path: string, isExact = false) => {
    if (isExact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string, isExact = false) => {
    const baseClass = "w-full justify-start transition-colors";
    if (isActive(path, isExact)) {
      return `${baseClass} bg-accent text-accent-foreground font-medium`;
    }
    return `${baseClass} text-muted-foreground hover:text-foreground hover:bg-accent/50`;
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r bg-card">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Churnaizer</h2>
              <p className="text-xs text-muted-foreground">Production Ready</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url, item.isExact)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-4">
        {!collapsed && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-foreground">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
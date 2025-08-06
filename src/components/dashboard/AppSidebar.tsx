import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  LogOut,
  Shield,
  Code,
  Mail,
  BarChart3,
  BookOpen,
  ExternalLink,
  CheckCircle,
  Bell,
  FileText,
  User,
  Book
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
    title: "Churn Recovery",
    url: "/recovery",
    icon: CheckCircle
  },
  {
    title: "Email Automation",
    url: "/automation",
    icon: Mail
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User
  }
];

const resourceItems = [
  {
    title: "Developer Documentation",
    url: "/dashboard/docs",
    icon: FileText,
    external: false
  },
  {
    title: "API Reference",
    url: "/integration",
    icon: Code,
    external: false
  },
  {
    title: "Blog",
    url: "/blog",
    icon: BookOpen,
    external: false
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
    const baseClass = "w-full justify-start transition-all duration-200";
    if (isActive(path, isExact)) {
      return `${baseClass} bg-primary text-primary-foreground font-semibold shadow-sm`;
    }
    return `${baseClass} text-muted-foreground hover:text-foreground hover:bg-primary/10`;
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r-0 shadow-sm bg-white">
      <SidebarHeader className="border-b border-border/30 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl shadow-sm">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold text-foreground">Churnaizer</h2>
              <p className="text-xs text-muted-foreground">Smart Churn Detection</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url, item.isExact)}>
                    <NavLink to={item.url} className="rounded-lg px-3 py-2.5">
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            {!collapsed && "Resources"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    {item.external ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2.5">
                        <item.icon className="h-5 w-5" />
                        {!collapsed && (
                          <>
                            <span className="ml-3 font-medium">{item.title}</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </>
                        )}
                      </a>
                    ) : (
                      <NavLink to={item.url} className="rounded-lg px-3 py-2.5">
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 px-4 py-4">
        {!collapsed && (
          <div className="mb-4 px-3 py-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-semibold text-foreground">
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
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg px-3 py-2.5"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
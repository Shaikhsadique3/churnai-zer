import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Upload,
  Users,
  BarChart3,
  Workflow,
  Puzzle,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  ChevronRight,
  Code
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navigationItems = [
  {
    title: "Dashboard Overview",
    url: "/dashboard",
    icon: Home,
    isExact: true
  },
  {
    title: "CSV Upload & Analysis",
    url: "/dashboard/csv-upload",
    icon: Upload
  },
  {
    title: "Uploaded Users",
    url: "/dashboard/users",
    icon: Users
  },
  {
    title: "Churn Reports",
    url: "/dashboard/reports",
    icon: BarChart3
  },
  {
    title: "Automations",
    url: "/dashboard/automations",
    icon: Workflow,
    subItems: [
      { title: "Playbooks", url: "/dashboard/automations/playbooks" },
      { title: "Playbook Builder", url: "/dashboard/automations/playbooks-builder" },
      { title: "Email Campaigns", url: "/dashboard/automations/emails" }
    ]
  },
  {
    title: "CRM & Email Integration",
    url: "/dashboard/integrations",
    icon: Puzzle
  },
  {
    title: "Website Integration",
    url: "/integration",
    icon: Code
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings
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
              <h2 className="text-lg font-bold text-foreground">ChurnGuard</h2>
              <p className="text-xs text-muted-foreground">Lite Version</p>
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
                  {item.subItems ? (
                    <Collapsible 
                      defaultOpen={item.subItems.some(subItem => isActive(subItem.url))}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className={getNavClassName(item.url)}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.title}</span>
                              <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild
                                  className={getNavClassName(subItem.url)}
                                >
                                  <NavLink to={subItem.url}>
                                    {subItem.title}
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild className={getNavClassName(item.url, item.isExact)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
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
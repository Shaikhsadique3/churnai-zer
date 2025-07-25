import { 
  BarChart3, 
  Users, 
  Zap, 
  Upload, 
  PlayCircle, 
  Mail, 
  Shield, 
  Home,
  Database
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Users", url: "/dashboard/users", icon: Users },
  { title: "CSV Upload", url: "/dashboard/csv-upload", icon: Upload },
  { title: "Playbooks", url: "/dashboard/playbooks", icon: PlayCircle },
  { title: "AI Campaigns", url: "/dashboard/campaigns", icon: Mail },
  { title: "Automations", url: "/dashboard/automations", icon: Zap },
];

const integrationItems = [
  { title: "SDK Setup", url: "/integration/setup", icon: Shield },
  { title: "API Keys", url: "/integration", icon: Database },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || (path !== "/" && currentPath.startsWith(path));

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full ${isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}`;

  return (
    <Sidebar
      className={`${!open ? "w-14" : "w-64"} border-r transition-all duration-200`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-3">
          <Logo className="h-8 w-8 shrink-0" />
          {open && (
            <div>
              <h2 className="text-xl font-bold text-primary">Churnaizer</h2>
              <p className="text-xs text-muted-foreground">AI-Powered Churn Prevention</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`h-4 w-4 ${!open ? "" : "mr-3"}`} />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Integration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`h-4 w-4 ${!open ? "" : "mr-3"}`} />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {user && (
          <div className={`flex items-center ${!open ? "justify-center" : "space-x-3"}`}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}
        
        {open && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="w-full mt-2 text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
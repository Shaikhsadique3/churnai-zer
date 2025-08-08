
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Code, Mail, User, BookOpen, HelpCircle, Users, CheckCircle, FileText } from "lucide-react";
import { AccountSection } from './AccountSection';

const navigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "SDK Integration", 
    icon: Code,
    href: "/sdk",
  },
  {
    title: "User Predictions",
    icon: Users,
    href: "/users",
  },
  {
    title: "Churn Recovery",
    icon: CheckCircle,
    href: "/recovery",
  },
  {
    title: "Email Logs",
    icon: Mail,
    href: "/email-logs",
  },
  {
    title: "Profile",
    icon: User,
    href: "/profile",
  }
];

const resources = [
  {
    title: "Feature Guide",
    icon: BookOpen,
    href: "/resources/feature-guide",
  },
  {
    title: "Blog",
    icon: FileText,
    href: "/blog",
  },
  {
    title: "Help & Support",
    icon: HelpCircle,
    href: "/help",
  }
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Churnaizer</span>
                  <span className="truncate text-xs">Churn Prevention</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resources.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <AccountSection />
      </SidebarFooter>
    </Sidebar>
  );
};

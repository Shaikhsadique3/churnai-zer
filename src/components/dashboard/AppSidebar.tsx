import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Upload,
  Mail,
  Zap,
  Bot,
  Users,
  CheckCircle,
  BookOpen,
  Menu,
  TrendingUp,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics Hub",
    url: "/dashboard/analytics", 
    icon: TrendingUp,
  },
  {
    title: "CSV Upload",
    url: "/dashboard/csv-upload",
    icon: Upload,
  },
  {
    title: "Email Automation",
    url: "/dashboard/email-automation",
    icon: Mail,
  },
  {
    title: "Automations",
    url: "/dashboard/automations",
    icon: Zap,
  },
  {
    title: "AI Campaigns",
    url: "/dashboard/campaigns",
    icon: Bot,
  },
  {
    title: "User Predictions",
    url: "/dashboard/user-predictions",
    icon: Users,
  },
  {
    title: "Churn Recovery",
    url: "/dashboard/recovered-users",
    icon: CheckCircle,
  },
  {
    title: "Playbooks",
    url: "/dashboard/playbooks",
    icon: BookOpen,
  },
];

export const AppSidebar = () => {
  const { isOpen, onOpen, onClose } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar
        className="hidden md:block border-r border-border"
        defaultOpen={true}
        close={onClose}
        open={isOpen}
        items={navigationItems}
      />

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetTrigger asChild>
          <Menu className="md:hidden p-2 hover:bg-sidebar-accent rounded-md transition-colors" />
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-64 border-r border-border p-0">
          <SheetHeader className="pl-6 pr-4 pt-4 pb-2.5">
            <SheetTitle>Churnaizer</SheetTitle>
            <SheetDescription>
              Navigate your dashboard
            </SheetDescription>
          </SheetHeader>
          <Sidebar
            className="md:hidden"
            defaultOpen={false}
            close={onClose}
            open={isOpen}
            items={navigationItems}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

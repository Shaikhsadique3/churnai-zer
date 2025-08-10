
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
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:block border-r border-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Churnaizer</h2>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm">{item.title}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </Sidebar>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="md:hidden p-2 hover:bg-sidebar-accent rounded-md transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-64 border-r border-border p-0">
          <SheetHeader className="pl-6 pr-4 pt-4 pb-2.5">
            <SheetTitle>Churnaizer</SheetTitle>
            <SheetDescription>
              Navigate your dashboard
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.title}
                    href={item.url}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{item.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile header with hamburger */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 shadow-sm lg:hidden">
            <SidebarTrigger className="p-2 hover:bg-sidebar-accent rounded-md transition-colors">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold text-foreground">Churnaizer</h1>
          </header>
          
          {/* Main content with padding and clean background */}
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto p-6 space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
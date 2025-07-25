import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header with hamburger - always visible on mobile */}
          <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3 shadow-sm md:hidden">
            <SidebarTrigger className="p-1 hover:bg-sidebar-accent rounded-md transition-colors" />
          </header>
          
          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            <div className="w-full max-w-none mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
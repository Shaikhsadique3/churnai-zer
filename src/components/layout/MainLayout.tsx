
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
          <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4 shadow-sm md:hidden sticky top-0 z-50">
            <SidebarTrigger className="p-2 hover:bg-sidebar-accent rounded-md transition-colors" />
            <h1 className="text-lg font-semibold text-foreground">Churnaizer</h1>
          </header>
          
          {/* Desktop header with sidebar trigger - always visible */}
          <header className="hidden md:flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4 shadow-sm sticky top-0 z-50">
            <SidebarTrigger className="p-2 hover:bg-sidebar-accent rounded-md transition-colors" />
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

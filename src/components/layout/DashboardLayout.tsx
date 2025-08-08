
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CleanAppSidebar } from "@/components/dashboard/CleanAppSidebar"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import { useAuth } from "@/contexts/AuthContext"
import { useIsMobile } from "@/hooks/use-mobile"

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full bg-background">
        <CleanAppSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden md:block">
                  <h1 className="text-xl font-semibold text-foreground">
                    {getPageTitle(location.pathname)}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
                <DashboardHeader 
                  userEmail={user?.email || ""}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

// Helper function to get page title based on route
function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard'
    case '/csv-upload':
      return 'CSV Upload'
    case '/sdk':
    case '/integration':
      return 'SDK Integration'
    case '/email-logs':
      return 'Email Logs'
    case '/profile':
      return 'Founder Profile'
    default:
      if (pathname.includes('/sdk') || pathname.includes('/integration')) return 'SDK Integration'
      if (pathname.includes('/csv-upload')) return 'CSV Upload'
      if (pathname.includes('/email-logs')) return 'Email Logs'
      if (pathname.includes('/profile')) return 'Profile Settings'
      return 'Dashboard'
  }
}

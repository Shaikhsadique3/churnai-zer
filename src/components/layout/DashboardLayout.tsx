
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CleanAppSidebar } from "@/components/dashboard/CleanAppSidebar"
import { Outlet } from "react-router-dom"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <CleanAppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <header className="border-b bg-background px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <DashboardHeader />
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

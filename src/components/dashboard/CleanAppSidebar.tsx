
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  BarChart3, 
  Upload, 
  Code,
  Mail,
  Users,
  User,
  Shield
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    description: "Analytics & insights"
  },
  {
    title: "CSV Upload",
    url: "/dashboard/csv-upload",
    icon: Upload,
    description: "Bulk user data import"
  },
  {
    title: "SDK Integration",
    url: "/integration",
    icon: Code,
    description: "Real-time tracking setup"
  },
  {
    title: "Email Logs",
    url: "/dashboard/ai-email-campaigns",
    icon: Mail,
    description: "Retention email history"
  },
  {
    title: "Recovered Users",
    url: "/dashboard/recovered-users", 
    icon: Users,
    description: "Retention success metrics"
  },
  {
    title: "Founder Profile",
    url: "/dashboard/founder-profile",
    icon: User,
    description: "Account settings & API keys"
  }
]

export function CleanAppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarContent className="p-4">
        {/* Logo Section */}
        <div className="mb-8 px-2">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Churnaizer</span>
              <span className="text-xs text-muted-foreground">Churn Prediction AI</span>
            </div>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Core Features
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url === "/dashboard" && location.pathname.startsWith("/dashboard"))
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={`
                        h-11 px-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm font-medium' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          <span className={`text-xs truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Indicator */}
        <div className="mt-auto p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">System Status</span>
          </div>
          <p className="text-xs text-muted-foreground">All systems operational</p>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

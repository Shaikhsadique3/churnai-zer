
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  Calculator, 
  Mail, 
  BookOpen, 
  TrendingUp,
  Crown,
  Zap,
  Menu
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Logo } from "@/components/ui/logo"
import { AccountSection } from "@/components/dashboard/AccountSection"
import { useSubscription } from "@/hooks/useSubscription"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"

const menuItems = [
  {
    title: "Revenue Calculator",
    url: "/dashboard",
    icon: Calculator,
  },
  {
    title: "Email Generator",
    url: "/dashboard/email-generator", 
    icon: Mail,
  },
  {
    title: "Retention Playbooks",
    url: "/dashboard/playbooks",
    icon: BookOpen,
  },
  {
    title: "Full Report",
    url: "/dashboard/report",
    icon: TrendingUp,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const { toggleSidebar } = useSidebar()
  const { credits, getCurrentPlan, isFreePlan, getUsagePercentage } = useSubscription()
  
  const currentPlan = getCurrentPlan()
  const usagePercentage = getUsagePercentage()

  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "none"}
      className={`${isMobile ? '' : 'border-r border-sidebar-border fixed left-0 top-0 h-screen w-[280px] z-30'}`}
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Logo size="sm" />
            <h1 className="text-lg font-semibold text-sidebar-foreground">Churnaizer</h1>
          </Link>
          {/* Mobile menu toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Revenue Recovery</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="w-full justify-start"
                  >
                    <Link to={item.url} className="flex items-center">
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Credits Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Credits & Plan</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3">
            {/* Current Plan */}
            <div className="px-3 py-2 bg-sidebar-accent rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {currentPlan?.name || 'Free'} Plan
                </span>
                {currentPlan?.slug === 'pro' && <Zap className="h-4 w-4 text-blue-500" />}
                {currentPlan?.slug === 'growth' && <Crown className="h-4 w-4 text-purple-500" />}
              </div>
            </div>

            {/* Credits Display */}
            {credits && (
              <div className="px-3 py-2 bg-sidebar-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Credits</span>
                    <span className="font-medium text-sidebar-foreground">
                      {credits.credits_available.toLocaleString()} / {credits.credits_limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-sidebar-border rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  {usagePercentage > 80 && (
                    <Badge variant="destructive" className="text-xs">
                      Low Credits
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Upgrade Button */}
            {isFreePlan() && (
              <Button asChild variant="default" size="sm" className="w-full">
                <Link to="/dashboard/upgrade">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <AccountSection />
      </SidebarFooter>
    </Sidebar>
  )
}

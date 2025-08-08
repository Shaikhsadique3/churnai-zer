
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
  Settings, 
  User, 
  Mail,
  Users,
  TrendingUp,
  Code,
  Key
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "CSV Upload",
    url: "/dashboard/csv-upload",
    icon: Upload,
  },
  {
    title: "SDK Integration",
    url: "/integration",
    icon: Code,
  },
  {
    title: "Email Logs",
    url: "/dashboard/ai-email-campaigns",
    icon: Mail,
  },
  {
    title: "Recovered Users",
    url: "/dashboard/recovered-users", 
    icon: Users,
  },
  {
    title: "Founder Profile",
    url: "/dashboard/founder-profile",
    icon: User,
  }
]

export function CleanAppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Churnaizer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

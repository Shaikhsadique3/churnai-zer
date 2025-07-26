import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  BarChart3, 
  Megaphone, 
  FileText, 
  Mail, 
  LogOut,
  ExternalLink,
  Shield
} from 'lucide-react';

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: BarChart3,
    isExact: true
  },
  {
    title: "Announcements",
    url: "/admin/announcements",
    icon: Megaphone
  },
  {
    title: "Blog Manager",
    url: "/admin/blogs",
    icon: FileText
  },
  {
    title: "Email Inbox",
    url: "/admin/inbox",
    icon: Mail
  }
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string, isExact = false) => {
    if (isExact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string, isExact = false) => {
    const baseClass = "w-full justify-start transition-colors rounded-md px-3 py-2";
    if (isActive(path, isExact)) {
      return `${baseClass} bg-accent text-accent-foreground font-medium`;
    }
    return `${baseClass} text-muted-foreground hover:text-foreground hover:bg-accent/50`;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Churnaizer</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              onClick={() => setSidebarOpen(false)}
              className={getNavClassName(item.url, item.isExact)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t px-3 py-4 space-y-4">
        <div className="px-3">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.email?.split('@')[0] || 'Admin'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => window.location.href = '/integration'}
          className="w-full justify-start"
        >
          <ExternalLink className="h-4 w-4 mr-3" />
          View Main App
        </Button>
        
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
      </div>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
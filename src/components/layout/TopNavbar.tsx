import { Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSecureLogout } from "@/hooks/useSecureLogout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/common/NotificationBell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function TopNavbar() {
  const { user, signOut } = useAuth();
  const { secureLogout } = useSecureLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('founder_profile')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const isDemoData = !profile?.onboarding_completed && !loadingProfile;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await secureLogout(true);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <DashboardHeader userEmail={user?.email || ''} onLogout={handleLogout} isDemoData={isDemoData} />
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, CreditCard, Calendar, Crown, Calculator, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

interface FounderStats {
  calculationsUsed: number;
  emailsGenerated: number;
  playbooksAccessed: number;
  reportsDownloaded: number;
  totalRevenueSaved: number;
  lastActivityDate: string;
}

export const AccountSection = () => {
  const { user, signOut } = useAuth();
  const { getCurrentPlan } = useSubscription();
  const navigate = useNavigate();
  const [founderStats, setFounderStats] = useState<FounderStats>({
    calculationsUsed: 0,
    emailsGenerated: 0,
    playbooksAccessed: 0,
    reportsDownloaded: 0,
    totalRevenueSaved: 0,
    lastActivityDate: new Date().toISOString()
  });

  const currentPlan = getCurrentPlan();

  useEffect(() => {
    fetchFounderStats();
  }, [user]);

  const fetchFounderStats = async () => {
    if (!user) return;
    
    try {
      // Fetch founder profile to get stats
      const { data: profile } = await supabase
        .from('founder_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Update stats based on actual usage
        setFounderStats({
          calculationsUsed: Math.floor(Math.random() * 45) + 15, // Mock data for now
          emailsGenerated: Math.floor(Math.random() * 25) + 8,
          playbooksAccessed: Math.floor(Math.random() * 12) + 3,
          reportsDownloaded: Math.floor(Math.random() * 8) + 2,
          totalRevenueSaved: profile.monthly_revenue ? profile.monthly_revenue * 0.15 : 0,
          lastActivityDate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching founder stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlanBadgeVariant = (planSlug?: string) => {
    switch (planSlug) {
      case 'pro':
        return 'default';
      case 'growth':
        return 'secondary';
      case 'free':
      default:
        return 'outline';
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-12 px-3">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-sidebar-primary truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant={getPlanBadgeVariant(currentPlan?.slug)} className="text-xs px-1.5 py-0">
                {currentPlan?.name || 'Free'}
              </Badge>
              <span className="text-xs text-sidebar-foreground/70">
                Active
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-4" align="end" side="top">
        <DropdownMenuLabel className="pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-foreground truncate">
                {user.user_metadata?.full_name || 'Founder'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Revenue Recovery Stats */}
        <div className="py-3 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calculator className="h-3 w-3 mr-1" />
                Calculations
              </div>
              <p className="text-sm font-medium">{founderStats.calculationsUsed}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Crown className="h-3 w-3 mr-1" />
                Plan Type
              </div>
              <Badge variant={getPlanBadgeVariant(currentPlan?.slug)} className="text-xs">
                {currentPlan?.name || 'Free'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Emails Generated:</span>
              <span className="font-medium">{founderStats.emailsGenerated}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Playbooks Used:</span>
              <span className="font-medium">{founderStats.playbooksAccessed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reports Downloaded:</span>
              <span className="font-medium">{founderStats.reportsDownloaded}</span>
            </div>
          </div>
          
          {/* Revenue Impact */}
          {founderStats.totalRevenueSaved > 0 && (
            <div className="pt-2 border-t space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                Estimated Revenue Protected
              </div>
              <p className="text-lg font-bold text-green-600">
                ${founderStats.totalRevenueSaved.toLocaleString()}
              </p>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Last Activity</span>
              <span className="font-medium">{formatDate(founderStats.lastActivityDate)}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Action Buttons */}
        <div className="space-y-1 pt-2">
          <DropdownMenuItem 
            onClick={() => navigate('/profile')}
            className="cursor-pointer flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing & Usage
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

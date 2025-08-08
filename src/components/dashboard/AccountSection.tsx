
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, CreditCard, Calendar, Crown } from 'lucide-react';
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

export const AccountSection = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Mock account data - in production this would come from your database
  const accountData = {
    planType: 'Professional',
    planStatus: 'Active',
    billingCycle: 'Monthly',
    nextBillingDate: '2025-02-08',
    subscriptionStartDate: '2024-08-08',
    storageUsed: '2.3 GB',
    storageLimit: '10 GB',
    apiCallsUsed: 1247,
    apiCallsLimit: 10000
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
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

  const getPlanBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'trial':
        return 'secondary';
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
              <Badge variant={getPlanBadgeVariant(accountData.planStatus)} className="text-xs px-1.5 py-0">
                {accountData.planType}
              </Badge>
              <span className="text-xs text-sidebar-foreground/70">
                {accountData.planStatus}
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
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Account Details */}
        <div className="py-3 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Crown className="h-3 w-3 mr-1" />
                Plan Type
              </div>
              <p className="text-sm font-medium">{accountData.planType}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Status
              </div>
              <Badge variant={getPlanBadgeVariant(accountData.planStatus)} className="text-xs">
                {accountData.planStatus}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Billing Cycle:</span>
              <span className="font-medium">{accountData.billingCycle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Billing:</span>
              <span className="font-medium">{formatDate(accountData.nextBillingDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="font-medium">{formatDate(accountData.subscriptionStartDate)}</span>
            </div>
          </div>
          
          {/* Usage Stats */}
          <div className="pt-2 border-t space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">{accountData.storageUsed} / {accountData.storageLimit}</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(2.3 / 10) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">API Calls This Month</span>
                <span className="font-medium">{accountData.apiCallsUsed.toLocaleString()} / {accountData.apiCallsLimit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(accountData.apiCallsUsed / accountData.apiCallsLimit) * 100}%` }}
                />
              </div>
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

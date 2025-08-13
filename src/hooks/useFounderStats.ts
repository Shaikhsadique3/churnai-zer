
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface FounderStats {
  calculationsUsed: number;
  emailsGenerated: number;
  playbooksAccessed: number;
  reportsDownloaded: number;
  totalRevenueSaved: number;
  lastActivityDate: string;
  companyName?: string;
  monthlyRevenue?: number;
  churnRate?: number;
}

export const useFounderStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FounderStats>({
    calculationsUsed: 0,
    emailsGenerated: 0,
    playbooksAccessed: 0,
    reportsDownloaded: 0,
    totalRevenueSaved: 0,
    lastActivityDate: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFounderStats();
    }
  }, [user]);

  const fetchFounderStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get founder profile data
      const { data: profile } = await supabase
        .from('founder_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setStats(prev => ({
          ...prev,
          companyName: profile.company_name,
          monthlyRevenue: profile.monthly_revenue,
          churnRate: profile.current_churn_rate,
          totalRevenueSaved: profile.monthly_revenue ? profile.monthly_revenue * 0.15 : 0
        }));
      }

      // For now, use mock data for activity stats
      // In production, these would be calculated from actual usage logs
      setStats(prev => ({
        ...prev,
        calculationsUsed: Math.floor(Math.random() * 45) + 15,
        emailsGenerated: Math.floor(Math.random() * 25) + 8,
        playbooksAccessed: Math.floor(Math.random() * 12) + 3,
        reportsDownloaded: Math.floor(Math.random() * 8) + 2,
        lastActivityDate: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error fetching founder stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateActivityStat = async (activity: keyof FounderStats, increment = 1) => {
    if (!user) return;

    try {
      // Update local state immediately
      setStats(prev => ({
        ...prev,
        [activity]: typeof prev[activity] === 'number' ? prev[activity] + increment : increment,
        lastActivityDate: new Date().toISOString()
      }));

      // In production, you would save this to a user_activity_stats table
      console.log(`Updated ${activity} by ${increment} for user ${user.id}`);
      
    } catch (error) {
      console.error('Error updating activity stat:', error);
    }
  };

  const saveCompanyData = async (companyData: Partial<FounderStats>) => {
    if (!user) return;

    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('founder_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('founder_profile')
          .update({
            company_name: companyData.companyName || existingProfile.company_name,
            monthly_revenue: companyData.monthlyRevenue || existingProfile.monthly_revenue,
            current_churn_rate: companyData.churnRate || existingProfile.current_churn_rate,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile with required fields
        const { error } = await supabase
          .from('founder_profile')
          .insert({
            user_id: user.id,
            company_name: companyData.companyName || 'Unknown Company',
            industry: 'SaaS',
            company_size: '1-10',
            location: 'Unknown',
            pricing_model: 'subscription',
            product_description: 'SaaS Product',
            target_market: 'B2B',
            revenue_model: 'subscription',
            monthly_revenue: companyData.monthlyRevenue || 0,
            current_churn_rate: companyData.churnRate || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update local state
      setStats(prev => ({ ...prev, ...companyData }));
      
    } catch (error) {
      console.error('Error saving company data:', error);
      throw error;
    }
  };

  return {
    stats,
    loading,
    updateActivityStat,
    saveCompanyData,
    refetch: fetchFounderStats
  };
};

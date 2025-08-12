
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  credits_per_month: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  is_test_mode: boolean;
  plan: SubscriptionPlan;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits_available: number;
  credits_used: number;
  credits_limit: number;
  reset_date: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPlans(),
        fetchUserSubscription(),
        fetchUserCredits()
      ]);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    // Transform features from JSONB to string array
    const transformedPlans = data?.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features.filter((f): f is string => typeof f === 'string') : []
    })) || [];

    setPlans(transformedPlans);
  };

  const fetchUserSubscription = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user subscription:', error);
      return;
    }

    if (data && data.plan) {
      // Transform the plan features
      const transformedData = {
        ...data,
        plan: {
          ...data.plan,
          features: Array.isArray(data.plan.features) ? 
            data.plan.features.filter((f): f is string => typeof f === 'string') : []
        }
      };
      setSubscription(transformedData);
    }
  };

  const fetchUserCredits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user credits:', error);
      return;
    }

    if (data) {
      setCredits(data);
    }
  };

  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_user_credits', {
        user_uuid: user.id,
        credits_to_deduct: amount
      });

      if (error) {
        console.error('Error deducting credits:', error);
        toast({
          title: "Error",
          description: "Failed to deduct credits. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (data) {
        // Refresh credits after successful deduction
        await fetchUserCredits();
        return true;
      } else {
        toast({
          title: "Insufficient Credits",
          description: "You don't have enough credits for this action. Please upgrade your plan.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error in deductCredits:', error);
      return false;
    }
  };

  const hasCredits = (amount: number): boolean => {
    return credits ? credits.credits_available >= amount : false;
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    return subscription?.plan || null;
  };

  const isFreePlan = (): boolean => {
    return subscription?.plan?.slug === 'free' || !subscription;
  };

  const getUsagePercentage = (): number => {
    if (!credits) return 0;
    return (credits.credits_used / credits.credits_limit) * 100;
  };

  return {
    plans,
    subscription,
    userSubscription: subscription, // Add alias for backward compatibility
    credits,
    userCredits: credits, // Add alias for backward compatibility
    loading,
    deductCredits,
    hasCredits,
    getCurrentPlan,
    isFreePlan,
    getUsagePercentage,
    refetch: fetchData
  };
};

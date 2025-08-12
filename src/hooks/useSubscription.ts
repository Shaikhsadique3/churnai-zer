
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits_per_month: number
  features: string[]
  is_active: boolean
}

export interface UserSubscription {
  id: string
  plan_id: string
  status: string
  billing_cycle: string
  is_test_mode: boolean
  plan?: SubscriptionPlan
}

export interface UserCredits {
  id: string
  credits_available: number
  credits_used: number
  credits_limit: number
  reset_date: string
}

export const useSubscription = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)

  // Fetch all subscription plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive',
      })
    }
  }

  // Fetch user's current subscription
  const fetchUserSubscription = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUserSubscription(data)
    } catch (error) {
      console.error('Error fetching user subscription:', error)
    }
  }

  // Fetch user's credits
  const fetchUserCredits = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUserCredits(data)
    } catch (error) {
      console.error('Error fetching user credits:', error)
    }
  }

  // Deduct credits for API usage
  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase.rpc('deduct_user_credits', {
        user_uuid: user.id,
        credits_to_deduct: amount
      })

      if (error) throw error

      if (data) {
        // Refresh credits after successful deduction
        await fetchUserCredits()
        return true
      } else {
        toast({
          title: 'Insufficient Credits',
          description: 'You have run out of credits. Please upgrade your plan.',
          variant: 'destructive',
        })
        return false
      }
    } catch (error) {
      console.error('Error deducting credits:', error)
      toast({
        title: 'Error',
        description: 'Failed to process request',
        variant: 'destructive',
      })
      return false
    }
  }

  // Check if user has enough credits
  const hasCredits = (amount: number = 1): boolean => {
    return (userCredits?.credits_available || 0) >= amount
  }

  // Get current plan
  const getCurrentPlan = (): SubscriptionPlan | null => {
    return userSubscription?.plan as SubscriptionPlan || null
  }

  // Check if user is on free plan
  const isFreePlan = (): boolean => {
    const currentPlan = getCurrentPlan()
    return currentPlan?.slug === 'free'
  }

  // Get usage percentage
  const getUsagePercentage = (): number => {
    if (!userCredits) return 0
    return (userCredits.credits_used / userCredits.credits_limit) * 100
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchPlans(),
        fetchUserSubscription(),
        fetchUserCredits(),
      ])
      setLoading(false)
    }

    loadData()
  }, [user])

  return {
    loading,
    plans,
    userSubscription,
    userCredits,
    deductCredits,
    hasCredits,
    getCurrentPlan,
    isFreePlan,
    getUsagePercentage,
    refresh: async () => {
      await Promise.all([fetchUserSubscription(), fetchUserCredits()])
    },
  }
}

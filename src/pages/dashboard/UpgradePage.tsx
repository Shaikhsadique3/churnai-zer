
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { lemonSqueezyService } from '@/services/lemonSqueezy'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Crown, Zap, AlertTriangle, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function UpgradePage() {
  const { user } = useAuth()
  const { plans, subscription, credits, loading, getCurrentPlan, refetch } = useSubscription()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)

  const currentPlan = getCurrentPlan()
  const successParam = searchParams.get('success')

  useEffect(() => {
    // Check if this is a new user (created within last 5 minutes)
    if (user?.created_at) {
      const userCreatedAt = new Date(user.created_at)
      const now = new Date()
      const timeDiff = now.getTime() - userCreatedAt.getTime()
      const isRecentSignup = timeDiff < 300000 // 5 minutes
      setIsNewUser(isRecentSignup)
    }
  }, [user])

  useEffect(() => {
    if (successParam === 'true') {
      toast({
        title: "Welcome to Churnaizer! 🎉",
        description: "Your subscription is now active. Let's get started with preventing churn!",
      })
      // Refetch subscription data after successful payment
      refetch()
      // Clear the success parameter
      navigate('/dashboard/upgrade', { replace: true })
    }
  }, [successParam, toast, refetch, navigate])

  const handleUpgrade = async (planSlug: string) => {
    if (!user || planSlug === 'free') return

    setProcessingPlan(planSlug)

    try {
      const variantId = lemonSqueezyService.getVariantId(planSlug, billingCycle)
      
      if (!variantId) {
        throw new Error('Plan variant not found')
      }

      const checkoutSession = await lemonSqueezyService.createCheckoutSession(
        variantId,
        user.id,
        user.email || '',
        `${window.location.origin}/dashboard/upgrade?success=true`
      )

      // Redirect to Lemon Squeezy checkout
      window.location.href = checkoutSession.attributes.url

    } catch (error) {
      console.error('Upgrade error:', error)
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setProcessingPlan(null)
    }
  }

  const handleContinueWithFree = () => {
    toast({
      title: "Welcome to Churnaizer! 🚀",
      description: "You're all set with the Free plan. Start preventing churn today!",
    })
    navigate('/dashboard')
  }

  const getPlanIcon = (planSlug: string) => {
    switch (planSlug) {
      case 'pro':
        return <Zap className="h-6 w-6 text-blue-500" />
      case 'growth':
        return <Crown className="h-6 w-6 text-purple-500" />
      default:
        return <Sparkles className="h-6 w-6 text-green-500" />
    }
  }

  const isCurrentPlan = (planSlug: string) => {
    return currentPlan?.slug === planSlug
  }

  const getButtonText = (planSlug: string) => {
    if (planSlug === 'free') {
      return isNewUser ? 'Continue with Free' : 'Current Plan'
    }
    if (isCurrentPlan(planSlug)) return 'Current Plan'
    if (processingPlan === planSlug) return 'Processing...'
    return 'Test Upgrade'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header for New Users */}
      {isNewUser && (
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Churnaizer! 🎉
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Choose the perfect plan to start preventing churn
          </p>
          <p className="text-muted-foreground">
            You can upgrade or downgrade at any time
          </p>
        </div>
      )}

      {/* Test Mode Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div className="text-yellow-800">
            <h3 className="font-semibold">Test Mode Active</h3>
            <p className="text-sm">No real charges will be made. This is for testing purposes only.</p>
          </div>
        </div>
      </div>

      {/* Current Usage */}
      {credits && !isNewUser && (
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Credits Used</p>
                <p className="text-2xl font-bold">{credits.credits_used.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Available</p>
                <p className="text-2xl font-bold">{credits.credits_available.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Limit</p>
                <p className="text-2xl font-bold">{credits.credits_limit.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: `${(credits.credits_used / credits.credits_limit) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {((credits.credits_used / credits.credits_limit) * 100).toFixed(1)}% used this month
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle Toggle */}
      <div className="text-center">
        <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">Save 10%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${isCurrentPlan(plan.slug) ? 'border-primary ring-2 ring-primary/20' : ''}`}>
            {isCurrentPlan(plan.slug) && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Current Plan
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.slug)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="space-y-1">
                <p className="text-3xl font-bold">
                  ${billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly}
                </p>
                <p className="text-sm text-muted-foreground">
                  per {billingCycle === 'monthly' ? 'month' : 'year'}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold">{plan.credits_per_month.toLocaleString()} credits/month</p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                onClick={() => plan.slug === 'free' ? handleContinueWithFree() : handleUpgrade(plan.slug)}
                disabled={processingPlan === plan.slug || (isCurrentPlan(plan.slug) && !isNewUser)}
                variant={isCurrentPlan(plan.slug) ? 'outline' : 'default'}
              >
                {getButtonText(plan.slug)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">What happens when I upgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Your credit limit will increase immediately, and you'll get access to advanced features included in your plan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Can I downgrade later?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time. Changes will take effect at your next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">What is Test Mode?</h4>
            <p className="text-sm text-muted-foreground">
              Test Mode allows you to try the upgrade process without being charged. No real payments will be processed.
            </p>
          </div>
          {isNewUser && (
            <div>
              <h4 className="font-semibold">Can I start with the Free plan?</h4>
              <p className="text-sm text-muted-foreground">
                Absolutely! You can start with our Free plan and upgrade anytime as your needs grow.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

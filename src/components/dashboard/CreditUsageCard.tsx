
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Crown, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'

export const CreditUsageCard = () => {
  const { userCredits, isFreePlan, getUsagePercentage } = useSubscription()

  if (!userCredits) return null

  const usagePercentage = getUsagePercentage()
  const isLowCredits = usagePercentage > 80

  return (
    <Card className={isLowCredits ? 'border-destructive' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Credit Usage
          {isLowCredits && <AlertTriangle className="h-4 w-4 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used this month</span>
            <span className="font-medium">
              {userCredits.credits_used.toLocaleString()} / {userCredits.credits_limit.toLocaleString()}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {userCredits.credits_available.toLocaleString()} credits remaining
          </div>
        </div>

        {isLowCredits && (
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-2">
              Running low on credits!
            </p>
            <p className="text-xs text-destructive/80 mb-3">
              You've used {usagePercentage.toFixed(0)}% of your monthly credits.
            </p>
            {isFreePlan() && (
              <Button asChild size="sm" variant="destructive">
                <Link to="/dashboard/upgrade">
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade Now
                </Link>
              </Button>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Credits reset on {new Date(userCredits.reset_date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}

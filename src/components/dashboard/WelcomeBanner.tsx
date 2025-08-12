
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WelcomeBanner() {
  const { user } = useAuth()
  const { getCurrentPlan } = useSubscription()
  const [isVisible, setIsVisible] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  const currentPlan = getCurrentPlan()
  const isFreePlan = !currentPlan || currentPlan.slug === 'free'

  useEffect(() => {
    if (user?.created_at) {
      const userCreatedAt = new Date(user.created_at)
      const now = new Date()
      const timeDiff = now.getTime() - userCreatedAt.getTime()
      const recentSignup = timeDiff < 86400000 // 24 hours
      
      setIsNewUser(recentSignup)
      
      // Check if user has already dismissed this banner
      const dismissed = localStorage.getItem(`welcome-banner-dismissed-${user.id}`)
      setIsVisible(recentSignup && !dismissed)
    }
  }, [user])

  const handleDismiss = () => {
    setIsVisible(false)
    if (user?.id) {
      localStorage.setItem(`welcome-banner-dismissed-${user.id}`, 'true')
    }
  }

  if (!isVisible || !isNewUser) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Welcome to Churnaizer! 🎉
                </h3>
                <Badge variant="secondary" className="text-xs">
                  New User
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                You're all set up and ready to start preventing churn! Here's what you can do next:
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link to="/dashboard/csv-upload">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Upload Your First CSV
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/integration">
                    Set Up Integration
                  </Link>
                </Button>
                {isFreePlan && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard/upgrade">
                      View Plans
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

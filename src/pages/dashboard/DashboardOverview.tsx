
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { DashboardOverview as DashboardOverviewComponent } from '@/components/dashboard/DashboardOverview'

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <DashboardOverviewComponent />
    </div>
  )
}

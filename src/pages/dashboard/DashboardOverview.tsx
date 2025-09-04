
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { DashboardOverview as DashboardOverviewComponent } from '@/components/dashboard/DashboardOverview'
import { WeeklyReportCard } from '@/components/dashboard/WeeklyReportCard'
import { CreditUsageCard } from '@/components/dashboard/CreditUsageCard'

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      
      {/* New Dashboard Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyReportCard />
        <CreditUsageCard />
      </div>
      
      <DashboardOverviewComponent />
    </div>
  )
}

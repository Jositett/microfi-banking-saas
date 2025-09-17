import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { FinancialCharts } from "@/components/dashboard/financial-charts"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
            </div>

            <DashboardOverview />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentTransactions />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>

            <FinancialCharts />
          </div>
        </main>
      </div>
    </div>
  )
}

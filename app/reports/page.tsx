import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { ReportFilters } from "@/components/reports/report-filters"
import { FinancialReports } from "@/components/reports/financial-reports"
import { ExportReports } from "@/components/reports/export-reports"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                <p className="text-muted-foreground">Financial insights and detailed reports</p>
              </div>
            </div>

            <ReportsOverview />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <FinancialReports />
              </div>
              <div className="space-y-6">
                <ReportFilters />
                <ExportReports />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

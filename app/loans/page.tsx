import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { LoansList } from "@/components/loans/loans-list"
import { LoanActions } from "@/components/loans/loan-actions"
import { LoanCalculator } from "@/components/loans/loan-calculator"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function LoansPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Loans</h1>
                <p className="text-muted-foreground">Manage your loan applications and repayments</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Apply for Loan
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <LoansList />
                <LoanCalculator />
              </div>
              <div>
                <LoanActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

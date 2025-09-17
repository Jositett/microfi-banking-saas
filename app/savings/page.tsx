import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SavingsPlans } from "@/components/savings/savings-plans"
import { SavingsActions } from "@/components/savings/savings-actions"
import { SavingsHistory } from "@/components/savings/savings-history"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function SavingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Savings</h1>
                <p className="text-muted-foreground">Manage your savings plans and susu accounts</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Savings Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SavingsPlans />
                <SavingsHistory />
              </div>
              <div>
                <SavingsActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

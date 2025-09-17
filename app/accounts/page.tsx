import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { AccountsList } from "@/components/accounts/accounts-list"
import { AccountActions } from "@/components/accounts/account-actions"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@/components/ui/icons"

export default function AccountsPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
                <p className="text-muted-foreground">Manage your banking accounts</p>
              </div>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Open New Account
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AccountsList />
              </div>
              <div>
                <AccountActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

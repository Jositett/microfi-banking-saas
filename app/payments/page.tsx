import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { PaymentMethods } from "@/components/payments/payment-methods"
import { BillPayments } from "@/components/payments/bill-payments"
import { TransferMoney } from "@/components/payments/transfer-money"
import { PaymentHistory } from "@/components/payments/payment-history"

export default function PaymentsPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Payments</h1>
                <p className="text-muted-foreground">Send money, pay bills, and manage transactions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TransferMoney />
                  <BillPayments />
                </div>
                <PaymentHistory />
              </div>
              <div>
                <PaymentMethods />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

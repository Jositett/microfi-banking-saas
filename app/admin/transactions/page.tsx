"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"

const transactions = [
  {
    id: 1,
    transactionId: "TXN001234",
    type: "Transfer",
    fromAccount: "ACC001234",
    toAccount: "ACC001235",
    amount: 500,
    status: "Completed",
    date: "2024-01-15",
    customerName: "John Doe",
  },
  {
    id: 2,
    transactionId: "TXN001235",
    type: "Deposit",
    fromAccount: "External",
    toAccount: "ACC001234",
    amount: 3500,
    status: "Completed",
    date: "2024-01-14",
    customerName: "John Doe",
  },
  {
    id: 3,
    transactionId: "TXN001236",
    type: "Withdrawal",
    fromAccount: "ACC001235",
    toAccount: "External",
    amount: 200,
    status: "Pending",
    date: "2024-01-13",
    customerName: "Jane Smith",
  },
  {
    id: 4,
    transactionId: "TXN001237",
    type: "Payment",
    fromAccount: "ACC001236",
    toAccount: "Merchant",
    amount: 85,
    status: "Failed",
    date: "2024-01-12",
    customerName: "Michael Johnson",
  },
]

export default function AdminTransactionsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Transaction Monitoring</h1>
              <p className="text-muted-foreground">Monitor and manage all system transactions</p>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-green-600">+2 today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,285</div>
                  <p className="text-xs text-green-600">+15% this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-yellow-600">Requires review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-red-600">Needs attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Monitor system-wide transaction activity</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search transactions..." className="w-64" />
                    <Button variant="outline">
                      <Icons.Filter />
                      Filter
                    </Button>
                    <Button variant="outline">
                      <Icons.Download />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            transaction.status === "Completed"
                              ? "bg-green-100 text-green-600"
                              : transaction.status === "Pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "Transfer" ? (
                            <Icons.ArrowLeftRight />
                          ) : transaction.type === "Deposit" ? (
                            <Icons.ArrowDown />
                          ) : transaction.type === "Withdrawal" ? (
                            <Icons.ArrowUp />
                          ) : (
                            <Icons.CreditCard />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{transaction.transactionId}</h3>
                          <p className="text-sm text-muted-foreground">{transaction.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.type} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${transaction.amount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                          {transaction.fromAccount} → {transaction.toAccount}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            transaction.status === "Completed"
                              ? "secondary"
                              : transaction.status === "Pending"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icons.Eye />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

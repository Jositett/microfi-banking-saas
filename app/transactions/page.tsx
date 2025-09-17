"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"

const transactions = [
  {
    id: 1,
    type: "Transfer",
    description: "Transfer to Savings Account",
    amount: -500,
    date: "2024-01-15",
    status: "Completed",
    category: "Transfer",
  },
  {
    id: 2,
    type: "Deposit",
    description: "Salary Deposit",
    amount: 3500,
    date: "2024-01-14",
    status: "Completed",
    category: "Income",
  },
  {
    id: 3,
    type: "Payment",
    description: "Electricity Bill",
    amount: -120,
    date: "2024-01-13",
    status: "Completed",
    category: "Utilities",
  },
  {
    id: 4,
    type: "Purchase",
    description: "Online Shopping",
    amount: -85,
    date: "2024-01-12",
    status: "Completed",
    category: "Shopping",
  },
  {
    id: 5,
    type: "Transfer",
    description: "Money Transfer to John",
    amount: -200,
    date: "2024-01-11",
    status: "Pending",
    category: "Transfer",
  },
]

export default function TransactionsPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
              <p className="text-muted-foreground">View and manage all your transactions</p>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+$3,500</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">-$905</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,595</div>
                  <p className="text-xs text-green-600">+15% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Transaction pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest financial activities</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search transactions..." className="w-64" />
                    <Button variant="outline">
                      <Icons.Filter />
                      Filter
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
                            transaction.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? <Icons.ArrowDown /> : <Icons.ArrowUp />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{transaction.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.type} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <Badge variant={transaction.status === "Completed" ? "secondary" : "default"}>
                          {transaction.status}
                        </Badge>
                      </div>
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

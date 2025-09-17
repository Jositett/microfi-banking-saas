"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"

const accounts = [
  {
    id: 1,
    accountNumber: "ACC001234",
    customerName: "John Doe",
    accountType: "Savings",
    balance: 15000,
    status: "Active",
    createdDate: "2023-06-15",
    lastActivity: "2024-01-15",
  },
  {
    id: 2,
    accountNumber: "ACC001235",
    customerName: "Jane Smith",
    accountType: "Current",
    balance: 8500,
    status: "Active",
    createdDate: "2023-08-22",
    lastActivity: "2024-01-14",
  },
  {
    id: 3,
    accountNumber: "ACC001236",
    customerName: "Michael Johnson",
    accountType: "Investment",
    balance: 45000,
    status: "Active",
    createdDate: "2023-04-10",
    lastActivity: "2024-01-13",
  },
  {
    id: 4,
    accountNumber: "ACC001237",
    customerName: "Sarah Wilson",
    accountType: "Savings",
    balance: 2300,
    status: "Suspended",
    createdDate: "2023-11-05",
    lastActivity: "2024-01-10",
  },
]

export default function AdminAccountsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Account Management</h1>
              <p className="text-muted-foreground">Monitor and manage all customer accounts</p>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-green-600">+1 this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">75% active rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$70,800</div>
                  <p className="text-xs text-green-600">+8% this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-red-600">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Accounts List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Accounts</CardTitle>
                    <CardDescription>Manage customer accounts and balances</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search accounts..." className="w-64" />
                    <Button variant="outline">
                      <Icons.Filter />
                      Filter
                    </Button>
                    <Button>
                      <Icons.Plus />
                      New Account
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icons.CreditCard />
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.accountNumber}</h3>
                          <p className="text-sm text-muted-foreground">{account.customerName}</p>
                          <p className="text-xs text-muted-foreground">Created: {account.createdDate}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${account.balance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={account.accountType === "Investment" ? "default" : "outline"}>
                          {account.accountType}
                        </Badge>
                        <Badge variant={account.status === "Active" ? "secondary" : "destructive"}>
                          {account.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Last Activity</p>
                        <p className="text-xs">{account.lastActivity}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icons.Settings />
                        Manage
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

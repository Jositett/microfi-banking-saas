"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"

const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+233 24 123 4567",
    accountType: "Premium",
    balance: 15000,
    status: "Active",
    joinDate: "2023-06-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+233 24 234 5678",
    accountType: "Standard",
    balance: 8500,
    status: "Active",
    joinDate: "2023-08-22",
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael.j@example.com",
    phone: "+233 24 345 6789",
    accountType: "Business",
    balance: 45000,
    status: "Active",
    joinDate: "2023-04-10",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    phone: "+233 24 456 7890",
    accountType: "Standard",
    balance: 2300,
    status: "Inactive",
    joinDate: "2023-11-05",
  },
]

export default function CustomersPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
              <p className="text-muted-foreground">Manage your customer relationships and accounts</p>
            </div>

            {/* Customer Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-green-600">+2 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
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
                  <p className="text-xs text-green-600">+12% growth</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Premium Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">50% premium rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Customers List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customer Directory</CardTitle>
                    <CardDescription>Manage customer accounts and relationships</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search customers..." className="w-64" />
                    <Button>
                      <Icons.Plus />
                      Add Customer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icons.User />
                        </div>
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${customer.balance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Account Balance</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            customer.accountType === "Premium"
                              ? "default"
                              : customer.accountType === "Business"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {customer.accountType}
                        </Badge>
                        <Badge variant={customer.status === "Active" ? "secondary" : "destructive"}>
                          {customer.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="text-xs">{customer.joinDate}</p>
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

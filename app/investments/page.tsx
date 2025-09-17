"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/ui/icons"

const investments = [
  {
    id: 1,
    name: "Tech Growth Fund",
    type: "Mutual Fund",
    amount: 15000,
    returns: 12.5,
    status: "Active",
    risk: "Medium",
  },
  {
    id: 2,
    name: "Government Bonds",
    type: "Bonds",
    amount: 25000,
    returns: 6.8,
    status: "Active",
    risk: "Low",
  },
  {
    id: 3,
    name: "Real Estate REIT",
    type: "REIT",
    amount: 8000,
    returns: 9.2,
    status: "Active",
    risk: "Medium",
  },
]

export default function InvestmentsPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
              <p className="text-muted-foreground">Manage your investments and track performance</p>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$48,000</div>
                  <p className="text-xs text-green-600">+8.2% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,320</div>
                  <p className="text-xs text-green-600">+12.5% YTD</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Across 3 categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Medium</div>
                  <p className="text-xs text-muted-foreground">Balanced portfolio</p>
                </CardContent>
              </Card>
            </div>

            {/* Investments List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Investments</CardTitle>
                    <CardDescription>Track and manage your investment portfolio</CardDescription>
                  </div>
                  <Button>
                    <Icons.Plus />
                    New Investment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icons.TrendingUp />
                        </div>
                        <div>
                          <h3 className="font-semibold">{investment.name}</h3>
                          <p className="text-sm text-muted-foreground">{investment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${investment.amount.toLocaleString()}</div>
                        <div className="text-sm text-green-600">+{investment.returns}%</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            investment.risk === "Low"
                              ? "secondary"
                              : investment.risk === "Medium"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {investment.risk} Risk
                        </Badge>
                        <Badge variant="outline">{investment.status}</Badge>
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

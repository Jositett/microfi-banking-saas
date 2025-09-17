"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

const reports = [
  {
    title: "Daily Transaction Report",
    description: "Summary of all transactions for today",
    lastGenerated: "2024-01-15 09:00 AM",
    type: "Daily",
  },
  {
    title: "Weekly Financial Summary",
    description: "Weekly overview of financial activities",
    lastGenerated: "2024-01-14 06:00 PM",
    type: "Weekly",
  },
  {
    title: "Monthly Account Analysis",
    description: "Monthly analysis of account performance",
    lastGenerated: "2024-01-01 12:00 PM",
    type: "Monthly",
  },
  {
    title: "Compliance Report",
    description: "Regulatory compliance and audit report",
    lastGenerated: "2024-01-10 02:00 PM",
    type: "Compliance",
  },
]

export default function AdminReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground">Generate and manage system reports</p>
            </div>

            {/* Report Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">Available reports</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-green-600">Daily report ready</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Auto-generated</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4GB</div>
                  <p className="text-xs text-muted-foreground">Report storage</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Generate reports and perform common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col">
                    <Icons.FileText />
                    <span className="mt-2">Generate Daily Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Icons.BarChart3 />
                    <span className="mt-2">Financial Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Icons.Shield />
                    <span className="mt-2">Compliance Check</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Reports</CardTitle>
                    <CardDescription>Manage and generate system reports</CardDescription>
                  </div>
                  <Button>
                    <Icons.Plus />
                    Create Custom Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icons.FileText />
                        </div>
                        <div>
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <p className="text-xs text-muted-foreground">Last generated: {report.lastGenerated}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Icons.Download />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icons.RefreshCw />
                          Generate
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icons.Settings />
                          Configure
                        </Button>
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

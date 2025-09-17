"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/ui/icons"

const alerts = [
  {
    id: 1,
    title: "High Transaction Volume",
    description: "Unusual transaction activity detected on account ACC001236",
    severity: "High",
    timestamp: "2024-01-15 14:30:00",
    status: "Active",
    type: "Security",
  },
  {
    id: 2,
    title: "Failed Login Attempts",
    description: "Multiple failed login attempts from IP 192.168.1.200",
    severity: "Medium",
    timestamp: "2024-01-15 14:25:00",
    status: "Active",
    type: "Security",
  },
  {
    id: 3,
    title: "System Performance",
    description: "Database response time exceeding threshold",
    severity: "Low",
    timestamp: "2024-01-15 14:15:00",
    status: "Resolved",
    type: "Performance",
  },
  {
    id: 4,
    title: "Compliance Check",
    description: "Monthly compliance report requires review",
    severity: "Medium",
    timestamp: "2024-01-15 09:00:00",
    status: "Pending",
    type: "Compliance",
  },
]

export default function AdminAlertsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">System Alerts</h1>
              <p className="text-muted-foreground">Monitor and manage system alerts and notifications</p>
            </div>

            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <p className="text-xs text-red-600">Immediate attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-yellow-600">Requires action</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <p className="text-xs text-green-600">Successfully handled</p>
                </CardContent>
              </Card>
            </div>

            {/* Alert Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Alert Management</CardTitle>
                <CardDescription>Quick actions for alert management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button>
                    <Icons.AlertTriangle />
                    Create Alert
                  </Button>
                  <Button variant="outline">
                    <Icons.Settings />
                    Configure Rules
                  </Button>
                  <Button variant="outline">
                    <Icons.Bell />
                    Notification Settings
                  </Button>
                  <Button variant="outline">
                    <Icons.Archive />
                    Archive Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Alerts</CardTitle>
                    <CardDescription>System alerts requiring attention</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Icons.RefreshCw />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            alert.severity === "High"
                              ? "bg-red-100 text-red-600"
                              : alert.severity === "Medium"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <Icons.AlertTriangle />
                        </div>
                        <div>
                          <h3 className="font-semibold">{alert.title}</h3>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            alert.type === "Security"
                              ? "destructive"
                              : alert.type === "Performance"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {alert.type}
                        </Badge>
                        <Badge
                          variant={
                            alert.severity === "High"
                              ? "destructive"
                              : alert.severity === "Medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <Badge
                          variant={
                            alert.status === "Active"
                              ? "default"
                              : alert.status === "Resolved"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Icons.Eye />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icons.Check />
                          Resolve
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

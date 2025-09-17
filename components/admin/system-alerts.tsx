import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Database, Server, X } from "lucide-react"

const alerts = [
  {
    id: "1",
    type: "security",
    title: "Multiple Failed Logins",
    description: "User account locked after 5 failed attempts",
    severity: "high",
    time: "5 minutes ago",
    icon: Shield,
  },
  {
    id: "2",
    type: "system",
    title: "Database Connection Slow",
    description: "Response time above threshold",
    severity: "medium",
    time: "15 minutes ago",
    icon: Database,
  },
  {
    id: "3",
    type: "maintenance",
    title: "Scheduled Maintenance",
    description: "System maintenance in 2 hours",
    severity: "low",
    time: "1 hour ago",
    icon: Server,
  },
  {
    id: "4",
    type: "security",
    title: "Suspicious Transaction",
    description: "Large transfer flagged for review",
    severity: "high",
    time: "2 hours ago",
    icon: AlertTriangle,
  },
]

export function SystemAlerts() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getIconColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
        <CardDescription>Important notifications requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <alert.icon className={`h-4 w-4 ${getIconColor(alert.severity)}`} />
                  <h4 className="text-sm font-medium">{alert.title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                  <Button variant="ghost" size="sm">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{alert.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{alert.time}</span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button variant="outline" className="w-full bg-transparent">
            View All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

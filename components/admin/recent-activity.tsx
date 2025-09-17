import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, CreditCard, AlertTriangle, Settings, Shield } from "lucide-react"

const activities = [
  {
    id: "1",
    type: "user_registration",
    user: "John Doe",
    email: "john.doe@example.com",
    action: "New user registration",
    time: "2 minutes ago",
    icon: UserPlus,
    status: "success",
  },
  {
    id: "2",
    type: "account_creation",
    user: "Jane Smith",
    email: "jane.smith@example.com",
    action: "Created business account",
    time: "15 minutes ago",
    icon: CreditCard,
    status: "success",
  },
  {
    id: "3",
    type: "security_alert",
    user: "System",
    email: "system@microfi.com",
    action: "Failed login attempts detected",
    time: "1 hour ago",
    icon: AlertTriangle,
    status: "warning",
  },
  {
    id: "4",
    type: "admin_action",
    user: "Admin User",
    email: "admin@microfi.com",
    action: "Updated system settings",
    time: "2 hours ago",
    icon: Settings,
    status: "info",
  },
  {
    id: "5",
    type: "role_change",
    user: "Mike Johnson",
    email: "mike.johnson@example.com",
    action: "Role changed to Teller",
    time: "3 hours ago",
    icon: Shield,
    status: "info",
  },
]

export function RecentActivity() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getIconColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system activities and user actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className={`p-2 rounded-full bg-muted ${getIconColor(activity.status)}`}>
                <activity.icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{activity.action}</p>
                  <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src="/placeholder.svg?key=user" alt={activity.user} />
                      <AvatarFallback className="text-xs">
                        {activity.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.email}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

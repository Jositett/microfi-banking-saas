import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Shield, Settings } from "lucide-react"

const quickActions = [
  {
    name: "Add New User",
    description: "Create user account",
    icon: UserPlus,
    color: "bg-blue-500",
  },
  {
    name: "Bulk Import",
    description: "Import from CSV",
    icon: Users,
    color: "bg-green-500",
  },
  {
    name: "Role Management",
    description: "Manage permissions",
    icon: Shield,
    color: "bg-purple-500",
  },
  {
    name: "User Settings",
    description: "Global user settings",
    icon: Settings,
    color: "bg-gray-500",
  },
]

export function UserActions() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common user management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                variant="outline"
                className="w-full h-auto p-4 flex items-center space-x-3 hover:bg-accent bg-transparent"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">{action.name}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-medium">12,543</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="font-medium">11,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">New This Month</span>
              <span className="font-medium text-green-600">+234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Suspended</span>
              <span className="font-medium text-red-600">45</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Customers</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">80%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Business</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-1/5 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tellers</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-1/20 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">4%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Admins</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-1/100 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">1%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

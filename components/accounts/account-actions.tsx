import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Download, Settings, CreditCard, PiggyBank, Building, Users } from "lucide-react"

const accountTypes = [
  {
    name: "Personal Account",
    description: "Individual banking account",
    icon: CreditCard,
    color: "bg-blue-500",
  },
  {
    name: "Savings Account",
    description: "High-yield savings",
    icon: PiggyBank,
    color: "bg-green-500",
  },
  {
    name: "Business Account",
    description: "For business operations",
    icon: Building,
    color: "bg-purple-500",
  },
  {
    name: "Group Account",
    description: "Joint account with signatories",
    icon: Users,
    color: "bg-orange-500",
  },
]

const quickActions = [
  {
    name: "Transfer Money",
    description: "Between accounts",
    icon: ArrowRightLeft,
    color: "bg-blue-500",
  },
  {
    name: "Download Statement",
    description: "Account statements",
    icon: Download,
    color: "bg-gray-500",
  },
  {
    name: "Account Settings",
    description: "Manage preferences",
    icon: Settings,
    color: "bg-indigo-500",
  },
]

export function AccountActions() {
  return (
    <div className="space-y-6">
      {/* Open New Account */}
      <Card>
        <CardHeader>
          <CardTitle>Open New Account</CardTitle>
          <CardDescription>Choose the type of account you want to open</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accountTypes.map((type) => (
              <Button
                key={type.name}
                variant="outline"
                className="w-full h-auto p-4 flex items-center space-x-3 hover:bg-accent bg-transparent"
              >
                <div className={`p-2 rounded-lg ${type.color}`}>
                  <type.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">{type.name}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common account operations</CardDescription>
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

      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Accounts</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Accounts</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Balance</span>
              <span className="font-medium">₵93,135.67</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monthly Growth</span>
              <span className="font-medium text-green-600">+12.5%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

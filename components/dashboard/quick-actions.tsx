import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Download, Plus, CreditCard, Smartphone, Receipt } from "lucide-react"

const actions = [
  {
    title: "Transfer Money",
    description: "Send money to accounts",
    icon: Send,
    color: "bg-blue-500",
  },
  {
    title: "Mobile Money",
    description: "MTN, Vodafone, AirtelTigo",
    icon: Smartphone,
    color: "bg-green-500",
  },
  {
    title: "Pay Bills",
    description: "Utilities & services",
    icon: Receipt,
    color: "bg-orange-500",
  },
  {
    title: "Request Loan",
    description: "Quick loan application",
    icon: CreditCard,
    color: "bg-purple-500",
  },
  {
    title: "Add Savings",
    description: "Create savings plan",
    icon: Plus,
    color: "bg-teal-500",
  },
  {
    title: "Download Statement",
    description: "Get account statement",
    icon: Download,
    color: "bg-gray-500",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used banking services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent bg-transparent"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

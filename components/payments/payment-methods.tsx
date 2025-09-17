import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, CreditCard, Building, Wallet, Plus } from "lucide-react"

const paymentMethods = [
  {
    id: "1",
    name: "MTN Mobile Money",
    type: "mobile_money",
    provider: "MTN",
    number: "**** **** 1234",
    status: "active",
    icon: Smartphone,
    color: "bg-yellow-500",
  },
  {
    id: "2",
    name: "Vodafone Cash",
    type: "mobile_money",
    provider: "Vodafone",
    number: "**** **** 5678",
    status: "active",
    icon: Smartphone,
    color: "bg-red-500",
  },
  {
    id: "3",
    name: "Visa Card",
    type: "card",
    provider: "Visa",
    number: "**** **** **** 9012",
    status: "active",
    icon: CreditCard,
    color: "bg-blue-500",
  },
  {
    id: "4",
    name: "Bank Transfer",
    type: "bank",
    provider: "GCB Bank",
    number: "ACC-****3456",
    status: "active",
    icon: Building,
    color: "bg-green-500",
  },
]

export function PaymentMethods() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Your connected payment options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${method.color}`}>
                    <method.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.number}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(method.status)}>{method.status}</Badge>
              </div>
            ))}

            <Button variant="outline" className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium">₵12,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Transactions</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Failed</span>
              <span className="font-medium text-red-600">2</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All transactions are encrypted and protected by bank-level security
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

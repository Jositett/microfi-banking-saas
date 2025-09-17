import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Home, Building, AlertCircle } from "lucide-react"

const loanTypes = [
  {
    name: "Personal Loan",
    description: "For personal expenses",
    icon: CreditCard,
    color: "bg-blue-500",
    rate: "15.5% - 18.0%",
    maxAmount: "₵50,000",
  },
  {
    name: "Business Loan",
    description: "For business growth",
    icon: Building,
    color: "bg-purple-500",
    rate: "12.0% - 15.0%",
    maxAmount: "₵500,000",
  },
  {
    name: "Mortgage Loan",
    description: "For property purchase",
    icon: Home,
    color: "bg-green-500",
    rate: "10.0% - 12.5%",
    maxAmount: "₵2,000,000",
  },
  {
    name: "Emergency Loan",
    description: "Quick cash for emergencies",
    icon: AlertCircle,
    color: "bg-red-500",
    rate: "18.0% - 22.0%",
    maxAmount: "₵20,000",
  },
]

export function LoanActions() {
  return (
    <div className="space-y-6">
      {/* Apply for Loan */}
      <Card>
        <CardHeader>
          <CardTitle>Apply for Loan</CardTitle>
          <CardDescription>Choose the type of loan you need</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loanTypes.map((type) => (
              <Button
                key={type.name}
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent bg-transparent"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <type.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </div>
                <div className="w-full text-left text-xs text-muted-foreground">
                  <div>Rate: {type.rate}</div>
                  <div>Max: {type.maxAmount}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loan Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Loans</span>
              <span className="font-medium">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Outstanding</span>
              <span className="font-medium">₵26,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monthly Payments</span>
              <span className="font-medium">₵1,300</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Credit Score</span>
              <span className="font-medium text-green-600">750 (Good)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Reminder */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Payment Due Soon</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Personal Loan payment of ₵450 due on Feb 1, 2024</p>
            </div>
            <Button className="w-full" size="sm">
              Make Payment Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

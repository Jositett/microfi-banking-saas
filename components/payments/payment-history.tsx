import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, Receipt, Send, Search } from "lucide-react"

const paymentHistory = [
  {
    id: "1",
    type: "transfer",
    description: "Transfer to John Doe",
    amount: 500.0,
    status: "completed",
    method: "Bank Transfer",
    date: "2024-01-20",
    reference: "TXN001234567",
  },
  {
    id: "2",
    type: "bill",
    description: "ECG Electricity Bill",
    amount: 120.5,
    status: "completed",
    method: "MTN MoMo",
    date: "2024-01-19",
    reference: "BILL001234",
  },
  {
    id: "3",
    type: "transfer",
    description: "Mobile Money to 024XXXXXXX",
    amount: 200.0,
    status: "pending",
    method: "Vodafone Cash",
    date: "2024-01-19",
    reference: "TXN001234568",
  },
  {
    id: "4",
    type: "bill",
    description: "DSTV Subscription",
    amount: 89.0,
    status: "completed",
    method: "Debit Card",
    date: "2024-01-18",
    reference: "BILL001235",
  },
  {
    id: "5",
    type: "transfer",
    description: "Transfer to Business Account",
    amount: 1000.0,
    status: "failed",
    method: "Internal Transfer",
    date: "2024-01-18",
    reference: "TXN001234569",
  },
]

export function PaymentHistory() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return Send
      case "bill":
        return Receipt
      default:
        return ArrowUpRight
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Your recent payment transactions</CardDescription>

        {/* Filters */}
        <div className="flex items-center space-x-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search payments..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="bill">Bill Payments</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentHistory.map((payment) => {
            const TypeIcon = getTypeIcon(payment.type)

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TypeIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{payment.description}</p>
                      <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{payment.method}</span>
                      <span>•</span>
                      <span>{new Date(payment.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{payment.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">₵{payment.amount.toFixed(2)}</p>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View Details
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Button variant="outline">Load More Transactions</Button>
        </div>
      </CardContent>
    </Card>
  )
}

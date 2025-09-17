import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Plus, Minus } from "lucide-react"

const savingsHistory = [
  {
    id: "1",
    type: "contribution",
    amount: 500,
    plan: "Emergency Fund",
    date: "2024-01-15",
    status: "completed",
    description: "Monthly contribution",
  },
  {
    id: "2",
    type: "interest",
    amount: 45.5,
    plan: "House Down Payment",
    date: "2024-01-10",
    status: "completed",
    description: "Monthly interest payment",
  },
  {
    id: "3",
    type: "contribution",
    amount: 200,
    plan: "Vacation Susu",
    date: "2024-01-08",
    status: "completed",
    description: "Weekly susu contribution",
  },
  {
    id: "4",
    type: "withdrawal",
    amount: 1000,
    plan: "Education Fund",
    date: "2024-01-05",
    status: "completed",
    description: "Partial withdrawal",
  },
  {
    id: "5",
    type: "contribution",
    amount: 1000,
    plan: "House Down Payment",
    date: "2024-01-01",
    status: "completed",
    description: "Monthly contribution",
  },
]

export function SavingsHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest savings transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savingsHistory.map((transaction) => (
            <div key={transaction.id} className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-full ${
                  transaction.type === "contribution" || transaction.type === "interest"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {transaction.type === "contribution" ? (
                  <Plus className="h-4 w-4" />
                ) : transaction.type === "interest" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
                  <p
                    className={`text-sm font-medium ${
                      transaction.type === "contribution" || transaction.type === "interest"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "contribution" || transaction.type === "interest" ? "+" : "-"}₵
                    {transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{transaction.plan}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="text-xs">
                      {transaction.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

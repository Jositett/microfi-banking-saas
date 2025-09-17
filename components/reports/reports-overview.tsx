import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, PieChart } from "lucide-react"

const metrics = [
  {
    title: "Total Revenue",
    value: "₵2,456,789",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "This month",
  },
  {
    title: "Active Users",
    value: "12,543",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: Users,
    description: "Monthly active users",
  },
  {
    title: "Transaction Volume",
    value: "45,678",
    change: "+15.3%",
    changeType: "positive" as const,
    icon: CreditCard,
    description: "Total transactions",
  },
  {
    title: "Profit Margin",
    value: "23.4%",
    change: "-2.1%",
    changeType: "negative" as const,
    icon: PieChart,
    description: "Net profit margin",
  },
]

export function ReportsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metric.changeType === "positive" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={metric.changeType === "positive" ? "text-green-500" : "text-red-500"}>
                {metric.change}
              </span>
              <span>from last month</span>
            </div>
            <CardDescription className="mt-2">{metric.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

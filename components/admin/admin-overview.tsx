import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "12,543",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: Users,
    description: "Active registered users",
  },
  {
    title: "Total Accounts",
    value: "18,234",
    change: "+12.1%",
    changeType: "positive" as const,
    icon: CreditCard,
    description: "All account types",
  },
  {
    title: "Transaction Volume",
    value: "₵2.4M",
    change: "+15.3%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "This month",
  },
  {
    title: "System Alerts",
    value: "23",
    change: "-5.2%",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "Requires attention",
  },
]

export function AdminOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {stat.changeType === "positive" ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={stat.changeType === "positive" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
              <span>from last month</span>
            </div>
            <CardDescription className="mt-2">{stat.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

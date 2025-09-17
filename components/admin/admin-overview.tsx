"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface OverviewData {
  users: { total: number; change: string }
  accounts: { total: number; change: string }
  transactionVolume: { total: number; change: string }
  alerts: { total: number; change: string }
}

export function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://127.0.0.1:8787/api/admin/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Users",
      value: data?.users.total.toLocaleString() || "0",
      change: data?.users.change || "+0%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active registered users",
    },
    {
      title: "Total Accounts",
      value: data?.accounts.total.toLocaleString() || "0",
      change: data?.accounts.change || "+0%",
      changeType: "positive" as const,
      icon: CreditCard,
      description: "All account types",
    },
    {
      title: "Transaction Volume",
      value: `₵${(data?.transactionVolume.total || 0).toLocaleString()}`,
      change: data?.transactionVolume.change || "+0%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "This month",
    },
    {
      title: "System Alerts",
      value: data?.alerts.total.toString() || "0",
      change: data?.alerts.change || "0%",
      changeType: data?.alerts.change.startsWith('-') ? "negative" as const : "positive" as const,
      icon: AlertTriangle,
      description: "Requires attention",
    },
  ]

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

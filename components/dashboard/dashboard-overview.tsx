"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wallet, PiggyBank, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useState, useEffect } from "react"

interface UserData {
  accounts: Array<{
    balance: number
    type: string
  }>
  savings: Array<{
    currentAmount: number
    targetAmount: number
  }>
  loans: Array<{
    balance: number
  }>
}

export function DashboardOverview() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("microfi_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserData(user)
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!userData) {
    return <div>No user data available</div>
  }

  const totalBalance = userData.accounts?.reduce((sum, account) => sum + account.balance, 0) || 0
  const totalSavings = userData.savings?.reduce((sum, saving) => sum + saving.currentAmount, 0) || 0
  const totalLoans = userData.loans?.reduce((sum, loan) => sum + loan.balance, 0) || 0
  const savingsTarget = userData.savings?.reduce((sum, saving) => sum + saving.targetAmount, 0) || 1
  const savingsProgress = savingsTarget > 0 ? (totalSavings / savingsTarget) * 100 : 0

  const stats = [
    {
      title: "Total Balance",
      value: `₵${totalBalance.toLocaleString()}`,
      change: "+20.1%",
      changeType: "positive" as const,
      icon: Wallet,
      description: "Across all accounts",
    },
    {
      title: "Savings",
      value: `₵${totalSavings.toLocaleString()}`,
      change: "+15.3%",
      changeType: "positive" as const,
      icon: PiggyBank,
      description: `Target progress: ${savingsProgress.toFixed(0)}%`,
    },
    {
      title: "Investments",
      value: "₵8,945.67",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Portfolio performance",
    },
    {
      title: "Active Loans",
      value: `₵${totalLoans.toLocaleString()}`,
      change: "-5.2%",
      changeType: "negative" as const,
      icon: CreditCard,
      description: "Outstanding balance",
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
            {stat.title === "Savings" && <Progress value={savingsProgress} className="mt-2" />}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

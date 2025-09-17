"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Smartphone, CreditCard, Building } from "lucide-react"
import { useState, useEffect } from "react"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  date: string
  status: string
  accountId: string
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTransactions = () => {
      try {
        const storedUser = localStorage.getItem("microfi_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setTransactions(user.transactions || [])
        }
      } catch (error) {
        console.error("Failed to load transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const getTransactionIcon = (description: string) => {
    if (description.toLowerCase().includes("mobile") || description.toLowerCase().includes("mtn")) {
      return Smartphone
    }
    if (description.toLowerCase().includes("card") || description.toLowerCase().includes("visa")) {
      return CreditCard
    }
    return Building
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest account activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No transactions found</p>
          ) : (
            transactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction.description)

              return (
                <div key={transaction.id} className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
                      <p
                        className={`text-sm font-medium ${
                          transaction.type === "credit" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}₵{transaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Account: {transaction.accountId}</p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={transaction.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

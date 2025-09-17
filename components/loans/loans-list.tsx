"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

interface Loan {
  id: string
  type: string
  amount: number
  balance: number
  interestRate: number
  monthlyPayment: number
  startDate: string
  endDate: string
  status: string
}

export function LoansList() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLoans = () => {
      try {
        const storedUser = localStorage.getItem("microfi_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setLoans(user.loans || [])
        }
      } catch (error) {
        console.error("Failed to load loans:", error)
      } finally {
        setLoading(false)
      }
    }

    loadLoans()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "personal":
        return "bg-blue-100 text-blue-800"
      case "business":
        return "bg-purple-100 text-purple-800"
      case "emergency":
        return "bg-red-100 text-red-800"
      case "mortgage":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Loans</CardTitle>
          <CardDescription>Track your loan balances and payment schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded w-full"></div>
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
        <CardTitle>Your Loans</CardTitle>
        <CardDescription>Track your loan balances and payment schedules</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loans.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No active loans</p>
          ) : (
            loans.map((loan) => {
              const paidAmount = loan.amount - loan.balance
              const progress = (paidAmount / loan.amount) * 100
              const nextPaymentDate = new Date()
              nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

              return (
                <div key={loan.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} Loan</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTypeColor(loan.type)}>{loan.type}</Badge>
                          <Badge className={getStatusColor(loan.status)}>{loan.status}</Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Make Payment</DropdownMenuItem>
                        <DropdownMenuItem>Payment History</DropdownMenuItem>
                        <DropdownMenuItem>Download Statement</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal Amount</p>
                      <p className="font-semibold">₵{loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Balance</p>
                      <p className="font-semibold">₵{loan.balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Payment</p>
                      <p className="font-semibold">₵{loan.monthlyPayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">{loan.interestRate}% p.a.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Repayment Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₵{paidAmount.toLocaleString()} paid</span>
                      {loan.status === "active" && <span>Next payment: {nextPaymentDate.toLocaleDateString()}</span>}
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

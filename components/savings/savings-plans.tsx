"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PiggyBank, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

interface SavingsPlan {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  startDate: string
  endDate: string
  status: string
}

export function SavingsPlans() {
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSavingsPlans = () => {
      try {
        const storedUser = localStorage.getItem("microfi_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setSavingsPlans(user.savings || [])
        }
      } catch (error) {
        console.error("Failed to load savings plans:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSavingsPlans()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fixed":
        return "bg-purple-100 text-purple-800"
      case "flexible":
        return "bg-blue-100 text-blue-800"
      case "susu":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Savings Plans</CardTitle>
          <CardDescription>Track your savings goals and susu contributions</CardDescription>
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
        <CardTitle>Your Savings Plans</CardTitle>
        <CardDescription>Track your savings goals and susu contributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {savingsPlans.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No savings plans found</p>
          ) : (
            savingsPlans.map((plan) => {
              const progress = (plan.currentAmount / plan.targetAmount) * 100
              const remainingAmount = plan.targetAmount - plan.currentAmount

              return (
                <div key={plan.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <PiggyBank className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTypeColor("flexible")}>flexible</Badge>
                          <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
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
                        <DropdownMenuItem>Make Contribution</DropdownMenuItem>
                        <DropdownMenuItem>Edit Plan</DropdownMenuItem>
                        <DropdownMenuItem>Pause Plan</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Amount</p>
                      <p className="font-semibold">₵{plan.currentAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Amount</p>
                      <p className="font-semibold">₵{plan.targetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Contribution</p>
                      <p className="font-semibold">₵{plan.monthlyContribution.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">8.5% p.a.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₵{remainingAmount.toLocaleString()} remaining</span>
                      <span>Due: {new Date(plan.endDate).toLocaleDateString()}</span>
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

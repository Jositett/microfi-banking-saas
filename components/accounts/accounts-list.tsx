"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, Building, Users, CreditCard, Eye, EyeOff, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  accountNumber: string
  status: string
}

export function AccountsList() {
  const [showBalances, setShowBalances] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAccounts = () => {
      try {
        const storedUser = localStorage.getItem("microfi_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setAccounts(user.accounts || [])
        }
      } catch (error) {
        console.error("Failed to load accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [])

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "business":
        return Building
      case "group":
        return Users
      case "investment":
        return CreditCard
      default:
        return Wallet
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "frozen":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "savings":
        return "bg-blue-100 text-blue-800"
      case "business":
        return "bg-purple-100 text-purple-800"
      case "current":
        return "bg-orange-100 text-orange-800"
      case "investment":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>All your banking accounts in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>All your banking accounts in one place</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowBalances(!showBalances)}>
            {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No accounts found</p>
          ) : (
            accounts.map((account) => {
              const IconComponent = getAccountIcon(account.type)

              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{account.name}</h3>
                        <Badge className={getTypeColor(account.type)}>{account.type}</Badge>
                        <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{account.type} account</p>
                      <p className="text-xs text-muted-foreground">Account: ****{account.accountNumber.slice(-4)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{showBalances ? `₵${account.balance.toLocaleString()}` : "****"}</p>
                      <p className="text-xs text-muted-foreground">Available Balance</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Transfer Funds</DropdownMenuItem>
                        <DropdownMenuItem>Download Statement</DropdownMenuItem>
                        <DropdownMenuItem>Account Settings</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { SecureTransfer } from "@/components/dashboard/secure-transfer"
import { MultiGatewayPayment } from "@/components/payments/multi-gateway-payment"
import { CrossBrowserWebAuthn } from "@/components/webauthn/cross-browser-webauthn"
import { secureApi } from "@/lib/secure-api"

interface Account {
  id: string
  accountNumber: string
  type: string
  balance: number
  currency: string
  status: string
}

interface Transaction {
  id: string
  amount: number
  currency: string
  type: string
  description: string
  timestamp: string
  status: string
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("microfi_user")
    
    if (!token || !userData) {
      // Redirect to login if not authenticated
      window.location.href = "/"
      return
    }
    
    setUser(JSON.parse(userData))
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [accountsData, transactionsData] = await Promise.all([
        secureApi.getAccounts(),
        secureApi.getTransactions(10, 0)
      ])
      
      setAccounts((accountsData as any).accounts || [])
      setTransactions((transactionsData as any).transactions || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(balance)
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground">
              Secure banking with biometric authentication
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 text-green-500">
              <Icons.Shield />
            </div>
            MFA Protected
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <Icons.CreditCard />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">
                Across {accounts.length} accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <Icons.ArrowRight />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
              <div className="h-4 w-4 text-green-500">
                <Icons.Shield />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Secure</div>
              <p className="text-xs text-muted-foreground">
                WebAuthn MFA Active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>
              All accounts are protected with bank-level security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 text-primary-foreground">
                        <Icons.CreditCard />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{account.type} Account</p>
                      <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatBalance(account.balance)}</p>
                    <p className="text-sm text-muted-foreground">{account.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Secure Transfer */}
        <SecureTransfer 
          accounts={accounts} 
          onTransferComplete={loadDashboardData}
        />

        {/* Payment Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-5 w-5">
                <Icons.CreditCard />
              </div>
              Payment Integration
            </CardTitle>
            <CardDescription>
              Test Paystack payment integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultiGatewayPayment 
              onSuccess={(reference, amount, gateway) => {
                loadDashboardData();
              }}
            />
          </CardContent>
        </Card>

        {/* WebAuthn Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-5 w-5">
                <Icons.Shield />
              </div>
              WebAuthn Security
            </CardTitle>
            <CardDescription>
              Cross-browser biometric authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrossBrowserWebAuthn />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest banking activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <div className="w-5 h-5">
                        <Icons.ArrowRight />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || transaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatBalance(transaction.amount)}</p>
                    <p className="text-sm text-muted-foreground">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
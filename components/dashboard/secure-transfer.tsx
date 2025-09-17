"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/ui/icons"
import { TransactionMFA } from "@/components/auth/transaction-mfa"
import { secureApi } from "@/lib/secure-api"

interface Account {
  id: string
  accountNumber: string
  type: string
  balance: number
  currency: string
}

interface SecureTransferProps {
  accounts: Account[]
  onTransferComplete: () => void
}

export function SecureTransfer({ accounts, onTransferComplete }: SecureTransferProps) {
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMFA, setShowMFA] = useState(false)
  const [mfaData, setMfaData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedFromAccount = accounts.find(acc => acc.id === fromAccount)

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount) {
      setError("Please fill in all required fields")
      return
    }

    const transferAmount = parseFloat(amount)
    if (transferAmount <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    if (selectedFromAccount && transferAmount > selectedFromAccount.balance) {
      setError("Insufficient funds")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await secureApi.transfer(fromAccount, toAccount, transferAmount * 100, description) // Convert to kobo
      onTransferComplete()
      
      // Reset form
      setFromAccount("")
      setToAccount("")
      setAmount("")
      setDescription("")
      
    } catch (error: any) {
      if (error.message.includes('MFA')) {
        // This would be handled by the secure API client automatically
        setError("Transaction requires additional verification")
      } else {
        setError(error.message || "Transfer failed")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(balance)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Shield className="w-5 h-5" />
            Secure Transfer
          </CardTitle>
          <CardDescription>
            Transfer money between accounts with bank-level security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-account">From Account</Label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span>{account.type} - {account.accountNumber}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatBalance(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-account">To Account</Label>
              <Select value={toAccount} onValueChange={setToAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(acc => acc.id !== fromAccount).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span>{account.type} - {account.accountNumber}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatBalance(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (GHS)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {selectedFromAccount && (
              <p className="text-sm text-muted-foreground">
                Available: {formatBalance(selectedFromAccount.balance)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Transfer description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button 
            onClick={handleTransfer} 
            disabled={isProcessing || !fromAccount || !toAccount || !amount}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Transfer...
              </>
            ) : (
              <>
                <Icons.Shield className="w-4 h-4 mr-2" />
                Transfer Securely
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            <Icons.Shield className="w-3 h-3 inline mr-1" />
            High-value transfers may require biometric verification
          </div>
        </CardContent>
      </Card>

      {showMFA && mfaData && (
        <TransactionMFA
          challenge={mfaData.mfaChallenge}
          transactionId={mfaData.transactionId}
          transactionDetails={{
            type: 'Transfer',
            amount: parseFloat(amount) * 100,
            recipient: toAccount,
            description
          }}
          onVerified={(mfaResponse) => {
            setShowMFA(false)
            // MFA verification is handled by secure API client
          }}
          onCancel={() => {
            setShowMFA(false)
            setIsProcessing(false)
          }}
        />
      )}
    </>
  )
}
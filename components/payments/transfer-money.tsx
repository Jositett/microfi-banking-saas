"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

export function TransferMoney() {
  const [transferType, setTransferType] = useState("internal")
  const [isLoading, setIsLoading] = useState(false)

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate transfer process
    setTimeout(() => {
      setIsLoading(false)
      // Show success message
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Transfer Money</span>
        </CardTitle>
        <CardDescription>Send money to accounts or mobile wallets</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transferType">Transfer Type</Label>
            <Select value={transferType} onValueChange={setTransferType}>
              <SelectTrigger>
                <SelectValue placeholder="Select transfer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Transfer</SelectItem>
                <SelectItem value="external">External Bank</SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transferType === "internal" && (
            <div className="space-y-2">
              <Label htmlFor="toAccount">To Account</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account - ****1234</SelectItem>
                  <SelectItem value="business">Business Account - ****5678</SelectItem>
                  <SelectItem value="investment">Investment Account - ****9012</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {transferType === "external" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcb">GCB Bank</SelectItem>
                    <SelectItem value="ecobank">Ecobank</SelectItem>
                    <SelectItem value="absa">Absa Bank</SelectItem>
                    <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" placeholder="Enter account number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" placeholder="Enter account holder name" required />
              </div>
            </>
          )}

          {transferType === "mobile" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="provider">Mobile Money Provider</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                    <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input id="mobileNumber" placeholder="0XX XXX XXXX" required />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₵)</Label>
            <Input id="amount" type="number" placeholder="0.00" step="0.01" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" placeholder="What's this transfer for?" rows={2} />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Send Money"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

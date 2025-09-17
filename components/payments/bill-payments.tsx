"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Receipt, Zap, Droplets, Tv, Wifi } from "lucide-react"

const billCategories = [
  {
    name: "Electricity",
    icon: Zap,
    color: "bg-yellow-500",
    providers: ["ECG", "NEDCo", "Enclave Power"],
  },
  {
    name: "Water",
    icon: Droplets,
    color: "bg-blue-500",
    providers: ["Ghana Water Company", "Aqua Vitens Rand"],
  },
  {
    name: "Cable TV",
    icon: Tv,
    color: "bg-purple-500",
    providers: ["DSTV", "GOtv", "StarTimes"],
  },
  {
    name: "Internet",
    icon: Wifi,
    color: "bg-green-500",
    providers: ["MTN Fiber", "Vodafone Fiber", "AirtelTigo Fiber"],
  },
]

export function BillPayments() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate payment process
    setTimeout(() => {
      setIsLoading(false)
      // Show success message
    }, 2000)
  }

  const selectedCategoryData = billCategories.find((cat) => cat.name === selectedCategory)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Receipt className="h-5 w-5" />
          <span>Pay Bills</span>
        </CardTitle>
        <CardDescription>Pay utilities and services directly</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Bill Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                {billCategories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    <div className="flex items-center space-x-2">
                      <category.icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && selectedCategoryData && (
            <div className="space-y-2">
              <Label htmlFor="provider">Service Provider</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategoryData.providers.map((provider) => (
                    <SelectItem key={provider} value={provider.toLowerCase()}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account/Meter Number</Label>
            <Input id="accountNumber" placeholder="Enter your account or meter number" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₵)</Label>
            <Input id="amount" type="number" placeholder="0.00" step="0.01" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account">Bank Account</SelectItem>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                <SelectItem value="card">Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !selectedCategory}>
            {isLoading ? "Processing Payment..." : "Pay Bill"}
          </Button>
        </form>

        {/* Quick Bill Categories */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Quick Access</h4>
          <div className="grid grid-cols-2 gap-2">
            {billCategories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center space-y-1 bg-transparent"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className={`p-1 rounded ${category.color}`}>
                  <category.icon className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

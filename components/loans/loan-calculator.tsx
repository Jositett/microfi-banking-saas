"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("")
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)

  const calculateLoan = () => {
    const principal = Number.parseFloat(loanAmount)
    const rate = Number.parseFloat(interestRate) / 100 / 12
    const term = Number.parseFloat(loanTerm) * 12

    if (principal && rate && term) {
      const payment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
      const totalPaid = payment * term
      const interest = totalPaid - principal

      setMonthlyPayment(payment)
      setTotalInterest(interest)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Loan Calculator</span>
        </CardTitle>
        <CardDescription>Calculate your monthly payments and total interest</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount (₵)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter loan amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                placeholder="Enter interest rate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Loan Term (Years)</Label>
              <Input
                id="term"
                type="number"
                placeholder="Enter loan term"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </div>

            <Button onClick={calculateLoan} className="w-full">
              Calculate
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Calculation Results</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Payment</span>
                  <span className="font-medium">₵{monthlyPayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Interest</span>
                  <span className="font-medium">₵{totalInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="font-medium">
                    ₵{(monthlyPayment * Number.parseFloat(loanTerm || "0") * 12).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>* This is an estimate. Actual rates and terms may vary based on your credit profile and loan type.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { type NextRequest, NextResponse } from "next/server"

const DEMO_LOANS = {
  "1": [
    {
      id: "loan-1-001",
      type: "Personal Loan",
      amount: 15000.0,
      remainingBalance: 12500.0,
      interestRate: 8.5,
      monthlyPayment: 456.78,
      nextPaymentDate: "2024-02-01",
      status: "Active",
      term: 36,
      remainingTerm: 28,
      startDate: "2023-06-01",
    },
  ],
  "2": [
    {
      id: "loan-2-001",
      type: "Auto Loan",
      amount: 25000.0,
      remainingBalance: 18750.0,
      interestRate: 5.2,
      monthlyPayment: 625.0,
      nextPaymentDate: "2024-02-05",
      status: "Active",
      term: 48,
      remainingTerm: 36,
      startDate: "2023-02-01",
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "1"
    const loans = DEMO_LOANS[userId as keyof typeof DEMO_LOANS] || []

    return NextResponse.json({
      success: true,
      loans,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, amount, term, purpose } = await request.json()
    const userId = request.headers.get("x-user-id") || "1"

    // Calculate interest rate based on loan type
    const interestRates = {
      "Personal Loan": 8.5,
      "Auto Loan": 5.2,
      "Home Loan": 3.8,
      "Business Loan": 6.5,
    }

    const interestRate = interestRates[type as keyof typeof interestRates] || 8.0
    const monthlyPayment = (amount * (interestRate / 100 / 12)) / (1 - Math.pow(1 + interestRate / 100 / 12, -term))

    const newLoan = {
      id: `loan-${userId}-${Date.now()}`,
      type,
      amount: Number.parseFloat(amount),
      remainingBalance: Number.parseFloat(amount),
      interestRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending Approval",
      term: Number.parseInt(term),
      remainingTerm: Number.parseInt(term),
      startDate: new Date().toISOString().split("T")[0],
      purpose,
    }

    return NextResponse.json({
      success: true,
      loan: newLoan,
      message: "Loan application submitted successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create loan application" }, { status: 500 })
  }
}

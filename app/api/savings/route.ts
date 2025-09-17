import { type NextRequest, NextResponse } from "next/server"

const DEMO_SAVINGS = {
  "1": [
    {
      id: "sav-1-001",
      name: "Emergency Fund",
      targetAmount: 10000.0,
      currentAmount: 7500.0,
      monthlyContribution: 500.0,
      interestRate: 3.5,
      startDate: "2023-01-01",
      targetDate: "2024-06-01",
      status: "Active",
      autoDeposit: true,
    },
    {
      id: "sav-1-002",
      name: "Vacation Fund",
      targetAmount: 5000.0,
      currentAmount: 2800.0,
      monthlyContribution: 300.0,
      interestRate: 2.8,
      startDate: "2023-08-01",
      targetDate: "2024-12-01",
      status: "Active",
      autoDeposit: false,
    },
  ],
  "2": [
    {
      id: "sav-2-001",
      name: "House Down Payment",
      targetAmount: 50000.0,
      currentAmount: 15000.0,
      monthlyContribution: 1000.0,
      interestRate: 4.0,
      startDate: "2023-01-01",
      targetDate: "2026-01-01",
      status: "Active",
      autoDeposit: true,
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "1"
    const savings = DEMO_SAVINGS[userId as keyof typeof DEMO_SAVINGS] || []

    return NextResponse.json({
      success: true,
      savings,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch savings plans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, targetAmount, monthlyContribution, targetDate, autoDeposit } = await request.json()
    const userId = request.headers.get("x-user-id") || "1"

    const newSavingsPlan = {
      id: `sav-${userId}-${Date.now()}`,
      name,
      targetAmount: Number.parseFloat(targetAmount),
      currentAmount: 0,
      monthlyContribution: Number.parseFloat(monthlyContribution),
      interestRate: 3.5, // Default interest rate
      startDate: new Date().toISOString().split("T")[0],
      targetDate,
      status: "Active",
      autoDeposit: autoDeposit || false,
    }

    return NextResponse.json({
      success: true,
      savingsPlan: newSavingsPlan,
      message: "Savings plan created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create savings plan" }, { status: 500 })
  }
}

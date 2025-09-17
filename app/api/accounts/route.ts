import { type NextRequest, NextResponse } from "next/server"

const DEMO_ACCOUNTS = {
  "1": [
    {
      id: "acc-1-checking",
      type: "Checking",
      accountNumber: "****1234",
      balance: 15420.5,
      currency: "USD",
      status: "Active",
      interestRate: 0.01,
      openedDate: "2023-01-15",
    },
    {
      id: "acc-1-savings",
      type: "Savings",
      accountNumber: "****5678",
      balance: 25000.0,
      currency: "USD",
      status: "Active",
      interestRate: 2.5,
      openedDate: "2023-02-01",
    },
  ],
  "2": [
    {
      id: "acc-2-checking",
      type: "Checking",
      accountNumber: "****9012",
      balance: 8750.25,
      currency: "USD",
      status: "Active",
      interestRate: 0.01,
      openedDate: "2023-03-10",
    },
  ],
  "3": [
    {
      id: "acc-3-business",
      type: "Business",
      accountNumber: "****3456",
      balance: 50000.0,
      currency: "USD",
      status: "Active",
      interestRate: 1.5,
      openedDate: "2022-12-01",
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "1"
    const accounts = DEMO_ACCOUNTS[userId as keyof typeof DEMO_ACCOUNTS] || []

    return NextResponse.json({
      success: true,
      accounts,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, initialDeposit } = await request.json()
    const userId = request.headers.get("x-user-id") || "1"

    const newAccount = {
      id: `acc-${userId}-${Date.now()}`,
      type,
      accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      balance: initialDeposit || 0,
      currency: "USD",
      status: "Active",
      interestRate: type === "Savings" ? 2.5 : 0.01,
      openedDate: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({
      success: true,
      account: newAccount,
      message: "Account created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}

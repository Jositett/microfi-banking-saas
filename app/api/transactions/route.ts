import { type NextRequest, NextResponse } from "next/server"

const DEMO_TRANSACTIONS = {
  "1": [
    {
      id: "txn-1-001",
      type: "credit",
      amount: 2500.0,
      description: "Salary Deposit",
      category: "Income",
      date: "2024-01-15T10:30:00Z",
      status: "completed",
      accountId: "acc-1-checking",
    },
    {
      id: "txn-1-002",
      type: "debit",
      amount: 85.5,
      description: "Grocery Store",
      category: "Food & Dining",
      date: "2024-01-14T16:45:00Z",
      status: "completed",
      accountId: "acc-1-checking",
    },
    {
      id: "txn-1-003",
      type: "debit",
      amount: 1200.0,
      description: "Rent Payment",
      category: "Housing",
      date: "2024-01-01T09:00:00Z",
      status: "completed",
      accountId: "acc-1-checking",
    },
  ],
  "2": [
    {
      id: "txn-2-001",
      type: "credit",
      amount: 1800.0,
      description: "Freelance Payment",
      category: "Income",
      date: "2024-01-12T14:20:00Z",
      status: "completed",
      accountId: "acc-2-checking",
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "1"
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const accountId = searchParams.get("accountId")

    let transactions = DEMO_TRANSACTIONS[userId as keyof typeof DEMO_TRANSACTIONS] || []

    if (accountId) {
      transactions = transactions.filter((t) => t.accountId === accountId)
    }

    transactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, amount, description, category, accountId } = await request.json()
    const userId = request.headers.get("x-user-id") || "1"

    const newTransaction = {
      id: `txn-${userId}-${Date.now()}`,
      type,
      amount: Number.parseFloat(amount),
      description,
      category,
      date: new Date().toISOString(),
      status: "completed",
      accountId,
    }

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: "Transaction created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

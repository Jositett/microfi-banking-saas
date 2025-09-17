import { NextResponse } from "next/server"

// Demo user accounts with different roles and data
export const demoUsers = {
  "john.doe@microfi.com": {
    id: "1",
    email: "john.doe@microfi.com",
    password: "[REDACTED]",
    name: "John Doe",
    role: "user",
    phone: "+233 24 123 4567",
    avatar: "/professional-man.png",
    accounts: [
      {
        id: "acc_1",
        name: "Savings Account",
        type: "savings",
        balance: 15750.5,
        currency: "GHS",
        accountNumber: "1234567890",
        status: "active",
      },
      {
        id: "acc_2",
        name: "Current Account",
        type: "current",
        balance: 8920.25,
        currency: "GHS",
        accountNumber: "1234567891",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "txn_1",
        type: "credit",
        amount: 2500.0,
        description: "Salary Payment",
        date: "2024-01-15",
        status: "completed",
        accountId: "acc_2",
      },
      {
        id: "txn_2",
        type: "debit",
        amount: 150.0,
        description: "MTN Mobile Money",
        date: "2024-01-14",
        status: "completed",
        accountId: "acc_1",
      },
      {
        id: "txn_3",
        type: "credit",
        amount: 500.0,
        description: "Transfer from Current",
        date: "2024-01-13",
        status: "completed",
        accountId: "acc_1",
      },
    ],
    savings: [
      {
        id: "sav_1",
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 7500,
        monthlyContribution: 500,
        startDate: "2023-06-01",
        endDate: "2024-12-01",
        status: "active",
      },
      {
        id: "sav_2",
        name: "Vacation Fund",
        targetAmount: 5000,
        currentAmount: 2800,
        monthlyContribution: 300,
        startDate: "2023-09-01",
        endDate: "2024-08-01",
        status: "active",
      },
    ],
    loans: [
      {
        id: "loan_1",
        type: "personal",
        amount: 15000,
        balance: 8500,
        interestRate: 12.5,
        monthlyPayment: 750,
        startDate: "2023-03-01",
        endDate: "2025-03-01",
        status: "active",
      },
    ],
  },
  "sarah.admin@microfi.com": {
    id: "2",
    email: "sarah.admin@microfi.com",
    password: "[REDACTED]",
    name: "Sarah Johnson",
    role: "admin",
    phone: "+233 24 987 6543",
    avatar: "/professional-woman-diverse.png",
    accounts: [
      {
        id: "acc_3",
        name: "Admin Account",
        type: "current",
        balance: 25000.0,
        currency: "GHS",
        accountNumber: "9876543210",
        status: "active",
      },
    ],
    transactions: [],
    savings: [],
    loans: [],
  },
  "mike.business@microfi.com": {
    id: "3",
    email: "mike.business@microfi.com",
    password: "[REDACTED]",
    name: "Mike Osei",
    role: "business",
    phone: "+233 20 555 0123",
    avatar: "/diverse-businessman.png",
    accounts: [
      {
        id: "acc_4",
        name: "Business Current",
        type: "business",
        balance: 45000.75,
        currency: "GHS",
        accountNumber: "5555666677",
        status: "active",
      },
      {
        id: "acc_5",
        name: "Business Savings",
        type: "savings",
        balance: 120000.0,
        currency: "GHS",
        accountNumber: "5555666678",
        status: "active",
      },
    ],
    transactions: [
      {
        id: "txn_4",
        type: "credit",
        amount: 15000.0,
        description: "Client Payment",
        date: "2024-01-15",
        status: "completed",
        accountId: "acc_4",
      },
      {
        id: "txn_5",
        type: "debit",
        amount: 3500.0,
        description: "Office Rent",
        date: "2024-01-10",
        status: "completed",
        accountId: "acc_4",
      },
    ],
    savings: [
      {
        id: "sav_3",
        name: "Equipment Fund",
        targetAmount: 50000,
        currentAmount: 35000,
        monthlyContribution: 2000,
        startDate: "2023-01-01",
        endDate: "2024-06-01",
        status: "active",
      },
    ],
    loans: [
      {
        id: "loan_2",
        type: "business",
        amount: 100000,
        balance: 65000,
        interestRate: 15.0,
        monthlyPayment: 4500,
        startDate: "2022-06-01",
        endDate: "2026-06-01",
        status: "active",
      },
    ],
  },
}

// System-wide demo data
export const systemData = {
  totalUsers: 1247,
  totalAccounts: 2891,
  totalTransactions: 15634,
  totalLoans: 342,
  totalSavings: 856,
  systemHealth: "excellent",
  recentActivity: [
    {
      id: "act_1",
      type: "user_registration",
      description: "New user registered: kwame.asante@email.com",
      timestamp: "2024-01-15T10:30:00Z",
      severity: "info",
    },
    {
      id: "act_2",
      type: "loan_approval",
      description: "Loan approved for user ID: 1247",
      timestamp: "2024-01-15T09:15:00Z",
      severity: "success",
    },
    {
      id: "act_3",
      type: "system_maintenance",
      description: "Scheduled maintenance completed",
      timestamp: "2024-01-15T02:00:00Z",
      severity: "info",
    },
  ],
  systemAlerts: [
    {
      id: "alert_1",
      type: "info",
      title: "System Update",
      message: "New features will be deployed tonight at 2 AM GMT",
      timestamp: "2024-01-15T08:00:00Z",
    },
    {
      id: "alert_2",
      type: "warning",
      title: "High Transaction Volume",
      message: "Transaction volume is 150% above normal",
      timestamp: "2024-01-15T07:30:00Z",
    },
  ],
}

export async function GET() {
  return NextResponse.json({
    users: demoUsers,
    system: systemData,
  })
}

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Find user by email
  const user = Object.values(demoUsers).find((u) => u.email === email)

  // Demo password validation
  const validPasswords: Record<string, string> = {
    "john.doe@microfi.com": "demo123",
    "sarah.admin@microfi.com": "admin123",
    "mike.business@microfi.com": "business123"
  }
  
  if (!user || validPasswords[email] !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user

  return NextResponse.json({
    success: true,
    user: userWithoutPassword,
    token: `demo_token_${user.id}_${Date.now()}`,
  })
}

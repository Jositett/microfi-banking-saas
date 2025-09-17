import { type NextRequest, NextResponse } from "next/server"

// Demo users database
const DEMO_USERS = [
  {
    id: "1",
    email: "john.doe@example.com",
    password: "demo123",
    name: "John Doe",
    role: "user",
    avatar: "/professional-man.png",
    accountNumber: "ACC-001-2024",
    balance: 15420.5,
    creditScore: 750,
  },
  {
    id: "2",
    email: "sarah.wilson@example.com",
    password: "demo123",
    name: "Sarah Wilson",
    role: "user",
    avatar: "/professional-woman-diverse.png",
    accountNumber: "ACC-002-2024",
    balance: 8750.25,
    creditScore: 720,
  },
  {
    id: "3",
    email: "admin@microfi.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    avatar: "/diverse-businessman.png",
    accountNumber: "ADM-001-2024",
    balance: 50000.0,
    creditScore: 800,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user in demo database
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: `demo-token-${user.id}`, // Demo token
    })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

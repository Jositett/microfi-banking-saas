import { NextResponse } from "next/server"
import { demoUsers, systemData } from "@/lib/demo-data"

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

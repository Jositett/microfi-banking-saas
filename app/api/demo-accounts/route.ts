import { NextResponse } from "next/server"
import { demoUsers } from "@/lib/demo-data"

export async function GET() {
  const accounts = Object.values(demoUsers).map((user) => ({
    email: user.email,
    name: user.name,
    role: user.role,
    description: getDemoAccountDescription(user.role, user.name),
  }))

  return NextResponse.json({ accounts })
}

function getDemoAccountDescription(role: string, name: string): string {
  switch (role) {
    case "admin":
      return `Admin account with full system access`
    case "business":
      return `Business account with multiple accounts and loans`
    case "user":
    default:
      return `Personal account with savings and transactions`
  }
}

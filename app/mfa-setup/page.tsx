"use client"

import { useEffect, useState } from "react"
import { WebAuthnSetup } from "@/components/auth/webauthn-setup"
import { useRouter } from "next/navigation"

export default function MFASetupPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("microfi_user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleMFAComplete = () => {
    if (user?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to MicroFi Banking
          </h1>
          <p className="text-muted-foreground">
            Complete your security setup to access your account
          </p>
        </div>

        <WebAuthnSetup
          userId={user.id}
          userEmail={user.email}
          onComplete={handleMFAComplete}
        />
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { WebAuthnLogin } from "@/components/auth/webauthn-login"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

export default function HomePage() {
  const [showWebAuthnLogin, setShowWebAuthnLogin] = useState(false)

  const handleWebAuthnSuccess = (user: any, token: string) => {
    localStorage.setItem("microfi_user", JSON.stringify(user))
    localStorage.setItem("auth_token", token)
    
    if (user.role === "admin") {
      window.location.href = "/admin"
    } else {
      window.location.href = "/dashboard"
    }
  }

  if (showWebAuthnLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">MicroFi</h1>
            <p className="text-muted-foreground">Secure Biometric Authentication</p>
          </div>
          <WebAuthnLogin 
            onSuccess={handleWebAuthnSuccess}
            onCancel={() => setShowWebAuthnLogin(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">MicroFi</h1>
          <p className="text-muted-foreground">Modern Banking & Financial Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your financial dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowWebAuthnLogin(true)}
              className="w-full"
              variant="outline"
            >
              <div className="w-4 h-4 mr-2">
                <Icons.Fingerprint />
              </div>
              Sign in with Biometrics
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <LoginForm />
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Secure • Reliable • Modern Banking Solutions</p>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { webauthnClient } from "@/lib/webauthn"

interface WebAuthnSetupProps {
  userId: string
  userEmail: string
  onComplete: () => void
}

export function WebAuthnSetup({ userId, userEmail, onComplete }: WebAuthnSetupProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    if (!webauthnClient.isWebAuthnSupported()) {
      setError("WebAuthn is not supported in this browser")
      return
    }

    setIsRegistering(true)
    setError(null)

    try {
      const result = await webauthnClient.registerCredential(userId, userEmail)
      
      if (result.verified) {
        onComplete()
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("WebAuthn registration error:", error)
      setError("Registration failed. Please ensure your device supports biometric authentication.")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle>Setup Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Secure your account with biometric authentication or security key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Supported Methods:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Face ID / Touch ID</li>
            <li>• Windows Hello</li>
            <li>• Hardware Security Keys (YubiKey)</li>
            <li>• Android Biometrics</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button 
          onClick={handleRegister} 
          disabled={isRegistering}
          className="w-full"
        >
          {isRegistering ? (
            <>
              <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting up MFA...
            </>
          ) : (
            <>
              <Icons.Fingerprint className="w-4 h-4 mr-2" />
              Setup MFA Now
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This is required for banking-level security compliance
        </p>
      </CardContent>
    </Card>
  )
}
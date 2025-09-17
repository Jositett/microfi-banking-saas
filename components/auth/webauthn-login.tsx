"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { webauthnClient } from "@/lib/webauthn"

interface WebAuthnLoginProps {
  onSuccess: (user: any, token: string) => void
  onCancel: () => void
}

export function WebAuthnLogin({ onSuccess, onCancel }: WebAuthnLoginProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleWebAuthnLogin = async () => {
    if (!webauthnClient.isWebAuthnSupported()) {
      setError("WebAuthn is not supported in this browser")
      return
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      // For demo, use a default user ID - in production this would come from a username field
      const result = await webauthnClient.authenticateCredential("demo-user-1")
      
      if (result.verified) {
        // Mock user data for successful WebAuthn login
        const user = {
          id: "demo-user-1",
          email: "john.doe@microfi.com",
          role: "user",
          mfaSetup: true
        }
        onSuccess(user, result.sessionToken || "webauthn_token_" + Date.now())
      } else {
        setError("Authentication failed. Please try again.")
      }
    } catch (error) {
      console.error("WebAuthn login error:", error)
      setError("Authentication failed. Please ensure your authenticator is available.")
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.Fingerprint className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle>Biometric Login</CardTitle>
        <CardDescription>
          Sign in securely with your fingerprint, face, or security key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isAuthenticating}
            className="flex-1"
          >
            Back to Login
          </Button>
          <Button 
            onClick={handleWebAuthnLogin} 
            disabled={isAuthenticating}
            className="flex-1"
          >
            {isAuthenticating ? (
              <>
                <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Icons.Fingerprint className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <Icons.Shield className="w-3 h-3 inline mr-1" />
          Bank-level security with biometric authentication
        </div>
      </CardContent>
    </Card>
  )
}
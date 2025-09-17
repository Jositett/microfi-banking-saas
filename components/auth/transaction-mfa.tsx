"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { webauthnClient } from "@/lib/webauthn"

interface TransactionMFAProps {
  challenge: any
  transactionId: string
  transactionDetails: {
    type: string
    amount?: number
    recipient?: string
    description?: string
  }
  onVerified: (mfaResponse: string) => void
  onCancel: () => void
}

export function TransactionMFA({ 
  challenge, 
  transactionId, 
  transactionDetails, 
  onVerified, 
  onCancel 
}: TransactionMFAProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!webauthnClient.isWebAuthnSupported()) {
      setError("WebAuthn is not supported in this browser")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Use the challenge to perform WebAuthn authentication
      const credential = await webauthnClient.authenticateCredential(challenge.userId || 'current-user')
      
      if (credential.verified) {
        onVerified(JSON.stringify(credential))
      } else {
        setError("Authentication failed. Please try again.")
      }
    } catch (error) {
      console.error("Transaction MFA error:", error)
      setError("Authentication failed. Please ensure your authenticator is available.")
    } finally {
      setIsVerifying(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount / 100) // Convert from kobo to GHS
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle>Transaction Verification Required</CardTitle>
          <CardDescription>
            Confirm this high-value transaction with biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Transaction Details:</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{transactionDetails.type}</span>
              </div>
              {transactionDetails.amount && (
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium text-orange-600">
                    {formatAmount(transactionDetails.amount)}
                  </span>
                </div>
              )}
              {transactionDetails.recipient && (
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="font-medium">{transactionDetails.recipient}</span>
                </div>
              )}
              {transactionDetails.description && (
                <div className="flex justify-between">
                  <span>Description:</span>
                  <span className="font-medium">{transactionDetails.description}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Transaction ID:</span>
                <span>{transactionId}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isVerifying}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Icons.Fingerprint className="w-4 h-4 mr-2" />
                  Verify
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This verification is required for banking security compliance
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
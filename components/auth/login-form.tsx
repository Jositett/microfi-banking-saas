"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/ui/icons"
import { api } from "@/lib/api"
import { webauthnClient } from "@/lib/webauthn"
import Link from "next/link"

interface DemoAccount {
  email: string
  name: string
  role: string
  description: string
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([])
  const [selectedDemo, setSelectedDemo] = useState<string>("")

  useEffect(() => {
    const loadDemoAccounts = async () => {
      try {
        const response = await fetch("/api/demo-accounts")
        if (response.ok) {
          const text = await response.text()
          if (text) {
            const data = JSON.parse(text)
            setDemoAccounts(data.accounts || [])
          }
        }
      } catch (error) {
        console.error("Failed to load demo accounts:", error)
        setDemoAccounts([])
      }
    }
    loadDemoAccounts()
  }, [])

  const handleDemoSelect = (demoEmail: string) => {
    setSelectedDemo(demoEmail)
    setEmail(demoEmail)
    // Set password based on demo account
    if (demoEmail.includes("admin")) {
      setPassword("admin123")
    } else if (demoEmail.includes("business")) {
      setPassword("business123")
    } else {
      setPassword("demo123")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    console.log('Login attempt:', { email, password: '***' })

    try {
      // Step 1: Basic authentication
      const data = await api.login(email, password)
      console.log('Backend login response:', data)
      
      if (data.user && data.token) {
        // Check if user has MFA setup
        const hasMFA = data.user.mfaSetup || false
        
        if (hasMFA) {
          // User has MFA - require WebAuthn verification
          try {
            const mfaResult = await webauthnClient.authenticateCredential(data.user.id)
            
            if (mfaResult.verified) {
              localStorage.setItem("microfi_user", JSON.stringify(data.user))
              localStorage.setItem("auth_token", mfaResult.sessionToken)
              
              if (data.user.role === "admin") {
                window.location.href = "/admin"
              } else {
                window.location.href = "/dashboard"
              }
              return
            } else {
              alert("Multi-factor authentication failed. Please try again.")
              setIsLoading(false)
            }
          } catch (mfaError) {
            console.error('MFA verification failed:', mfaError)
            alert("MFA verification failed. Please ensure your authenticator is available.")
            setIsLoading(false)
          }
        } else {
          // New user - redirect to MFA setup and mark as needing setup
          data.user.needsMfaSetup = true
          localStorage.setItem("microfi_user", JSON.stringify(data.user))
          localStorage.setItem("auth_token", data.token)
          window.location.href = "/mfa-setup"
          return
        }
      } else {
        console.error('Invalid backend response format:', data)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Backend login failed, trying demo:", error)
      
      // Fallback to demo API (no MFA for demo)
      try {
        const response = await fetch("/api/demo-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          throw new Error(`Demo API error: ${response.status}`)
        }
        
        const text = await response.text()
        if (!text) {
          throw new Error('Empty response from demo API')
        }
        
        const data = JSON.parse(text)
        console.log('Demo API response:', data)

        if (data.success) {
          console.log('Demo login successful')
          // Demo users have MFA pre-configured - skip to dashboard
          data.user.mfaSetup = true
          localStorage.setItem("microfi_user", JSON.stringify(data.user))
          localStorage.setItem("auth_token", data.token)

          if (data.user.role === "admin") {
            window.location.href = "/admin"
          } else {
            window.location.href = "/dashboard"
          }
          return
        } else {
          alert("Invalid credentials. Please try a demo account.")
          setIsLoading(false)
        }
      } catch (demoError) {
        console.error("Demo login also failed:", demoError)
        alert("Login failed. Please check if the backend is running.")
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="demo-select">Try Demo Account</Label>
        <Select value={selectedDemo} onValueChange={handleDemoSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a demo account to try" />
          </SelectTrigger>
          <SelectContent>
            {demoAccounts.map((account) => (
              <SelectItem key={account.email} value={account.email}>
                <div className="flex items-center space-x-2">
                  <Icons.User />
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-xs text-muted-foreground">{account.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
          className="w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
            className="w-full pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input id="remember" type="checkbox" className="rounded border-border" />
          <Label htmlFor="remember" className="text-sm">
            Remember me
          </Label>
        </div>
        <Link href="/forgot-password" className="text-sm text-accent hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <Separator />

      <div className="flex items-center justify-center space-x-1 text-sm">
        <Icons.Shield />
        <span className="text-muted-foreground">Secured with bank-level encryption</span>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href="/register" className="text-accent hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}

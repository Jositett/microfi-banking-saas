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
      // Step 1: Basic authentication with backend
      const response = await api.login(email, password)
      console.log('Backend login response:', response)
      
      // Type the response properly
      const data = response as {
        user: {
          id: string
          email: string
          role: string
          kycStatus: string
        }
        token: string
        expiresIn: number
      }
      
      if (data.user && data.token) {
        // For demo purposes, skip MFA and go directly to dashboard
        // In production, you would check if user has MFA setup and require WebAuthn
        console.log('Login successful for user:', data.user.email)
        
        // Store user data and token
        localStorage.setItem("microfi_user", JSON.stringify(data.user))
        localStorage.setItem("auth_token", data.token)
        
        // Also set cookie for middleware
        document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`
        
        // Redirect based on user role
        if (data.user.role === "admin") {
          window.location.href = "/admin"
        } else {
          window.location.href = "/dashboard"
        }
        return
      } else {
        console.error('Invalid backend response format:', data)
        alert("Login failed. Invalid response from server.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("Invalid credentials. Please check your email and password.")
      setIsLoading(false)
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

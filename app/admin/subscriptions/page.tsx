"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SubscriptionManager } from "@/components/admin/subscription-manager"

export default function AdminSubscriptionsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("microfi_user")
    
    if (!token || !userData) {
      window.location.href = "/"
      return
    }
    
    const user = JSON.parse(userData)
    if (user.role !== "admin") {
      window.location.href = "/dashboard"
      return
    }
    
    setIsAuthenticated(true)
  }, [])
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <SubscriptionManager />
        </main>
      </div>
    </div>
  )
}
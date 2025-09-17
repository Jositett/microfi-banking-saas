"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminOverview } from "@/components/admin/admin-overview"
import { RecentActivity } from "@/components/admin/recent-activity"
import { SystemAlerts } from "@/components/admin/system-alerts"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    // Check authentication and admin role
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

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">System overview and management</p>
              </div>
              <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
            </div>

            <AdminOverview />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div>
                <SystemAlerts />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Icons.Home },
  { name: "Users", href: "/admin/users", icon: Icons.Users },
  { name: "Accounts", href: "/admin/accounts", icon: Icons.CreditCard },
  { name: "Transactions", href: "/admin/transactions", icon: Icons.FileText },
  { name: "Reports", href: "/admin/reports", icon: Icons.BarChart3 },
  { name: "System Logs", href: "/admin/logs", icon: Icons.Database },
  { name: "Alerts", href: "/admin/alerts", icon: Icons.AlertTriangle },
]

const bottomNavigation = [{ name: "Settings", href: "/admin/settings", icon: Icons.Settings }]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Icons.Shield />
                </div>
                <span className="font-bold text-sidebar-foreground">Admin Panel</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isCollapsed ? <Icons.Menu /> : <Icons.X />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  isCollapsed ? "px-2" : "px-3"
                }`}
              >
                <item.icon />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom Navigation */}
        <div className="p-4 space-y-2">
          {bottomNavigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                  isCollapsed ? "px-2" : "px-3"
                }`}
              >
                <item.icon />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Button>
            </Link>
          ))}

          <Link href="/dashboard">
            <Button
              variant="ghost"
              className={`w-full justify-start text-accent hover:bg-accent hover:text-accent-foreground ${
                isCollapsed ? "px-2" : "px-3"
              }`}
            >
              <Icons.Home />
              {!isCollapsed && <span className="ml-3">User Dashboard</span>}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

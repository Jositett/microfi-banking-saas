"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Icons.Home },
  { name: "Accounts", href: "/accounts", icon: Icons.CreditCard },
  { name: "Savings", href: "/savings", icon: Icons.PiggyBank },
  { name: "Loans", href: "/loans", icon: Icons.Banknote },
  { name: "Investments", href: "/investments", icon: Icons.TrendingUp },
  { name: "Transactions", href: "/transactions", icon: Icons.Receipt },
  { name: "Reports", href: "/reports", icon: Icons.BarChart3 },
  { name: "Customers", href: "/customers", icon: Icons.Users },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Icons.Settings },
  { name: "Help", href: "/help", icon: Icons.HelpCircle },
]

export function DashboardSidebar() {
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
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold text-sm">M</span>
                </div>
                <span className="font-bold text-sidebar-foreground">MicroFi</span>
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

          <Button
            variant="ghost"
            className={`w-full justify-start text-destructive hover:bg-destructive hover:text-destructive-foreground ${
              isCollapsed ? "px-2" : "px-3"
            }`}
          >
            <Icons.LogOut />
            {!isCollapsed && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}

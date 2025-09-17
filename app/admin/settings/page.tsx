"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/ui/icons"

export default function AdminSettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
              <p className="text-muted-foreground">Configure system settings and preferences</p>
            </div>

            <div className="space-y-6">
              {/* System Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Core system settings and parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">System Name</Label>
                      <Input id="systemName" defaultValue="MicroFi Banking" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="systemVersion">Version</Label>
                      <Input id="systemVersion" defaultValue="1.0.0" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="systemDescription">Description</Label>
                    <Input
                      id="systemDescription"
                      defaultValue="Comprehensive banking and financial management platform"
                    />
                  </div>
                  <Button>Save Configuration</Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security policies and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP Whitelisting</Label>
                      <p className="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input id="maxLoginAttempts" type="number" defaultValue="5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure system notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send system alerts via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Send critical alerts via SMS</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Transaction Monitoring</Label>
                      <p className="text-sm text-muted-foreground">Monitor suspicious transactions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input id="adminEmail" type="email" defaultValue="admin@microfi.com" />
                  </div>
                </CardContent>
              </Card>

              {/* System Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>System maintenance and backup settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">Schedule regular system backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode</p>
                    </div>
                    <Switch />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <Icons.Database />
                      Backup Database
                    </Button>
                    <Button variant="outline">
                      <Icons.RefreshCw />
                      Clear Cache
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <Icons.Download />
                      Export Logs
                    </Button>
                    <Button variant="outline">
                      <Icons.Shield />
                      Security Scan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* API Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Configure API settings and rate limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiRateLimit">Rate Limit (requests/minute)</Label>
                      <Input id="apiRateLimit" type="number" defaultValue="100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiTimeout">Timeout (seconds)</Label>
                      <Input id="apiTimeout" type="number" defaultValue="30" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all API requests and responses</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button>Update API Settings</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

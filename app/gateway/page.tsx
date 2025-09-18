import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Building, FileX } from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">CBMP Compliance</h1>
                <p className="text-muted-foreground">Payment features completely removed for regulatory compliance</p>
              </div>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Payment Features Removed</AlertTitle>
              <AlertDescription className="text-red-700">
                All payment gateway configurations and processing features have been permanently removed 
                to ensure 100% BoG/CBN compliance. This platform is now pure business management software only.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileX className="h-5 w-5" />
                  Removed Features
                </CardTitle>
                <CardDescription>
                  Payment-related features that have been permanently removed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Payment Processing</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Paystack gateway configuration</li>
                      <li>• Flutterwave integration</li>
                      <li>• MTN MoMo processing</li>
                      <li>• Payment credential storage</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Financial Operations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Transaction processing</li>
                      <li>• Balance tracking</li>
                      <li>• Fund transfers</li>
                      <li>• Payment routing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Available Business Features
                </CardTitle>
                <CardDescription>
                  Compliant business management tools available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Customer Management</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Customer profiles and KYC</li>
                      <li>• Contact management</li>
                      <li>• Document uploads</li>
                      <li>• Business relationships</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Data Management</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• CSV data import</li>
                      <li>• Business reporting</li>
                      <li>• Loan application tracking</li>
                      <li>• Staff management</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
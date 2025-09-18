import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText, Upload, Users, Building } from "lucide-react"

export default function BusinessManagementPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Business Management</h1>
                <p className="text-muted-foreground">Pure business management tools - CSV import, CRM, and loan tracking</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                CBMP Compliant
              </Badge>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">100% Compliant Business Management</AlertTitle>
              <AlertDescription className="text-green-700">
                This platform provides pure business management software with zero payment processing.
                Upload CSV files from your licensed payment systems for business reporting.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Management
                  </CardTitle>
                  <CardDescription>
                    Manage customer profiles and KYC documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => window.location.href = '/customers'}>
                    Manage Customers
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Loan Applications
                  </CardTitle>
                  <CardDescription>
                    Track loan applications with manual status updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => window.location.href = '/loans'}>
                    Manage Loans
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    CSV Data Import
                  </CardTitle>
                  <CardDescription>
                    Upload business data from your payment systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Import CSV Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Notice</CardTitle>
                <CardDescription>
                  Business Management Software Only
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p><strong>This platform is pure business management SaaS. We:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Do not process payments or handle funds</li>
                    <li>Do not access payment systems (Paystack, MTN MoMo, Flutterwave)</li>
                    <li>Do not store payment credentials or transaction data</li>
                    <li>Do not set up payment systems for clients</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Clients are solely responsible for managing their own payment operations via their licensed payment providers.</strong>
                  </p>
                  <p className="mt-2 font-semibold text-green-600">
                    Compliance: BoG/CBN exempt - software provider only
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
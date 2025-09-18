import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload, FileText, Download } from "lucide-react"

export default function DataImportPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Data Import</h1>
                <p className="text-muted-foreground">Import business data from CSV files - no payment processing</p>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">CSV-Only Data Import</AlertTitle>
              <AlertDescription className="text-blue-700">
                Upload CSV files containing business data from your licensed payment systems. 
                We do not process payments or connect to payment APIs.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Business Data
                  </CardTitle>
                  <CardDescription>
                    Upload CSV files with customer and business information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button variant="outline">
                        Select CSV File
                      </Button>
                      <p className="mt-2 text-sm text-gray-500">
                        Drag and drop or click to upload
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Allowed columns:</strong> customer_name, loan_status, kyc_status, staff_name, expense_category</p>
                    <p><strong>Prohibited:</strong> amount, balance, transaction_id, payment_status, account_number</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Import History
                  </CardTitle>
                  <CardDescription>
                    View previously imported business data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">customer_data.csv</p>
                        <p className="text-sm text-muted-foreground">Imported 2 hours ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">loan_applications.csv</p>
                        <p className="text-sm text-muted-foreground">Imported yesterday</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Guidelines</CardTitle>
                <CardDescription>
                  Data import rules for regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">✅ Allowed Data Types</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Customer contact information</li>
                      <li>• Loan application status (text only)</li>
                      <li>• KYC verification status</li>
                      <li>• Staff and employee records</li>
                      <li>• Business expense categories</li>
                      <li>• Document management data</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">❌ Prohibited Data Types</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Payment amounts or balances</li>
                      <li>• Transaction IDs or payment status</li>
                      <li>• Account numbers or card details</li>
                      <li>• Gateway responses or payment data</li>
                      <li>• Financial calculations or processing</li>
                      <li>• Real-time payment system data</li>
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
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, FileSpreadsheet, Mail } from "lucide-react"

const reportTypes = [
  { id: "financial", name: "Financial Summary", description: "Revenue, expenses, and profit analysis" },
  { id: "transactions", name: "Transaction Report", description: "Detailed transaction history" },
  { id: "users", name: "User Activity", description: "User registration and activity metrics" },
  { id: "loans", name: "Loan Performance", description: "Loan disbursement and repayment data" },
  { id: "savings", name: "Savings Analysis", description: "Savings plans and growth metrics" },
]

export function ExportReports() {
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)

  const handleReportToggle = (reportId: string) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleExport = async () => {
    if (selectedReports.length === 0) return

    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      // Show success message
    }, 3000)
  }

  const handleEmailReport = async () => {
    if (selectedReports.length === 0) return

    // Email report logic
    console.log("Emailing reports:", selectedReports)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Reports</span>
        </CardTitle>
        <CardDescription>Download or email detailed reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Select Reports</h4>
          {reportTypes.map((report) => (
            <div key={report.id} className="flex items-start space-x-3">
              <Checkbox
                id={report.id}
                checked={selectedReports.includes(report.id)}
                onCheckedChange={() => handleReportToggle(report.id)}
              />
              <div className="flex-1">
                <label htmlFor={report.id} className="text-sm font-medium cursor-pointer">
                  {report.name}
                </label>
                <p className="text-xs text-muted-foreground">{report.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export Format</h4>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF Document</span>
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel Spreadsheet</span>
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>CSV File</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button onClick={handleExport} className="w-full" disabled={selectedReports.length === 0 || isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Generating..." : "Download Reports"}
          </Button>

          <Button
            variant="outline"
            onClick={handleEmailReport}
            className="w-full bg-transparent"
            disabled={selectedReports.length === 0}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Reports
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Reports will include data based on your current filter settings.</p>
        </div>
      </CardContent>
    </Card>
  )
}

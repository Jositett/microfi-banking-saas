"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"

interface ImportResult {
  success: boolean
  recordsImported: number
  errors: string[]
}

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null)
  const [dataType, setDataType] = useState<string>("")
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)

  const allowedDataTypes = [
    { value: "customers", label: "Customer Data", description: "Customer profiles and contact information" },
    { value: "loans", label: "Loan Applications", description: "Loan application tracking data" },
    { value: "expenses", label: "Business Expenses", description: "Expense categorization data" },
    { value: "staff", label: "Staff Records", description: "Employee and staff management data" }
  ]

  const allowedColumns = {
    customers: ['name', 'email', 'phone', 'kyc_status', 'business_type'],
    loans: ['customer_name', 'loan_type', 'requested_amount', 'purpose', 'status'],
    expenses: ['category', 'description', 'date', 'staff_name'],
    staff: ['name', 'email', 'role', 'department', 'hire_date']
  }

  const prohibitedColumns = [
    'amount', 'balance', 'transaction_id', 'payment_status',
    'gateway_response', 'account_number', 'card_number'
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setResult(null)
    } else {
      toast.error('Please select a valid CSV file')
    }
  }

  const validateCSVData = (data: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (data.length === 0) {
      errors.push('CSV file is empty')
      return { valid: false, errors }
    }

    // Check for prohibited columns
    const headers = Object.keys(data[0])
    const foundProhibited = headers.filter(header => 
      prohibitedColumns.includes(header.toLowerCase())
    )
    
    if (foundProhibited.length > 0) {
      errors.push(`CBMP Compliance: Prohibited columns found: ${foundProhibited.join(', ')}`)
    }

    // Check for required columns based on data type
    if (dataType && allowedColumns[dataType as keyof typeof allowedColumns]) {
      const requiredColumns = allowedColumns[dataType as keyof typeof allowedColumns]
      const missingColumns = requiredColumns.filter(col => 
        !headers.some(header => header.toLowerCase() === col.toLowerCase())
      )
      
      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      data.push(row)
    }

    return data
  }

  const handleImport = async () => {
    if (!file || !dataType) {
      toast.error('Please select a file and data type')
      return
    }

    setImporting(true)
    setProgress(0)

    try {
      // Read and parse CSV
      const csvText = await file.text()
      const data = parseCSV(csvText)
      
      setProgress(25)

      // Validate data
      const validation = validateCSVData(data)
      if (!validation.valid) {
        setResult({
          success: false,
          recordsImported: 0,
          errors: validation.errors
        })
        return
      }

      setProgress(50)

      // Import data
      const response = await fetch('/api/business/csv/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dataType,
          fileName: file.name,
          data
        })
      })

      setProgress(75)

      if (response.ok) {
        const result = await response.json()
        setResult({
          success: true,
          recordsImported: result.recordsImported,
          errors: []
        })
        toast.success(`Successfully imported ${result.recordsImported} records`)
      } else {
        const error = await response.json()
        setResult({
          success: false,
          recordsImported: 0,
          errors: [error.message || 'Import failed']
        })
      }

      setProgress(100)
    } catch (error) {
      setResult({
        success: false,
        recordsImported: 0,
        errors: ['Failed to process CSV file']
      })
    } finally {
      setImporting(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const clearImport = () => {
    setFile(null)
    setDataType("")
    setResult(null)
    setProgress(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6" />
          CSV Data Import
        </h2>
        <p className="text-muted-foreground">Import business data from CSV files - CBMP compliant</p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">CBMP Compliance Notice</AlertTitle>
        <AlertDescription className="text-blue-700">
          Only business management data is allowed. Payment-related columns will be rejected automatically.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Import Business Data</CardTitle>
          <CardDescription>
            Upload CSV files containing business information from your systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dataType">Data Type *</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {allowedDataTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file">CSV File *</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {dataType && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Required Columns for {allowedDataTypes.find(t => t.value === dataType)?.label}</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <p className="font-medium">Allowed columns:</p>
                  <p className="text-sm">{allowedColumns[dataType as keyof typeof allowedColumns]?.join(', ')}</p>
                  <p className="font-medium mt-2 text-red-600">Prohibited columns:</p>
                  <p className="text-sm text-red-600">{prohibitedColumns.join(', ')}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle className={result.success ? "text-green-800" : "text-red-800"}>
                {result.success ? "Import Successful" : "Import Failed"}
              </AlertTitle>
              <AlertDescription className={result.success ? "text-green-700" : "text-red-700"}>
                {result.success ? (
                  <p>Successfully imported {result.recordsImported} records</p>
                ) : (
                  <div>
                    <p>Import failed with the following errors:</p>
                    <ul className="list-disc list-inside mt-2">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={!file || !dataType || importing}
              className="flex-1"
            >
              {importing ? 'Importing...' : 'Import CSV Data'}
            </Button>
            {(file || result) && (
              <Button variant="outline" onClick={clearImport}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
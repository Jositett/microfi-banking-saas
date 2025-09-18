"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus, Search, Edit, Eye } from "lucide-react"
import { toast } from "sonner"

interface LoanApplication {
  id: string
  customerId: string
  customerName?: string
  customerEmail?: string
  loanType: 'personal' | 'business' | 'mortgage'
  requestedAmount: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'disbursed'
  notes?: string
  createdAt: string
  updatedAt?: string
}

export function LoanManagement() {
  const [loans, setLoans] = useState<LoanApplication[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState<LoanApplication | null>(null)
  const [formData, setFormData] = useState({
    customerId: "",
    loanType: "personal" as const,
    requestedAmount: "",
    purpose: "",
    notes: ""
  })

  useEffect(() => {
    fetchLoans()
    fetchCustomers()
  }, [])

  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/business/loans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLoans(data.loans || [])
      }
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/business/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/business/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Loan application added successfully')
        setShowAddForm(false)
        setFormData({ customerId: "", loanType: "personal", requestedAmount: "", purpose: "", notes: "" })
        fetchLoans()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to add loan application')
      }
    } catch (error) {
      toast.error('Failed to add loan application')
    }
  }

  const handleUpdateStatus = async (loanId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/business/loans/${loanId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      })

      if (response.ok) {
        toast.success('Loan status updated successfully')
        fetchLoans()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update loan status')
      }
    } catch (error) {
      toast.error('Failed to update loan status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'disbursed':
        return <Badge className="bg-blue-100 text-blue-800">Disbursed</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const getLoanTypeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'bg-purple-100 text-purple-800'
      case 'mortgage':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="p-6">Loading loan applications...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Loan Management
          </h2>
          <p className="text-muted-foreground">Track loan applications with manual status updates</p>
        </div>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Loan Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Loan Application</DialogTitle>
              <DialogDescription>
                Create a new loan application for tracking (manual processing only)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLoan} className="space-y-4">
              <div>
                <Label htmlFor="customerId">Customer *</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="loanType">Loan Type *</Label>
                <Select value={formData.loanType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, loanType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Loan</SelectItem>
                    <SelectItem value="business">Business Loan</SelectItem>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requestedAmount">Requested Amount (Text Only) *</Label>
                <Input
                  id="requestedAmount"
                  value={formData.requestedAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: e.target.value }))}
                  placeholder="e.g., GHS 50,000"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter as text only - no calculations performed
                </p>
              </div>
              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Describe the purpose of the loan"
                  required
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or comments"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Application</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="disbursed">Disbursed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            {filteredLoans.length} applications found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLoans.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No loan applications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" ? 'No applications match your filters.' : 'Add your first loan application to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLoans.map((loan) => (
                <Card key={loan.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{loan.customerName || 'Unknown Customer'}</h3>
                        {getStatusBadge(loan.status)}
                        <Badge className={getLoanTypeColor(loan.loanType)}>
                          {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Requested Amount:</span>
                          <p className="font-medium">{loan.requestedAmount}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Applied:</span>
                          <p>{new Date(loan.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Purpose:</span>
                        <p className="text-sm">{loan.purpose}</p>
                      </div>
                      {loan.notes && (
                        <div>
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="text-sm">{loan.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Select onValueChange={(value) => handleUpdateStatus(loan.id, value)}>
                        <SelectTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Update Status
                          </Button>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="disbursed">Disbursed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
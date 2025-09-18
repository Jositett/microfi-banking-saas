'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, TrendingUp, Users } from 'lucide-react';

export default function AdminBillingPage() {
  const billingData = [
    {
      tenant: 'Demo Banking',
      plan: 'Enterprise',
      amount: 960,
      status: 'paid',
      dueDate: '2024-03-01'
    },
    {
      tenant: 'Client One Bank',
      plan: 'Professional',
      amount: 480,
      status: 'paid',
      dueDate: '2024-03-01'
    },
    {
      tenant: 'Client Two Financial',
      plan: 'Starter',
      amount: 120,
      status: 'pending',
      dueDate: '2024-03-01'
    }
  ];

  const totalRevenue = billingData.length > 0 ? billingData.reduce((sum, item) => sum + item.amount, 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>Billing & Revenue</h1>
        <p style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Manage subscriptions and track revenue</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{billingData.length}</div>
            <p className="text-xs text-blue-600">All plans active</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
              Pending Payments
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>1</div>
            <p className="text-xs text-orange-600">GHS 120 pending</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
              Average Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {billingData.length > 0 ? Math.round(totalRevenue / billingData.length) : 0}</div>
            <p className="text-xs text-purple-600">Per tenant</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Table */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.map((item) => (
              <div key={`${item.tenant}-${item.plan}`} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid rgb(var(--admin-border))' }}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>{item.tenant}</p>
                    <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>{item.plan} Plan</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {item.amount}</p>
                    <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Due: {item.dueDate}</p>
                  </div>
                  <Badge 
                    className={
                      item.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
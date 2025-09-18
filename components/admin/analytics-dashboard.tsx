'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ApiClient } from '@/lib/api-client-mt';

interface PlatformMetrics {
  revenue: {
    current_month: number;
    previous_month: number;
    growth_rate: number;
    daily_data: Array<{ date: string; revenue: number; tenants: number }>;
  };
  tenants: {
    total: number;
    active: number;
    new_this_month: number;
    churn_rate: number;
    by_plan: Array<{ plan: string; count: number; revenue: number }>;
  };
  usage: {
    total_users: number;
    total_transactions: number;
    avg_transactions_per_tenant: number;
    top_features: Array<{ feature: string; usage_count: number }>;
  };
  performance: {
    avg_response_time: number;
    uptime_percentage: number;
    error_rate: number;
    support_tickets: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    const response = await ApiClient.get(`/admin/api/analytics?range=${timeRange}`);
    if (response.success) {
      setMetrics(response.data);
    }
    setLoading(false);
  }, [timeRange]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (loading || !metrics) {
    return <div className="p-6">Loading analytics...</div>;
  }

  const formatCurrency = (amount: number) => `GHS ${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{formatCurrency(metrics.revenue.current_month)}</div>
            <div className="flex items-center mt-1">
              <Badge variant={metrics.revenue.growth_rate >= 0 ? 'default' : 'destructive'}>
                {metrics.revenue.growth_rate >= 0 ? '+' : ''}{formatPercentage(metrics.revenue.growth_rate)}
              </Badge>
              <span className="text-sm ml-2" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{metrics.tenants.active}</div>
            <div className="flex items-center mt-1">
              <span className="text-sm text-green-600">+{metrics.tenants.new_this_month} new</span>
              <span className="text-sm ml-2" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Platform Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{formatPercentage(metrics.performance.uptime_percentage)}</div>
            <div className="flex items-center mt-1">
              <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Avg response: {metrics.performance.avg_response_time}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{metrics.usage.total_transactions.toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
                Avg {Math.round(metrics.usage.avg_transactions_per_tenant)}/tenant
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>Revenue & Tenant Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.revenue.daily_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Revenue (GHS)"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="tenants" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Active Tenants"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metrics.tenants.by_plan}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ plan, count }) => `${plan}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.tenants.by_plan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>Top Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.usage.top_features}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage_count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: 'rgb(var(--admin-foreground))' }}>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Error Rate</span>
                <Badge variant={metrics.performance.error_rate < 1 ? 'default' : 'destructive'}>
                  {formatPercentage(metrics.performance.error_rate)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Support Tickets</span>
                <span className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>{metrics.performance.support_tickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Churn Rate</span>
                <Badge variant={metrics.tenants.churn_rate < 5 ? 'default' : 'destructive'}>
                  {formatPercentage(metrics.tenants.churn_rate)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: 'rgb(var(--admin-foreground))' }}>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.tenants.by_plan.map((plan, index) => (
                <div key={plan.plan} className="flex justify-between">
                  <span className="text-sm capitalize" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>{plan.plan}</span>
                  <span className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>{formatCurrency(plan.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: 'rgb(var(--admin-foreground))' }}>Growth Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Target MRR</span>
                <span className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>GHS 400,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Progress</span>
                <Badge>
                  {formatPercentage((metrics.revenue.current_month / 400000) * 100)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Target Tenants</span>
                <span className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>1,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
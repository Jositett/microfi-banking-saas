'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStats, useAdminActivity } from '@/hooks/use-admin-data';
import { 
  Building2, 
  Users, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const { activity, loading: activityLoading, error: activityError } = useAdminActivity();
  
  const loading = statsLoading || activityLoading;

  const statCards = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        title: 'Total Tenants',
        value: stats.totalTenants,
        change: stats.growth.tenants,
        icon: Building2,
        color: 'text-blue-600'
      },
      {
        title: 'Active Users',
        value: stats.totalUsers,
        change: stats.growth.users,
        icon: Users,
        color: 'text-green-600'
      },
      {
        title: 'Monthly Revenue',
        value: `GHS ${stats.monthlyRevenue.toLocaleString()}`,
        change: stats.growth.revenue,
        icon: DollarSign,
        color: 'text-yellow-600'
      },
      {
        title: 'System Alerts',
        value: stats.systemAlerts,
        change: stats.growth.alerts,
        icon: AlertTriangle,
        color: 'text-red-600'
      }
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>Platform Dashboard</h1>
        <p style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Overview of your MicroFi SaaS platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="admin-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{stat.value}</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: 'rgb(var(--admin-foreground))' }}>
              <Activity className="h-5 w-5 mr-2" />
              Recent Tenant Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>{item.tenantName}</p>
                    <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>{item.description}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>{item.timestamp}</span>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: 'rgb(var(--admin-foreground))' }}>
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Starter Plans</span>
                    <span className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {Math.round(stats.monthlyRevenue * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Professional Plans</span>
                    <span className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {Math.round(stats.monthlyRevenue * 0.4).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Enterprise Plans</span>
                    <span className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {Math.round(stats.monthlyRevenue * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2" style={{ borderColor: 'rgb(var(--admin-border))' }}>
                    <div className="flex justify-between items-center font-semibold">
                      <span style={{ color: 'rgb(var(--admin-foreground))' }}>Total Monthly</span>
                      <span style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
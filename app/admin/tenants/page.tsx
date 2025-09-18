'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Settings, 
  Users, 
  DollarSign,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  custom_domain?: string;
  status: 'active' | 'suspended' | 'inactive';
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  created_at: string;
  user_count?: number;
  monthly_revenue?: number;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('https://127.0.0.1:8787/admin/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTenants(data.tenants || []);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      // Fallback to demo data only in development
      if (process.env.NODE_ENV === 'development') {
        setTenants([
          {
            id: 'demo-tenant',
            name: 'Demo Banking',
            domain: 'demo.microfi.com',
            status: 'active',
            subscription_plan: 'enterprise',
            created_at: '2024-01-15',
            user_count: 4,
            monthly_revenue: 960
          },
          {
            id: 'client1-tenant',
            name: 'Client One Bank',
            domain: 'client1.microfi.com',
            status: 'active',
            subscription_plan: 'professional',
            created_at: '2024-02-01',
            user_count: 8,
            monthly_revenue: 480
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getPlanBadge = (plan: string) => {
    const variants = {
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return variants[plan as keyof typeof variants] || variants.starter;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>Tenant Management</h1>
          <p style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Manage your microfinance institution clients</p>
        </div>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="admin-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" style={{ color: 'rgb(var(--admin-foreground))' }}>{tenant.name}</CardTitle>
                    <p className="text-sm flex items-center mt-1" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
                      <Globe className="w-3 h-3 mr-1" />
                      {tenant.domain}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="w-4 h-4 mr-2" />
                      View Users
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Suspend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusBadge(tenant.status)}>
                  {tenant.status}
                </Badge>
                <Badge className={getPlanBadge(tenant.subscription_plan)}>
                  {tenant.subscription_plan}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" style={{ color: 'rgb(var(--admin-muted-foreground))' }} />
                  <span style={{ color: 'rgb(var(--admin-foreground))' }}>{tenant.user_count || 0} users</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" style={{ color: 'rgb(var(--admin-muted-foreground))' }} />
                  <span style={{ color: 'rgb(var(--admin-foreground))' }}>GHS {tenant.monthly_revenue || 0}/mo</span>
                </div>
              </div>
              
              <div className="text-xs" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
                Created: {new Date(tenant.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{tenants.length}</p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Total Tenants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>
                  {tenants.reduce((sum, t) => sum + (t.user_count || 0), 0)}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>
                  GHS {tenants.reduce((sum, t) => sum + (t.monthly_revenue || 0), 0)}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
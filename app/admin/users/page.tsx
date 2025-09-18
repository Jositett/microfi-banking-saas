'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApiClient } from '@/lib/admin-api-client';
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlatformUser {
  id: string;
  email: string;
  tenant_name: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending';
  last_login: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApiClient.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback demo data in development
      if (process.env.NODE_ENV === 'development') {
        setUsers([
          {
            id: '1',
            email: 'john.doe@microfi.com',
            tenant_name: 'Demo Banking',
            role: 'user',
            status: 'active',
            last_login: '2024-01-15T10:30:00Z',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            email: 'sarah.admin@microfi.com',
            tenant_name: 'Demo Banking',
            role: 'admin',
            status: 'active',
            last_login: '2024-01-15T09:15:00Z',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const userStats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      admins: users.filter(u => u.role === 'admin').length,
      suspended: users.filter(u => u.status === 'suspended').length
    };
  }, [users]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>User Management</h1>
          <p style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Manage users across all tenants</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{userStats.total}</p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{userStats.active}</p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{userStats.admins}</p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="admin-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>{userStats.suspended}</p>
                <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle style={{ color: 'rgb(var(--admin-foreground))' }}>Platform Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid rgb(var(--admin-border))' }}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--admin-muted))' }}>
                    <Users className="w-5 h-5" style={{ color: 'rgb(var(--admin-muted-foreground))' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'rgb(var(--admin-foreground))' }}>{user.email}</p>
                    <p className="text-sm" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>{user.tenant_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusBadge(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgb(var(--admin-muted-foreground))' }}>
                      Last login: {new Date(user.last_login).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Suspend User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
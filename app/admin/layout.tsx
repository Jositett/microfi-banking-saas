'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import PlatformAdminLogout from '@/components/platform-admin/platform-admin-logout';
import { AdminThemeProvider } from '@/components/admin/admin-theme-provider';
import { AdminThemeToggle } from '@/components/admin/admin-theme-toggle';
import { 
  Building2, 
  BarChart3, 
  CreditCard, 
  Settings,
  Shield,
  Users,
  Database,
  AlertTriangle
} from 'lucide-react';

// Import admin theme styles
import '@/styles/admin-theme.css';

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Tenants', href: '/admin/tenants', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Logs', href: '/admin/logs', icon: Database },
  { name: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    const userData = localStorage.getItem('admin-user');

    if (!token || !userData) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      router.push('/admin/login');
    }
    setLoading(false);
  }, [router, pathname]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }



  return (
    <AdminThemeProvider>
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 admin-sidebar shadow-lg">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-admin-border">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">MicroFi Admin</h1>
                <p className="text-xs opacity-70">Platform Management</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`admin-nav-item w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                      isActive ? 'active' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* User info */}
            <div className="px-4 py-4 border-t border-admin-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-xs opacity-70">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <AdminThemeToggle />
                  <PlatformAdminLogout showText={false} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="ml-64">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
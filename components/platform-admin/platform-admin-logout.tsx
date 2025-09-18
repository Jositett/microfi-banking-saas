'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PlatformAdminLogoutProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

export default function PlatformAdminLogout({ 
  variant = 'ghost', 
  size = 'sm',
  showText = true 
}: PlatformAdminLogoutProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('admin-token');
      
      // Call logout endpoint
      await fetch('http://127.0.0.1:8787/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      // Clear local storage
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      
      // Redirect to admin login
      router.push('/admin/login');
      
    } catch (error) {
      console.error('Platform admin logout error:', error);
      // Still clear local storage and redirect on error
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={loading}
          className="text-gray-500 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          {showText && <span className="ml-2">Logout</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Logout from Platform Admin</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout from the MicroFi platform administration? 
            You will need to login again to access the admin dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
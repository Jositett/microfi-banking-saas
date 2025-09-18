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

interface MemberLogoutProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

export default function MemberLogout({ 
  variant = 'ghost', 
  size = 'sm',
  showText = true 
}: MemberLogoutProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
      
      // Call logout endpoint
      await fetch('http://127.0.0.1:8787/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      // Clear local storage
      localStorage.removeItem('auth-token');
      sessionStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      
      // Redirect to member login
      router.push('/');
      
    } catch (error) {
      console.error('Member logout error:', error);
      // Still clear local storage and redirect on error
      localStorage.removeItem('auth-token');
      sessionStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      router.push('/');
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
          <AlertDialogTitle>Logout from Banking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout from your banking account? 
            You will need to login again to access your accounts and transactions.
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
'use client';

import { useEffect, useState } from 'react';
import TenantAdminLogout from '@/components/tenant-admin/tenant-admin-logout';
import MemberLogout from '@/components/member/member-logout';

interface SmartLogoutProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function SmartLogout(props: SmartLogoutProps) {
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    // Check user role from stored user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Return appropriate logout component based on user role
  if (userRole === 'admin') {
    return <TenantAdminLogout {...props} />;
  } else if (userRole === 'user') {
    return <MemberLogout {...props} />;
  }

  // Fallback to member logout if role is unclear
  return <MemberLogout {...props} />;
}
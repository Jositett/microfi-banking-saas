'use client';

import { useTenant } from '@/lib/tenant-context';
import { useEffect } from 'react';
import Image from 'next/image';

export const TenantBranding = () => {
  const { tenant, isLoading } = useTenant();

  useEffect(() => {
    if (tenant?.settings?.primary_color) {
      document.documentElement.style.setProperty('--primary', tenant.settings.primary_color);
      
      if (tenant.settings.secondary_color) {
        document.documentElement.style.setProperty('--secondary', tenant.settings.secondary_color);
      }
    }
  }, [tenant]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {tenant?.settings?.logo_url ? (
        <Image 
          src={tenant.settings.logo_url} 
          alt={tenant.name}
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
      ) : (
        <div 
          className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: tenant?.settings?.primary_color || '#3b82f6' }}
        >
          {tenant?.name?.charAt(0) || 'M'}
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {tenant?.settings?.company_name || tenant?.name || 'MicroFi Banking'}
        </h1>
        {tenant?.subscription_plan && (
          <span className="text-xs text-gray-500 capitalize">
            {tenant.subscription_plan} Plan
          </span>
        )}
      </div>
    </div>
  );
};
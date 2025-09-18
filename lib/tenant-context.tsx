'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  custom_domain?: string;
  status: 'active' | 'suspended' | 'inactive';
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  settings?: {
    logo_url?: string;
    primary_color: string;
    secondary_color?: string;
    currency: string;
    timezone: string;
    company_name?: string;
    support_email?: string;
    support_phone?: string;
  };
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const host = window.location.host;
        const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');

        if (isDevelopment) {
          // Set demo tenant for development
          const demoTenant: Tenant = {
            id: 'demo-tenant',
            name: 'Demo Banking',
            domain: 'demo.microfi.com',
            status: 'active',
            subscription_plan: 'enterprise',
            settings: {
              primary_color: '#3b82f6',
              currency: 'GHS',
              timezone: 'Africa/Accra',
              company_name: 'Demo Banking Corp'
            }
          };
          setTenant(demoTenant);
          setIsLoading(false);
          return;
        }

        // Resolve tenant from backend
        const response = await fetch('/api/tenant/resolve', {
          headers: {
            'X-Tenant-Host': host
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to resolve tenant: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.tenant) {
          setTenant(data.tenant);
        } else {
          throw new Error(data.error || 'Tenant not found');
        }
      } catch (err) {
        console.error('Tenant resolution error:', err);
        setError(err instanceof Error ? err.message : 'Failed to resolve tenant');
      } finally {
        setIsLoading(false);
      }
    };

    resolveTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const withTenant = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function TenantWrappedComponent(props: P) {
    return (
      <TenantProvider>
        <Component {...props} />
      </TenantProvider>
    );
  };
};
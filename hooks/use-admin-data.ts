'use client';

import { useState, useEffect, useMemo } from 'react';
import { adminApiClient } from '@/lib/admin-api-client';

export function useAdminStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminApiClient.getPlatformAnalytics();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        // Fallback demo data in development
        if (process.env.NODE_ENV === 'development') {
          setStats({
            totalTenants: 3,
            totalUsers: 15,
            monthlyRevenue: 1560,
            systemAlerts: 2,
            growth: {
              tenants: '+15%',
              users: '+23%',
              revenue: '+18%',
              alerts: '-5%'
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useAdminActivity() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await adminApiClient.getPlatformActivity();
        setActivity(data.activities || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity');
        // Fallback demo data in development
        if (process.env.NODE_ENV === 'development') {
          setActivity([
            {
              id: '1',
              tenantName: 'Demo Banking',
              description: 'New user registration',
              timestamp: '2 hours ago'
            },
            {
              id: '2',
              tenantName: 'Client One Bank',
              description: 'Payment processed',
              timestamp: '4 hours ago'
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return { activity, loading, error };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userStats = useMemo(() => {
    if (users.length === 0) return { total: 0, active: 0, admins: 0, suspended: 0 };
    
    return users.reduce((acc, user) => {
      acc.total++;
      if (user.status === 'active') acc.active++;
      if (user.role === 'admin') acc.admins++;
      if (user.status === 'suspended') acc.suspended++;
      return acc;
    }, { total: 0, active: 0, admins: 0, suspended: 0 });
  }, [users]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminApiClient.getUsers();
        setUsers(data.users || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, userStats, loading, error };
}
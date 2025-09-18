// Platform Admin Service - Handles platform-wide data and operations

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  monthlyRevenue: number;
  systemAlerts: number;
  growth: {
    tenants: string;
    users: string;
    revenue: string;
    alerts: string;
  };
}

export interface PlatformActivity {
  id: string;
  type: 'tenant_created' | 'subscription_renewed' | 'settings_updated' | 'user_registered';
  tenantName: string;
  description: string;
  timestamp: string;
}

export interface RevenueBreakdown {
  starter: number;
  professional: number;
  premium: number;
  enterprise: number;
  total: number;
}

export class PlatformAdminService {
  private static baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://127.0.0.1:8787';

  private static getHeaders(): Record<string, string> {
    const token = localStorage.getItem('admin-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Get platform-wide analytics (across all tenants)
   */
  static async getPlatformAnalytics(): Promise<PlatformStats> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/analytics`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          totalTenants: data.tenants?.total || 3,
          activeTenants: data.tenants?.active || 3,
          totalUsers: data.users?.total || 12,
          monthlyRevenue: data.revenue?.monthly || 2400,
          systemAlerts: data.alerts?.count || 0,
          growth: {
            tenants: data.tenants?.growth || '+12%',
            users: data.users?.growth || '+8%',
            revenue: data.revenue?.growth || '+23%',
            alerts: data.alerts?.growth || '-5%',
          }
        };
      }
    } catch (error) {
      console.error('Failed to fetch platform analytics:', error);
    }

    // Return demo data if API fails
    return {
      totalTenants: 3,
      activeTenants: 3,
      totalUsers: 12,
      monthlyRevenue: 2400,
      systemAlerts: 0,
      growth: {
        tenants: '+12%',
        users: '+8%',
        revenue: '+23%',
        alerts: '-5%',
      }
    };
  }

  /**
   * Get platform-wide activity (across all tenants)
   */
  static async getPlatformActivity(): Promise<PlatformActivity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/activity`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.activities || [];
      }
    } catch (error) {
      console.error('Failed to fetch platform activity:', error);
    }

    // Return demo data if API fails
    return [
      {
        id: '1',
        type: 'user_registered',
        tenantName: 'Demo Banking',
        description: 'New user registration',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        type: 'subscription_renewed',
        tenantName: 'Client One Bank',
        description: 'Subscription renewed',
        timestamp: '1 day ago'
      },
      {
        id: '3',
        type: 'settings_updated',
        tenantName: 'Client Two Financial',
        description: 'Settings updated',
        timestamp: '2 days ago'
      }
    ];
  }

  /**
   * Get platform revenue breakdown by subscription plan
   */
  static async getRevenueBreakdown(): Promise<RevenueBreakdown> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/revenue`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.breakdown || {};
      }
    } catch (error) {
      console.error('Failed to fetch revenue breakdown:', error);
    }

    // Return demo data if API fails
    return {
      starter: 480,   // 4 tenants × GHS 120
      professional: 960,  // 2 tenants × GHS 480
      premium: 500,   // 1 tenant × GHS 500
      enterprise: 960,    // 1 tenant × GHS 960
      total: 2900
    };
  }

  /**
   * Get all tenants for platform management
   */
  static async getAllTenants() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/tenants`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.tenants || [];
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }

    return [];
  }

  /**
   * Create a new tenant
   */
  static async createTenant(tenantData: {
    name: string;
    domain: string;
    subscription_plan: string;
    settings?: any;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/tenants`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(tenantData),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to create tenant:', error);
      throw error;
    }
  }

  /**
   * Update tenant settings
   */
  static async updateTenant(tenantId: string, updates: any) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/tenants/${tenantId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to update tenant:', error);
      throw error;
    }
  }

  /**
   * Suspend/activate tenant
   */
  static async updateTenantStatus(tenantId: string, status: 'active' | 'suspended' | 'inactive') {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to update tenant status:', error);
      throw error;
    }
  }
}
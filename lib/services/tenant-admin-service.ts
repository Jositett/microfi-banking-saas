// Tenant Admin Service - Handles tenant-scoped data and operations

export interface TenantStats {
  totalMembers: number;
  activeMembers: number;
  totalAccounts: number;
  totalBalance: number;
  monthlyTransactions: number;
  growth: {
    members: string;
    accounts: string;
    balance: string;
    transactions: string;
  };
}

export interface TenantActivity {
  id: string;
  type: 'member_registered' | 'account_created' | 'transaction_completed' | 'loan_approved';
  memberName: string;
  description: string;
  timestamp: string;
}

export class TenantAdminService {
  private static baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://127.0.0.1:8787';

  private static getHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-Tenant-Host': window.location.host,
    };
  }

  /**
   * Get tenant-scoped analytics (current tenant only)
   */
  static async getTenantAnalytics(): Promise<TenantStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tenant/analytics`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          totalMembers: data.members?.total || 4,
          activeMembers: data.members?.active || 4,
          totalAccounts: data.accounts?.total || 6,
          totalBalance: data.balance?.total || 1000000,
          monthlyTransactions: data.transactions?.monthly || 25,
          growth: {
            members: data.members?.growth || '+15%',
            accounts: data.accounts?.growth || '+20%',
            balance: data.balance?.growth || '+12%',
            transactions: data.transactions?.growth || '+8%',
          }
        };
      }
    } catch (error) {
      console.error('Failed to fetch tenant analytics:', error);
    }

    // Return demo data for current tenant
    return {
      totalMembers: 4,
      activeMembers: 4,
      totalAccounts: 6,
      totalBalance: 1000000,
      monthlyTransactions: 25,
      growth: {
        members: '+15%',
        accounts: '+20%',
        balance: '+12%',
        transactions: '+8%',
      }
    };
  }

  /**
   * Get tenant-scoped activity (current tenant only)
   */
  static async getTenantActivity(): Promise<TenantActivity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tenant/activity`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.activities || [];
      }
    } catch (error) {
      console.error('Failed to fetch tenant activity:', error);
    }

    // Return demo data for current tenant
    return [
      {
        id: '1',
        type: 'member_registered',
        memberName: 'John Doe',
        description: 'New member registration',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        type: 'account_created',
        memberName: 'Jane Smith',
        description: 'Savings account created',
        timestamp: '1 day ago'
      },
      {
        id: '3',
        type: 'loan_approved',
        memberName: 'Mike Wilson',
        description: 'Business loan approved',
        timestamp: '2 days ago'
      }
    ];
  }

  /**
   * Get tenant members
   */
  static async getTenantMembers() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tenant/members`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.members || [];
      }
    } catch (error) {
      console.error('Failed to fetch tenant members:', error);
    }

    return [];
  }

  /**
   * Get tenant settings
   */
  static async getTenantSettings() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tenant/settings`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.settings || {};
      }
    } catch (error) {
      console.error('Failed to fetch tenant settings:', error);
    }

    return {};
  }

  /**
   * Update tenant settings
   */
  static async updateTenantSettings(settings: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/tenant/settings`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(settings),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to update tenant settings:', error);
      throw error;
    }
  }
}
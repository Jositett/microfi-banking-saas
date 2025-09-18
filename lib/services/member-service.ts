// Member Service - Handles member-scoped data and operations

export interface MemberStats {
  totalAccounts: number;
  totalBalance: number;
  monthlyTransactions: number;
  activeSavings: number;
  activeLoans: number;
}

export interface MemberAccount {
  id: string;
  accountNumber: string;
  type: 'savings' | 'current' | 'investment' | 'business';
  balance: number;
  currency: string;
}

export interface MemberTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export class MemberService {
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
   * Get member-scoped stats (current user only)
   */
  static async getMemberStats(): Promise<MemberStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/member/stats`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          totalAccounts: data.accounts?.total || 2,
          totalBalance: data.balance?.total || 225000,
          monthlyTransactions: data.transactions?.monthly || 12,
          activeSavings: data.savings?.active || 1,
          activeLoans: data.loans?.active || 0,
        };
      }
    } catch (error) {
      console.error('Failed to fetch member stats:', error);
    }

    // Return demo data for current member
    return {
      totalAccounts: 2,
      totalBalance: 225000,
      monthlyTransactions: 12,
      activeSavings: 1,
      activeLoans: 0,
    };
  }

  /**
   * Get member accounts
   */
  static async getMemberAccounts(): Promise<MemberAccount[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/accounts`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.accounts || [];
      }
    } catch (error) {
      console.error('Failed to fetch member accounts:', error);
    }

    // Return demo data
    return [
      {
        id: 'acc-1',
        accountNumber: '1234567890',
        type: 'savings',
        balance: 157500,
        currency: 'GHS'
      },
      {
        id: 'acc-2',
        accountNumber: '1234567891',
        type: 'current',
        balance: 89200,
        currency: 'GHS'
      }
    ];
  }

  /**
   * Get member transactions
   */
  static async getMemberTransactions(): Promise<MemberTransaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.transactions || [];
      }
    } catch (error) {
      console.error('Failed to fetch member transactions:', error);
    }

    // Return demo data
    return [
      {
        id: 'txn-1',
        type: 'credit',
        amount: 50000,
        description: 'Salary deposit',
        timestamp: '2 hours ago',
        status: 'completed'
      },
      {
        id: 'txn-2',
        type: 'debit',
        amount: 15000,
        description: 'Transfer to savings',
        timestamp: '1 day ago',
        status: 'completed'
      }
    ];
  }

  /**
   * Create transfer between accounts
   */
  static async createTransfer(data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions/transfer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to create transfer:', error);
      throw error;
    }
  }

  /**
   * Get member profile
   */
  static async getMemberProfile() {
    try {
      const response = await fetch(`${this.baseUrl}/api/member/profile`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.profile || {};
      }
    } catch (error) {
      console.error('Failed to fetch member profile:', error);
    }

    return {};
  }

  /**
   * Update member profile
   */
  static async updateMemberProfile(profile: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/member/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profile),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to update member profile:', error);
      throw error;
    }
  }
}
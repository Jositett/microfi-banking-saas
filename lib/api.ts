import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('API Request:', `${API_BASE_URL}${endpoint}`, config);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('API Error:', error);
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, role?: 'admin' | 'user') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  // Account endpoints
  async getAccounts() {
    return this.request('/api/accounts');
  }

  async createAccount(type: 'savings' | 'current' | 'investment', currency = 'NGN') {
    return this.request('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ type, currency }),
    });
  }

  async getAccountBalance(accountId: string) {
    return this.request(`/api/accounts/${accountId}/balance`);
  }

  // Payment endpoints
  async transfer(fromAccountId: string, toAccountId: string, amount: number, description?: string) {
    return this.request('/api/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromAccountId, toAccountId, amount, description }),
    });
  }

  async getTransactions(limit = 50, offset = 0) {
    return this.request(`/api/payments/transactions?limit=${limit}&offset=${offset}`);
  }

  // Savings endpoints
  async getSavingsPlans() {
    return this.request('/api/savings');
  }

  async createSavingsPlan(data: {
    accountId: string;
    name: string;
    targetAmount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  }) {
    return this.request('/api/savings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Loan endpoints
  async getLoans() {
    return this.request('/api/loans');
  }

  async applyForLoan(amount: number, termMonths: number) {
    return this.request('/api/loans/apply', {
      method: 'POST',
      body: JSON.stringify({ amount, termMonths }),
    });
  }
}

export const api = new ApiClient();
// Multi-tenant API client with tenant context support

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private static baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://127.0.0.1:8787';

  private static getHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add tenant context via host header
    if (typeof window !== 'undefined') {
      headers['X-Tenant-Host'] = window.location.host;
    }

    return headers;
  }

  static async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.message
        };
      }

      return {
        success: true,
        data,
        message: data.message
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  static async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Tenant-specific methods
  static async getAccounts() {
    return this.get('/api/accounts');
  }

  static async createAccount(data: { type: string; currency?: string }) {
    return this.post('/api/accounts', data);
  }

  static async getTransactions(accountId?: string) {
    const endpoint = accountId 
      ? `/api/transactions?account_id=${accountId}`
      : '/api/transactions';
    return this.get(endpoint);
  }

  static async createTransfer(data: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    description?: string;
  }) {
    return this.post('/api/transactions/transfer', data);
  }

  static async processPayment(data: {
    amount: number;
    currency: string;
    gateway: 'paystack' | 'flutterwave';
    account_id: string;
  }) {
    return this.post('/api/payments/process', data);
  }

  // Authentication methods
  static async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  static async logout() {
    const response = await this.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      sessionStorage.removeItem('auth-token');
    }
    return response;
  }

  static async getProfile() {
    return this.get('/api/profile');
  }

  // Admin methods (for admin.microfi.com)
  static async adminLogin(email: string, password: string) {
    return this.post('/admin/auth/login', { email, password });
  }

  static async getTenants() {
    return this.get('/admin/api/tenants');
  }

  static async createTenant(data: {
    name: string;
    domain: string;
    subscription_plan?: string;
    settings?: any;
  }) {
    return this.post('/admin/api/tenants', data);
  }
}
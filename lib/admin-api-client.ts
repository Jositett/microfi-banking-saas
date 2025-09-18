'use client';

class AdminApiClient {
  private baseUrl: string;
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.microfi.com' 
      : 'https://127.0.0.1:8787';
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Platform Analytics
  async getPlatformAnalytics() {
    return this.request('/admin/api/analytics');
  }

  async getPlatformActivity() {
    return this.request('/admin/api/activity');
  }

  // Tenant Management
  async getTenants() {
    return this.request('/admin/api/tenants');
  }

  async createTenant(tenantData: any) {
    return this.request('/admin/api/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(tenantId: string, tenantData: any) {
    return this.request(`/admin/api/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });
  }

  // User Management
  async getUsers() {
    return this.request('/admin/api/users');
  }

  async suspendUser(userId: string) {
    return this.request(`/admin/api/users/${userId}/suspend`, {
      method: 'POST',
    });
  }

  // System Logs
  async getLogs(params?: { limit?: number; offset?: number }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/admin/api/logs${query}`);
  }

  // System Alerts
  async getAlerts() {
    return this.request('/admin/api/alerts');
  }

  async acknowledgeAlert(alertId: string) {
    return this.request(`/admin/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  }

  async resolveAlert(alertId: string) {
    return this.request(`/admin/api/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  }

  // Settings Management
  async getSettings() {
    return this.request('/admin/api/settings');
  }

  async updateSetting(category: string, key: string, value: string) {
    return this.request('/admin/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ category, key, value }),
    });
  }
}

export const adminApiClient = new AdminApiClient();
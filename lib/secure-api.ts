import { webauthnClient } from './webauthn';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

class SecureApiClient {
  private async secureRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle transaction MFA requirement
    if (response.status === 403) {
      const data = await response.json();
      if (data.mfaChallenge) {
        return this.handleTransactionMFA(endpoint, options, data);
      }
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  private async handleTransactionMFA<T>(endpoint: string, options: RequestInit, mfaData: any): Promise<T> {
    try {
      const user = JSON.parse(localStorage.getItem('microfi_user') || '{}');
      const credential = await webauthnClient.authenticateCredential(user.id);
      
      if (credential.verified) {
        // Retry request with MFA headers
        const mfaConfig = {
          ...options,
          headers: {
            ...options.headers,
            'X-MFA-Challenge': JSON.stringify(mfaData.mfaChallenge),
            'X-MFA-Response': JSON.stringify(credential)
          }
        };
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, mfaConfig);
        if (!response.ok) {
          throw new Error('Transaction failed after MFA verification');
        }
        return response.json();
      } else {
        throw new Error('MFA verification failed');
      }
    } catch (error) {
      throw new Error('Transaction MFA required but failed');
    }
  }

  // Secure banking operations
  async transfer(fromAccountId: string, toAccountId: string, amount: number, description?: string) {
    return this.secureRequest('/api/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromAccountId, toAccountId, amount, description })
    });
  }

  async createAccount(type: 'savings' | 'current' | 'investment', currency = 'GHS') {
    return this.secureRequest('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ type, currency })
    });
  }

  async getAccounts() {
    return this.secureRequest('/api/accounts');
  }

  async getTransactions(limit = 50, offset = 0) {
    return this.secureRequest(`/api/payments/transactions?limit=${limit}&offset=${offset}`);
  }

  async applyForLoan(amount: number, termMonths: number) {
    return this.secureRequest('/api/loans/apply', {
      method: 'POST',
      body: JSON.stringify({ amount, termMonths })
    });
  }

  // Admin endpoints
  async getAdminOverview() {
    return this.secureRequest('/api/admin/overview');
  }

  async getAdminActivity() {
    return this.secureRequest('/api/admin/activity');
  }

  async getAdminAlerts() {
    return this.secureRequest('/api/admin/alerts');
  }

  async getAdminUsers(limit = 50, offset = 0) {
    return this.secureRequest(`/api/admin/users?limit=${limit}&offset=${offset}`);
  }
}

export const secureApi = new SecureApiClient();
import type { Env } from '../types/context';

export interface FlutterwaveInitializeResponse {
  status: string;
  message: string;
  data: {
    link: string;
    tx_ref: string;
  };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
  };
}

export class FlutterwaveService {
  constructor(private env: Env) {}
  
  async initializePayment(amount: number, email: string, userId: string, reference?: string) {
    const txRef = reference || `microfi_flw_${userId}_${Date.now()}`;
    
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency: 'NGN',
        redirect_url: `${this.env.WEBAUTHN_ORIGIN}/payment/callback`,
        customer: {
          email,
          name: email.split('@')[0]
        },
        customizations: {
          title: 'MicroFi Banking',
          description: 'Account funding',
          logo: `${this.env.WEBAUTHN_ORIGIN}/logo.png`
        },
        meta: {
          userId,
          source: 'microfi_banking'
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Flutterwave API error: ${response.status} - ${error}`);
    }
    
    const result: FlutterwaveInitializeResponse = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(`Flutterwave initialization failed: ${result.message}`);
    }
    
    return result;
  }

  async verifyPayment(txRef: string) {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${txRef}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Flutterwave verification error: ${response.status} - ${error}`);
    }
    
    const result: FlutterwaveVerifyResponse = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(`Flutterwave verification failed: ${result.message}`);
    }
    
    return result;
  }

  async getBanks() {
    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Flutterwave banks API error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }

  async resolveAccount(accountNumber: string, bankCode: string) {
    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Flutterwave account resolution error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }
}
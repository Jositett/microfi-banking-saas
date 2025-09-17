import type { Env } from '../types/context';

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
    };
  };
}

export class PaystackService {
  constructor(private env: Env) {}
  
  async initializePayment(amount: number, email: string, userId: string, reference?: string) {
    const paymentReference = reference || `microfi_${userId}_${Date.now()}`;
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to kobo
        email,
        reference: paymentReference,
        metadata: { 
          userId,
          source: 'microfi_banking'
        },
        callback_url: `${this.env.WEBAUTHN_ORIGIN}/payment/callback`,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paystack API error: ${response.status} - ${error}`);
    }
    
    const result: PaystackInitializeResponse = await response.json();
    
    if (!result.status) {
      throw new Error(`Paystack initialization failed: ${result.message}`);
    }
    
    return result;
  }

  async verifyPayment(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paystack verification error: ${response.status} - ${error}`);
    }
    
    const result: PaystackVerifyResponse = await response.json();
    
    if (!result.status) {
      throw new Error(`Paystack verification failed: ${result.message}`);
    }
    
    return result;
  }

  async listBanks() {
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paystack banks API error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paystack account resolution error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }

  async createTransferRecipient(name: string, accountNumber: string, bankCode: string) {
    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paystack recipient creation error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }

  async initiateTransfer(amount: number, recipientCode: string, reason: string) {
    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientCode,
        reason
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paystack transfer error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }
}
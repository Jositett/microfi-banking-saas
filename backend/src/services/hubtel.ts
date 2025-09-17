import type { Env } from '../types/context';

export interface HubtelSMSPayload {
  to: string;
  message: string;
  senderId?: string;
  security?: {
    fraudCheck: boolean;
    rateLimit: string;
  };
  metadata?: {
    user_id: string;
    transaction_id?: string;
    amount?: number;
    currency?: string;
  };
}

export interface HubtelSMSResponse {
  success: boolean;
  message_id: string;
  status: string;
  delivery_status?: string;
}

export class HubtelService {
  private clientId: string;
  private clientSecret: string;
  private senderId: string;

  constructor(private env: Env) {
    if (!env.HUBTEL_CLIENT_ID || !env.HUBTEL_CLIENT_SECRET || !env.HUBTEL_SENDER_ID) {
      throw new Error('Hubtel credentials not configured');
    }
    
    this.clientId = env.HUBTEL_CLIENT_ID;
    this.clientSecret = env.HUBTEL_CLIENT_SECRET;
    this.senderId = env.HUBTEL_SENDER_ID;
  }

  // Hubtel uses direct API calls with client credentials in URL parameters
  private buildApiUrl(to: string, message: string): string {
    const baseUrl = 'https://smsc.hubtel.com/v1/messages/send';
    const params = new URLSearchParams({
      clientsecret: this.clientSecret,
      clientid: this.clientId,
      from: this.senderId,
      to: to,
      content: message
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async sendSMS(payload: HubtelSMSPayload): Promise<HubtelSMSResponse> {
    const apiUrl = this.buildApiUrl(payload.to, payload.message);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hubtel SMS error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      message_id: result.MessageId || result.Id || `sms_${Date.now()}`,
      status: result.Status || 'sent',
      delivery_status: result.DeliveryStatus
    };
  }

  async sendTransactionOTP(
    phoneNumber: string, 
    amount: number, 
    currency: string, 
    recipient: string, 
    userId: string, 
    transactionId: string
  ): Promise<{ otp: string; messageId: string; expiresAt: Date }> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create banking-compliant OTP message
    const message = `MicroFi: Confirm transaction of ${amount} ${currency} to ${recipient}. Your OTP is: ${otp}. Do not share this code. Valid for 5 minutes.`;
    
    const payload: HubtelSMSPayload = {
      to: phoneNumber,
      message,
      senderId: this.senderId,
      security: {
        fraudCheck: true,
        rateLimit: "high"
      },
      metadata: {
        user_id: userId,
        transaction_id: transactionId,
        amount,
        currency,
        type: 'transaction_otp'
      }
    };

    const result = await this.sendSMS(payload);
    
    return {
      otp,
      messageId: result.message_id,
      expiresAt: new Date(Date.now() + 300000) // 5 minutes
    };
  }

  async sendLoginAlert(
    phoneNumber: string, 
    ipAddress: string, 
    userAgent: string, 
    userId: string
  ): Promise<HubtelSMSResponse> {
    const message = `MicroFi: New login detected from ${ipAddress}. If this wasn't you, contact support immediately.`;
    
    const payload: HubtelSMSPayload = {
      to: phoneNumber,
      message,
      senderId: this.senderId,
      security: {
        fraudCheck: true,
        rateLimit: "medium"
      },
      metadata: {
        user_id: userId,
        type: 'login_alert',
        ip_address: ipAddress
      }
    };

    return this.sendSMS(payload);
  }

  async sendAccountVerificationOTP(
    phoneNumber: string, 
    userId: string
  ): Promise<{ otp: string; messageId: string; expiresAt: Date }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const message = `MicroFi: Your account verification OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    
    const payload: HubtelSMSPayload = {
      to: phoneNumber,
      message,
      senderId: this.senderId,
      security: {
        fraudCheck: true,
        rateLimit: "high"
      },
      metadata: {
        user_id: userId,
        type: 'account_verification'
      }
    };

    const result = await this.sendSMS(payload);
    
    return {
      otp,
      messageId: result.message_id,
      expiresAt: new Date(Date.now() + 300000)
    };
  }
}
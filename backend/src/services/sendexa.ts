import type { Env } from '../types/context';

export interface SendexaEmailPayload {
  to: string;
  subject: string;
  html: string;
  security?: {
    fraud_check: boolean;
    rate_limit: string;
  };
  metadata?: {
    user_id: string;
    transaction_id?: string;
    amount?: number;
    currency?: string;
  };
}

export interface SendexaSMSPayload {
  to: string;
  message: string;
  sender_id?: string;
  security?: {
    fraud_check: boolean;
    rate_limit: string;
    message_type: string;
  };
  metadata?: {
    user_id: string;
    transaction_id?: string;
    amount?: number;
    currency?: string;
  };
}

export class SendexaService {
  private auth: string;

  constructor(private env: Env) {
    // Mock service - replace with real provider
    console.log('⚠️ Using mock Sendexa service - replace with real email/SMS provider');
    this.auth = 'mock_auth';
  }

  async sendEmail(payload: SendexaEmailPayload) {
    // Mock implementation - replace with real email service
    console.log('📧 Mock Email Sent:', {
      to: payload.to,
      subject: payload.subject,
      security: payload.security,
      metadata: payload.metadata
    });
    
    return {
      success: true,
      message_id: `mock_email_${Date.now()}`,
      status: 'sent'
    };
  }

  async sendSMS(payload: SendexaSMSPayload) {
    // Mock implementation - replace with real SMS service
    console.log('📱 Mock SMS Sent:', {
      to: payload.to,
      message: payload.message.substring(0, 50) + '...',
      security: payload.security,
      metadata: payload.metadata
    });
    
    return {
      success: true,
      message_id: `mock_sms_${Date.now()}`,
      status: 'sent'
    };
  }

  // Banking-specific methods
  async sendAccountVerificationEmail(email: string, verificationToken: string, userId: string) {
    const verificationLink = `${this.env.WEBAUTHN_ORIGIN}/verify?token=${verificationToken}`;
    
    const payload: SendexaEmailPayload = {
      to: email,
      subject: "MicroFi Account Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0066cc;">MicroFi Account Verification</h1>
          <p>Click the link below to verify your account:</p>
          <a href="${verificationLink}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify My Account
          </a>
          <p style="margin-top: 20px;">This link expires in 24 hours.</p>
          <p style="font-size: 12px; color: #666;">For security, never share this link with anyone.</p>
        </div>
      `,
      security: {
        fraud_check: true,
        rate_limit: "high"
      },
      metadata: {
        user_id: userId
      }
    };
    
    return this.sendEmail(payload);
  }

  async sendTransactionOTP(phoneNumber: string, otp: string, amount: number, currency: string, recipient: string, userId: string, transactionId: string) {
    const payload: SendexaSMSPayload = {
      to: phoneNumber,
      message: `MicroFi: Confirm transaction of ${amount} ${currency} to ${recipient}. Your OTP is: ${otp}. Do not share this code. Valid for 5 minutes.`,
      sender_id: "MicroFi",
      security: {
        fraud_check: true,
        rate_limit: "high",
        message_type: "transactional"
      },
      metadata: {
        user_id: userId,
        transaction_id: transactionId,
        amount,
        currency
      }
    };
    
    return this.sendSMS(payload);
  }

  async sendLoginAlert(email: string, ipAddress: string, userAgent: string, userId: string) {
    const payload: SendexaEmailPayload = {
      to: email,
      subject: "MicroFi Login Alert",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0066cc;">Login Alert</h1>
          <p>A new login was detected on your MicroFi account:</p>
          <ul>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>IP Address:</strong> ${ipAddress}</li>
            <li><strong>Device:</strong> ${userAgent}</li>
          </ul>
          <p>If this wasn't you, please contact support immediately.</p>
        </div>
      `,
      security: {
        fraud_check: true,
        rate_limit: "high"
      },
      metadata: {
        user_id: userId
      }
    };
    
    return this.sendEmail(payload);
  }
}
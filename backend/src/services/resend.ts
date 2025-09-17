import { Resend } from 'resend';
import type { Env } from '../types/context';

export interface ResendEmailPayload {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
  metadata?: {
    user_id: string;
    transaction_id?: string;
    type: string;
  };
}

export interface ResendEmailResponse {
  success: boolean;
  message_id: string;
  status: string;
}

export class ResendService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private env: Env) {
    if (!env.RESEND_API_KEY) {
      throw new Error('Resend API key not configured');
    }
    
    this.resend = new Resend(env.RESEND_API_KEY);
    this.fromEmail = 'MicroFi <onboarding@resend.dev>';
  }

  async sendEmail(payload: ResendEmailPayload): Promise<ResendEmailResponse> {
    try {
      const emailData = {
        from: this.fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        headers: {
          'X-User-ID': payload.metadata?.user_id || 'unknown',
          'X-Transaction-ID': payload.metadata?.transaction_id || 'none',
          'X-Email-Type': payload.metadata?.type || 'general',
          ...payload.headers
        }
      };

      const result = await this.resend.emails.send(emailData);
      
      return {
        success: true,
        message_id: result.data?.id || 'unknown',
        status: 'sent'
      };
    } catch (error) {
      console.error('Resend email error:', error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  async sendAccountVerificationEmail(
    email: string, 
    verificationToken: string, 
    userId: string
  ): Promise<ResendEmailResponse> {
    const verificationLink = `${this.env.WEBAUTHN_ORIGIN}/verify?token=${verificationToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0066cc; margin: 0;">MicroFi Banking</h1>
          <p style="color: #666; margin: 5px 0;">Secure Digital Banking Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Account Verification Required</h2>
          <p style="color: #555; line-height: 1.6;">
            Welcome to MicroFi! To complete your account setup and ensure the security of your banking services, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify My Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            This verification link expires in 24 hours for your security.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            🔒 For your security, never share this verification link with anyone.<br>
            If you didn't create a MicroFi account, please ignore this email.
          </p>
        </div>
      </div>
    `;

    const payload: ResendEmailPayload = {
      to: email,
      subject: 'MicroFi Account Verification - Action Required',
      html,
      metadata: {
        user_id: userId,
        type: 'account_verification'
      }
    };

    return this.sendEmail(payload);
  }

  async sendTransactionConfirmation(
    email: string,
    amount: number,
    currency: string,
    recipient: string,
    transactionId: string,
    userId: string
  ): Promise<ResendEmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0066cc; margin: 0;">MicroFi Banking</h1>
          <p style="color: #666; margin: 5px 0;">Transaction Confirmation</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 30px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #28a745;">
          <h2 style="color: #28a745; margin-top: 0;">✅ Transaction Successful</h2>
          <p style="color: #555; line-height: 1.6;">
            Your transaction has been processed successfully.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; color: #333; text-align: right; font-size: 18px; font-weight: bold;">
                  ${amount} ${currency}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Recipient:</td>
                <td style="padding: 8px 0; color: #333; text-align: right;">${recipient}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #333; text-align: right; font-family: monospace;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #333; text-align: right;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            🔒 This is an automated confirmation. Keep this email for your records.<br>
            If you have any questions, contact our support team.
          </p>
        </div>
      </div>
    `;

    const payload: ResendEmailPayload = {
      to: email,
      subject: `Transaction Confirmed - ${amount} ${currency}`,
      html,
      metadata: {
        user_id: userId,
        transaction_id: transactionId,
        type: 'transaction_confirmation'
      }
    };

    return this.sendEmail(payload);
  }

  async sendLoginAlert(
    email: string,
    ipAddress: string,
    userAgent: string,
    location: string,
    userId: string
  ): Promise<ResendEmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0066cc; margin: 0;">MicroFi Banking</h1>
          <p style="color: #666; margin: 5px 0;">Security Alert</p>
        </div>
        
        <div style="background: #fff3cd; padding: 30px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #ffc107;">
          <h2 style="color: #856404; margin-top: 0;">🔐 New Login Detected</h2>
          <p style="color: #555; line-height: 1.6;">
            We detected a new login to your MicroFi account. If this was you, no action is needed.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0; color: #333; text-align: right;">${new Date().toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">IP Address:</td>
                <td style="padding: 8px 0; color: #333; text-align: right; font-family: monospace;">${ipAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #333; text-align: right;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Device:</td>
                <td style="padding: 8px 0; color: #333; text-align: right; font-size: 12px;">${userAgent.substring(0, 50)}...</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 3px solid #dc3545;">
            <p style="color: #721c24; margin: 0; font-weight: bold;">
              ⚠️ If this wasn't you, please contact our support team immediately and change your password.
            </p>
          </div>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            🔒 This is an automated security alert from MicroFi Banking.<br>
            For your protection, we monitor all account access.
          </p>
        </div>
      </div>
    `;

    const payload: ResendEmailPayload = {
      to: email,
      subject: 'MicroFi Security Alert - New Login Detected',
      html,
      metadata: {
        user_id: userId,
        type: 'login_alert'
      }
    };

    return this.sendEmail(payload);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userId: string
  ): Promise<ResendEmailResponse> {
    const resetLink = `${this.env.WEBAUTHN_ORIGIN}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0066cc; margin: 0;">MicroFi Banking</h1>
          <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset your MicroFi account password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            This reset link expires in 1 hour for your security.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            🔒 If you didn't request a password reset, please ignore this email.<br>
            Your account remains secure and no changes have been made.
          </p>
        </div>
      </div>
    `;

    const payload: ResendEmailPayload = {
      to: email,
      subject: 'MicroFi Password Reset - Action Required',
      html,
      metadata: {
        user_id: userId,
        type: 'password_reset'
      }
    };

    return this.sendEmail(payload);
  }
}
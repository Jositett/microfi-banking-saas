import type { Env } from '../main';

export interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  sessionToken?: string;
}

export class AuditService {
  constructor(private env: Env) {}

  async logEvent(event: AuditEvent) {
    const logId = `${Date.now()}_${this.generateId()}`;
    const logEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      id: logId,
      source: 'microfi_banking'
    };

    try {
      // Store in KV with appropriate TTL based on risk level
      const ttl = this.getTTL(event.riskLevel);
      await this.env.AUDIT_LOGS.put(logId, JSON.stringify(logEntry), { expirationTtl: ttl });

      // For critical events, also log to console for immediate monitoring
      if (event.riskLevel === 'critical') {
        console.error('CRITICAL AUDIT EVENT:', logEntry);
      }

      return logId;
    } catch (error) {
      console.error('Audit logging failed:', error);
      throw error;
    }
  }

  async getAuditTrail(userId: string, limit = 50) {
    try {
      const logs = [];
      const list = await this.env.AUDIT_LOGS.list({ prefix: '', limit: 1000 });
      
      for (const key of list.keys) {
        const log = await this.env.AUDIT_LOGS.get(key.name);
        if (log) {
          const parsed = JSON.parse(log);
          if (parsed.userId === userId) {
            logs.push(parsed);
          }
        }
      }
      
      return logs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to retrieve audit trail:', error);
      return [];
    }
  }

  private getTTL(riskLevel: string): number {
    switch (riskLevel) {
      case 'critical': return 31536000 * 7; // 7 years for critical events
      case 'high': return 31536000 * 3; // 3 years for high risk
      case 'medium': return 31536000; // 1 year for medium risk
      case 'low': return 2592000; // 30 days for low risk
      default: return 31536000;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Pre-defined audit event types for banking operations
export const AuditEvents = {
  // Authentication events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  MFA_SETUP: 'mfa_setup',
  MFA_SUCCESS: 'mfa_success',
  MFA_FAILED: 'mfa_failed',
  LOGOUT: 'logout',
  SESSION_EXPIRED: 'session_expired',

  // Account events
  ACCOUNT_CREATED: 'account_created',
  ACCOUNT_VIEWED: 'account_viewed',
  BALANCE_CHECKED: 'balance_checked',

  // Transaction events
  TRANSFER_INITIATED: 'transfer_initiated',
  TRANSFER_COMPLETED: 'transfer_completed',
  TRANSFER_FAILED: 'transfer_failed',
  PAYMENT_PROCESSED: 'payment_processed',
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit',

  // Administrative events
  USER_CREATED: 'user_created',
  USER_SUSPENDED: 'user_suspended',
  ADMIN_ACCESS: 'admin_access',
  SETTINGS_CHANGED: 'settings_changed',

  // Security events
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  DATA_EXPORT: 'data_export',

  // Communication events
  EMAIL_SENT: 'email_sent',
  SMS_SENT: 'sms_sent',
  NOTIFICATION_SENT: 'notification_sent'
};
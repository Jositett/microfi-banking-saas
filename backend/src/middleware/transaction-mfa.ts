import { Context, Next } from 'hono';
import { WebAuthnService } from '../services/webauthn';
import { AuditService, AuditEvents } from '../services/audit';
import type { Env } from '../main';

// Transaction-level MFA verification for high-value operations
export const transactionMFA = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const method = c.req.method;
  const path = c.req.path;
  
  // Only apply to financial transaction endpoints
  const transactionEndpoints = [
    '/api/payments/transfer',
    '/api/payments/withdraw',
    '/api/accounts',
    '/api/loans/apply'
  ];
  
  if (method !== 'POST' || !transactionEndpoints.some(endpoint => path.startsWith(endpoint))) {
    await next();
    return;
  }
  
  try {
    const body = await c.req.json();
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'User context required' }, 401);
    }
    
    // Check if transaction requires additional MFA based on amount/risk
    const requiresTransactionMFA = await shouldRequireTransactionMFA(body, user, c.env);
    
    if (requiresTransactionMFA) {
      const mfaChallenge = c.req.header('X-MFA-Challenge');
      const mfaResponse = c.req.header('X-MFA-Response');
      
      if (!mfaChallenge || !mfaResponse) {
        // Generate MFA challenge for transaction
        const webauthnService = new WebAuthnService(c.env);
        const challenge = await webauthnService.generateAuthenticationOptions(user.id);
        
        return c.json({
          error: 'Transaction MFA required',
          mfaChallenge: challenge,
          transactionId: generateTransactionId()
        }, 403);
      }
      
      // Verify MFA response
      const webauthnService = new WebAuthnService(c.env);
      const verification = await webauthnService.verifyAuthentication(user.id, JSON.parse(mfaResponse));
      
      if (!verification.verified) {
        // Log failed MFA attempt
        const auditService = new AuditService(c.env);
        await auditService.logEvent({
          userId: user.id,
          action: AuditEvents.MFA_FAILED,
          resource: 'transaction',
          details: { endpoint: path, reason: 'transaction_mfa_failed' },
          riskLevel: 'high',
          ipAddress: c.req.header('CF-Connecting-IP'),
          userAgent: c.req.header('User-Agent')
        });
        
        return c.json({ error: 'Transaction MFA verification failed' }, 401);
      }
      
      // Log successful transaction MFA
      const auditService = new AuditService(c.env);
      await auditService.logEvent({
        userId: user.id,
        action: AuditEvents.MFA_SUCCESS,
        resource: 'transaction',
        details: { endpoint: path, transactionType: getTransactionType(path) },
        riskLevel: 'medium',
        ipAddress: c.req.header('CF-Connecting-IP'),
        userAgent: c.req.header('User-Agent')
      });
    }
    
    // Restore request body for next middleware
    c.req.json = () => Promise.resolve(body);
    
  } catch (error) {
    console.error('Transaction MFA error:', error);
    return c.json({ error: 'Transaction verification failed' }, 500);
  }
  
  await next();
};

async function shouldRequireTransactionMFA(body: any, user: any, env: Env): Promise<boolean> {
  // High-value transactions (>1000 GHS = 100000 kobo)
  if (body.amount && body.amount > 100000) {
    return true;
  }
  
  // External transfers
  if (body.toAccountId && !body.toAccountId.startsWith('acc-')) {
    return true;
  }
  
  // Loan applications
  if (body.loanAmount) {
    return true;
  }
  
  // New account creation
  if (!body.amount && body.type) {
    return true;
  }
  
  // Admin operations always require MFA
  if (user.role === 'admin') {
    return true;
  }
  
  return false;
}

function getTransactionType(path: string): string {
  if (path.includes('transfer')) return 'transfer';
  if (path.includes('withdraw')) return 'withdrawal';
  if (path.includes('accounts')) return 'account_operation';
  if (path.includes('loans')) return 'loan_application';
  return 'unknown';
}

function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
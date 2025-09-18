import { Context, Next } from 'hono';

/**
 * MFI Payment Compliance Middleware
 * CRITICAL: Enforces software-only platform rules to avoid legal issues
 */

// BLOCKED PAYMENT ROUTES - Return 403 for any payment processing
const BLOCKED_PAYMENT_ROUTES = [
  '/payment',
  '/transfer', 
  '/deposit',
  '/withdraw',
  '/charge',
  '/payout',
  '/split-payment',
  '/fund-routing',
  '/process-payment',
  '/send-money',
  '/receive-money',
  '/wallet'
];

// BLOCKED FUND OPERATIONS - Prevent any fund handling
const BLOCKED_FUND_OPERATIONS = [
  'charge',
  'transfer',
  'payout',
  'withdraw',
  'deposit',
  'fund',
  'money',
  'payment-process'
];

export const complianceMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path.toLowerCase();
  const method = c.req.method;

  // Block all payment processing routes
  if (BLOCKED_PAYMENT_ROUTES.some(route => path.includes(route))) {
    return c.json({
      error: 'Payment processing not available',
      message: 'MicroFi is a software platform only - we do not process payments',
      compliance: 'BoG/CBN exempt software provider',
      solution: 'Use your own Paystack/MTN MoMo account for payments',
      legal_status: 'Software provider - no payment license required'
    }, 403);
  }

  // Block fund-related operations in any endpoint
  if (BLOCKED_FUND_OPERATIONS.some(op => path.includes(op))) {
    return c.json({
      error: 'Fund operations prohibited',
      message: 'Platform does not handle, hold, or route customer funds',
      compliance: 'MFI payment compliance enforced',
      redirect: 'Contact tenant for payment processing'
    }, 403);
  }

  // Block POST/PUT/DELETE on transaction endpoints (read-only allowed)
  if (path.includes('/transaction') && ['POST', 'PUT', 'DELETE'].includes(method)) {
    return c.json({
      error: 'Transaction processing prohibited',
      message: 'Transactions are read-only for display purposes only',
      allowed_methods: ['GET'],
      compliance: 'Software platform - no fund processing'
    }, 403);
  }

  await next();
};

export const auditComplianceMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path;
  const method = c.req.method;
  const userAgent = c.req.header('User-Agent');
  const ip = c.req.header('CF-Connecting-IP');

  // Log any attempts to access blocked payment routes
  if (BLOCKED_PAYMENT_ROUTES.some(route => path.includes(route)) ||
      BLOCKED_FUND_OPERATIONS.some(op => path.includes(op))) {
    
    console.log('🚨 COMPLIANCE ALERT: Blocked payment operation attempt', {
      path,
      method,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      blocked_reason: 'MFI payment compliance'
    });

    // Store in audit logs for compliance tracking
    try {
      await c.env.AUDIT_LOGS?.put(
        `compliance_block_${Date.now()}`,
        JSON.stringify({
          type: 'COMPLIANCE_BLOCK',
          path,
          method,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
          reason: 'Payment processing attempt blocked'
        }),
        { expirationTtl: 86400 * 365 } // Keep for 1 year
      );
    } catch (error) {
      console.error('Failed to log compliance event:', error);
    }
  }

  await next();
};

export const readOnlyTransactionMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path;
  const method = c.req.method;

  // Allow only GET requests for transaction data
  if (path.includes('/transaction') && method !== 'GET') {
    return c.json({
      error: 'Read-only transaction access',
      message: 'Transactions can only be viewed, not processed',
      allowed_operations: ['view', 'list', 'export'],
      prohibited_operations: ['create', 'update', 'delete', 'process'],
      compliance: 'Software platform limitation'
    }, 403);
  }

  // Ensure tenant provides their own API keys for payment data
  if (path.includes('/transaction') && method === 'GET') {
    const tenantApiKey = c.req.header('X-Tenant-Paystack-Key') || 
                        c.req.header('X-Tenant-MTN-Key');
    
    if (!tenantApiKey) {
      return c.json({
        error: 'Tenant API key required',
        message: 'Provide your own Paystack/MTN MoMo API key to view transactions',
        compliance: 'Platform does not store payment credentials',
        instructions: 'Add X-Tenant-Paystack-Key header with your API key'
      }, 401);
    }
  }

  await next();
};

export const softwareOnlyMiddleware = async (c: Context, next: Next) => {
  // Add compliance headers to all responses
  c.header('X-Platform-Type', 'Software-Only');
  c.header('X-Payment-Processing', 'Disabled');
  c.header('X-Fund-Handling', 'Prohibited');
  c.header('X-Compliance-Status', 'BoG-CBN-Exempt');
  c.header('X-Legal-Notice', 'Software-Provider-Only');

  await next();
};
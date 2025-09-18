import type { Context, Next } from 'hono';

export const cbmpComplianceMiddleware = async (c: Context, next: Next) => {
  const COMPLETELY_BLOCKED = [
    '/payment', '/transfer', '/deposit', '/withdraw', '/charge',
    '/payout', '/gateway', '/paystack', '/flutterwave', '/momo',
    '/balance', '/transaction', '/fund', '/wallet', '/billing'
  ];
  
  const path = c.req.path.toLowerCase();
  
  // Block any payment-related operations
  if (COMPLETELY_BLOCKED.some(route => path.includes(route))) {
    return c.json({
      error: 'CBMP Compliance: Payment features completely removed',
      message: 'MicroFi is pure business management software only',
      compliance: 'BoG/CBN compliant - zero payment code',
      alternative: 'Use CSV upload for business data import',
      status: 'payment_processing_disabled'
    }, 403);
  }
  
  // Add compliance headers to every response
  c.header('X-CBMP-Compliance', 'business-management-only');
  c.header('X-Payment-Processing', 'disabled');
  c.header('X-Regulatory-Status', 'bog-cbn-compliant');
  c.header('X-Software-Type', 'pure-business-management');
  
  await next();
};

export const businessOnlyMiddleware = async (c: Context, next: Next) => {
  // Ensure only business management operations are allowed
  const allowedPaths = [
    '/auth', '/health', '/api/business', '/api/customers', 
    '/api/loans', '/api/csv', '/api/staff', '/api/documents'
  ];
  
  const path = c.req.path.toLowerCase();
  const isAllowed = allowedPaths.some(allowed => path.startsWith(allowed));
  
  if (!isAllowed && path.startsWith('/api/')) {
    return c.json({
      error: 'CBMP Compliance: Only business management APIs are available',
      message: 'This endpoint has been removed for regulatory compliance',
      compliance: 'BoG/CBN compliant - business management only',
      availableEndpoints: allowedPaths
    }, 403);
  }
  
  await next();
};

export const csvOnlyMiddleware = async (c: Context, next: Next) => {
  // For data import endpoints, ensure CSV-only approach
  if (c.req.path.includes('/import') && c.req.method === 'POST') {
    const contentType = c.req.header('content-type') || '';
    
    // Allow JSON for CSV data processing, but validate content
    if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return c.json({
        error: 'CBMP Compliance: Only CSV data import is allowed',
        message: 'Use CSV file upload for business data import',
        compliance: 'No real-time API connections to payment systems'
      }, 400);
    }
  }
  
  await next();
};

export const auditComplianceMiddleware = async (c: Context, next: Next) => {
  const startTime = Date.now();
  
  await next();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Log all requests for compliance audit
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: c.req.method,
    path: c.req.path,
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('CF-Connecting-IP'),
    duration,
    status: c.res.status,
    compliance: 'cbmp-business-management-only'
  };
  
  // Store in audit logs (KV or database)
  try {
    await c.env?.AUDIT_LOGS?.put(
      `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      JSON.stringify(logEntry),
      { expirationTtl: 86400 * 30 } // 30 days retention
    );
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};
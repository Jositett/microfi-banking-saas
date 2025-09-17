import type { Context, Next } from 'hono';
import type { HonoContext } from '../types/hono';

export const productionSecurity = async (c: HonoContext, next: Next) => {
  // Environment-based security
  const isProduction = c.env.ENVIRONMENT === 'production';
  
  if (isProduction) {
    // Enforce HTTPS in production
    const protocol = c.req.header('X-Forwarded-Proto') || 'http';
    if (protocol !== 'https') {
      return c.json({ error: 'HTTPS required' }, 400);
    }
    
    // Strict security headers for production
    c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    c.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';");
  }
  
  await next();
};

export const jwtOnlyAuth = async (c: HonoContext, next: Next) => {
  // In production, only allow JWT tokens
  const isProduction = c.env.ENVIRONMENT === 'production';
  
  if (isProduction) {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token || token.startsWith('demo_token_')) {
      return c.json({ 
        error: 'Production authentication required',
        message: 'Demo tokens not allowed in production'
      }, 401);
    }
  }
  
  await next();
};

export const auditProduction = async (c: HonoContext, next: Next) => {
  const startTime = Date.now();
  
  await next();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Log performance metrics in production
  if (c.env.ENVIRONMENT === 'production') {
    const logEntry = {
      method: c.req.method,
      path: c.req.path,
      duration,
      status: c.res.status,
      ip: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // Store in audit logs with TTL
    const logId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await c.env.AUDIT_LOGS.put(logId, JSON.stringify(logEntry), {
      expirationTtl: 2592000 // 30 days
    });
  }
};
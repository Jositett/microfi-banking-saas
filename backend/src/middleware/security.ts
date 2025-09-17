import { Context, Next } from 'hono';
import type { Env } from '../main';

// NIST SP 800-63B Level 3 Security Headers
export const securityHeaders = async (c: Context, next: Next) => {
  // Banking-grade CSP
  c.header('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'none'; " +
    "frame-src 'none';"
  );
  
  // HSTS for banking compliance
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Anti-clickjacking
  c.header('X-Frame-Options', 'DENY');
  
  // MIME type sniffing protection
  c.header('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy for privacy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy - disable sensitive features
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  
  // XSS protection
  c.header('X-XSS-Protection', '1; mode=block');
  
  await next();
};

// Rate limiting for banking operations
export const rateLimiting = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const endpoint = c.req.path;
  const method = c.req.method;
  
  // Different limits for different operations
  const limits = {
    '/auth/login': { requests: 5, window: 300 }, // 5 attempts per 5 minutes
    '/webauthn/': { requests: 10, window: 300 }, // 10 MFA attempts per 5 minutes
    '/api/payments/': { requests: 20, window: 3600 }, // 20 transactions per hour
    'default': { requests: 100, window: 3600 } // 100 requests per hour default
  };
  
  const limit = Object.entries(limits).find(([path]) => endpoint.startsWith(path))?.[1] || limits.default;
  const key = `rate_limit:${clientIP}:${endpoint}:${method}`;
  
  try {
    const current = await c.env.USER_SESSIONS.get(key);
    const count = current ? parseInt(current) : 0;
    
    if (count >= limit.requests) {
      return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
    }
    
    await c.env.USER_SESSIONS.put(key, (count + 1).toString(), { expirationTtl: limit.window });
  } catch (error) {
    console.error('Rate limiting error:', error);
  }
  
  await next();
};

// MFA verification for sensitive operations
export const mfaVerification = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const sensitiveEndpoints = ['/api/payments/', '/api/accounts/', '/api/admin/'];
  const endpoint = c.req.path;
  
  if (!sensitiveEndpoints.some(path => endpoint.startsWith(path))) {
    await next();
    return;
  }
  
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  
  try {
    const session = await c.env.USER_SESSIONS.get(token);
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }
    
    const sessionData = JSON.parse(session);
    
    // Check MFA verification
    if (!sessionData.mfaVerified) {
      return c.json({ error: 'MFA verification required' }, 401);
    }
    
    // Check session expiry
    if (Date.now() > sessionData.expiresAt) {
      await c.env.USER_SESSIONS.delete(token);
      return c.json({ error: 'Session expired' }, 401);
    }
    
    // Update last activity
    sessionData.lastActivity = Date.now();
    await c.env.USER_SESSIONS.put(token, JSON.stringify(sessionData), {
      expirationTtl: Math.floor((sessionData.expiresAt - Date.now()) / 1000)
    });
    
    // Set user context for audit logging
    c.set('user', { id: sessionData.userId, sessionToken: token });
    
  } catch (error) {
    console.error('MFA verification error:', error);
    return c.json({ error: 'Session validation failed' }, 500);
  }
  
  await next();
};
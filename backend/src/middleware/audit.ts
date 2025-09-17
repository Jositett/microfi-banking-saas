import { Context, Next } from 'hono';
import type { Env } from '../main';
import type { JWTPayload } from './auth';

export const auditMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  await next();
  
  const user = c.get('user');
  if (!user) return;
  
  const method = c.req.method;
  const path = c.req.path;
  const status = c.res.status;
  
  // Only log sensitive operations
  if (method !== 'GET' && (path.includes('/payments') || path.includes('/accounts') || path.includes('/loans'))) {
    try {
      const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await c.env.AUDIT_LOGS.put(logId, JSON.stringify({
        userId: user.id,
        action: `${method} ${path}`,
        resourceType: path.split('/')[2] || 'unknown',
        status,
        timestamp: new Date().toISOString()
      }), {
        expirationTtl: 2592000 // 30 days
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }
};
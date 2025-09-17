import { Context, Next } from 'hono';
import type { Env } from '../main';
import type { JWTPayload } from './auth';

export const auditMiddleware = async (c: Context<{ Bindings: Env; Variables: { user: JWTPayload } }>, next: Next) => {
  await next();
  
  const user = c.get('user');
  if (!user) return;
  
  const method = c.req.method;
  const path = c.req.path;
  const status = c.res.status;
  
  // Only log sensitive operations
  if (method !== 'GET' && (path.includes('/payments') || path.includes('/accounts') || path.includes('/loans'))) {
    try {
      const logId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO audit_logs (id, user_id, action, resource_type, details, timestamp)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        logId,
        user.userId,
        `${method} ${path}`,
        path.split('/')[2] || 'unknown',
        JSON.stringify({ status, timestamp: new Date().toISOString() })
      ).run();
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }
};
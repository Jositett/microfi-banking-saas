import { Context, Next } from 'hono';
import { verifyJWT } from '../lib/crypto';
import type { HonoContext } from '../types/hono';
import type { User } from '../types/context';

export interface User extends User {
  tenant_id: string;
}
import type { Tenant } from './tenant-resolver';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  tenant_id?: string;
}

export const authMiddleware = async (c: HonoContext, next: Next) => {
  // Skip auth for health check and auth endpoints
  if (c.req.path === '/health' || c.req.path.startsWith('/auth/')) {
    await next();
    return;
  }

  const tenant: Tenant = c.get('tenant');
  const isAdminRoute = c.req.path.startsWith('/api/admin/');
  
  // Get token from Authorization header or cookie
  let token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    const cookieHeader = c.req.header('Cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.auth_token;
    }
  }

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    let user: User;
    
    // Handle demo tokens (for development)
    if (token.startsWith('demo_token_')) {
      const parts = token.split('_');
      if (parts.length >= 3) {
        const userId = parts[2];
        
        // Fetch user from database
        let dbUser;
        if (isAdminRoute) {
          // Admin users don't need tenant isolation
          dbUser = await c.env.DB.prepare(
            'SELECT id, email, role, tenant_id FROM users WHERE id = ?'
          ).bind(userId).first();
        } else {
          // Regular users need tenant isolation
          dbUser = await c.env.DB.prepare(
            'SELECT id, email, role, tenant_id FROM users WHERE id = ? AND tenant_id = ?'
          ).bind(userId, tenant?.id || 'demo-tenant').first();
        }
        
        if (!dbUser) {
          return c.json({ error: 'User not found' }, 401);
        }
        
        user = {
          id: dbUser.id as string,
          email: dbUser.email as string,
          role: dbUser.role as 'user' | 'admin',
          tenant_id: dbUser.tenant_id as string
        };
      } else {
        return c.json({ error: 'Invalid demo token format' }, 401);
      }
    } else {
      // Handle JWT tokens (for production)
      const payload = await verifyJWT(token, c.env.JWT_SECRET) as JWTPayload;
      
      // Skip tenant validation for admin routes
      if (!isAdminRoute) {
        // Verify tenant context matches token
        if (tenant && payload.tenant_id && payload.tenant_id !== tenant.id) {
          return c.json({ 
            error: 'Invalid tenant context',
            message: 'Token does not match current tenant'
          }, 403);
        }
      }
      
      // Fetch fresh user data from database
      let dbUser;
      if (isAdminRoute) {
        // Admin users don't need tenant isolation
        dbUser = await c.env.DB.prepare(
          'SELECT id, email, role, tenant_id FROM users WHERE id = ?'
        ).bind(payload.userId).first();
      } else {
        // Regular users need tenant isolation
        dbUser = await c.env.DB.prepare(
          'SELECT id, email, role, tenant_id FROM users WHERE id = ? AND tenant_id = ?'
        ).bind(payload.userId, tenant?.id || payload.tenant_id).first();
      }
      
      if (!dbUser) {
        return c.json({ error: 'User not found' }, 401);
      }
      
      user = {
        id: dbUser.id as string,
        email: dbUser.email as string,
        role: dbUser.role as 'user' | 'admin',
        tenant_id: dbUser.tenant_id as string
      };
    }
    
    // Set user in context
    c.set('user', user);
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

export const requireMFA = async (c: HonoContext, next: Next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Check if MFA is required for this operation
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (token && !token.startsWith('demo_token_')) {
    // For JWT tokens, check MFA session
    const session = await c.env.USER_SESSIONS.get(token);
    if (!session) {
      return c.json({ error: 'MFA verification required' }, 401);
    }
    
    const sessionData = JSON.parse(session);
    if (!sessionData.mfaVerified || sessionData.expiresAt < Date.now()) {
      return c.json({ error: 'MFA verification expired' }, 401);
    }
  }
  
  await next();
};

export const requireAdmin = async (c: HonoContext, next: Next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
};

export const securityHeaders = async (c: HonoContext, next: Next) => {
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  await next();
};
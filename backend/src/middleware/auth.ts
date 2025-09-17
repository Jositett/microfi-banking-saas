import { Context, Next } from 'hono';
import { verifyJWT } from '../lib/crypto';
import type { HonoContext } from '../types/hono';
import type { User } from '../types/context';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export const authMiddleware = async (c: HonoContext, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  // Demo mode: Accept demo tokens
  if (token.startsWith('demo_token_')) {
    const userId = token.split('_')[2];
    
    // Get user from database
    const user = await c.env.DB.prepare(`
      SELECT id, email, role FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }
    
    c.set('user', {
      id: user.id,
      email: user.email,
      role: user.role,
      mfaSetup: true,
      createdAt: new Date().toISOString()
    });
    await next();
    return;
  }
  
  // Production mode: Verify JWT
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET) as JWTPayload;
    c.set('user', {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      mfaSetup: true,
      createdAt: new Date().toISOString()
    });
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
};
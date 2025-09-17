import { Context, Next } from 'hono';
import { verifyJWT } from '../lib/crypto';
import type { Env } from '../main';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET) as JWTPayload;
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
};
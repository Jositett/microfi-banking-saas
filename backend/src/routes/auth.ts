import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { hashPassword, verifyPassword, generateJWT } from '../lib/crypto';
import type { Env } from '../main';

const authRouter = new Hono<{ Bindings: Env }>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']).optional().default('user')
});

// Login endpoint
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  console.log('Login attempt for:', email);
  
  try {
    // Find user by email
    const user = await c.env.DB.prepare(`
      SELECT id, email, password_hash, role, kyc_status 
      FROM users 
      WHERE email = ?
    `).bind(email).first();
    
    if (!user) {
      console.log('User not found:', email);
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role });
    
    // Verify password (simplified for demo - use proper hashing in production)
    const isValidPassword = password === user.password_hash;
    if (!isValidPassword) {
      console.log('Password mismatch for:', email);
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    console.log('Password verified for:', email);
    
    // Generate JWT token if JWT_SECRET is available, otherwise use demo token
    let token: string;
    if (c.env.JWT_SECRET) {
      token = await generateJWT({
        userId: user.id,
        email: user.email,
        role: user.role
      }, c.env.JWT_SECRET, '24h');
    } else {
      // Fallback to demo token for development
      token = `demo_token_${user.id}_${Date.now()}`;
    }
    
    const response = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        kycStatus: user.kyc_status
      },
      token,
      expiresIn: 86400 // 24 hours in seconds
    };
    
    console.log('Login successful, returning:', response);
    return c.json(response);
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Register endpoint
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, role } = c.req.valid('json');
  
  try {
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();
    
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }
    
    // For demo, store password as-is (use proper hashing in production)
    const passwordHash = password;
    const userId = crypto.randomUUID();
    
    // Create user
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, role, kyc_status, created_at)
      VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(userId, email, passwordHash, role).run();
    
    // Generate JWT token if JWT_SECRET is available, otherwise use demo token
    let token: string;
    if (c.env.JWT_SECRET) {
      token = await generateJWT({
        userId,
        email,
        role
      }, c.env.JWT_SECRET, '24h');
    } else {
      // Fallback to demo token for development
      token = `demo_token_${userId}_${Date.now()}`;
    }
    
    return c.json({
      user: {
        id: userId,
        email,
        role,
        kycStatus: 'pending'
      },
      token,
      expiresIn: 86400
    }, 201);
    
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Logout endpoint for tenants and members
authRouter.post('/logout', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    // Clear server-side session if token exists
    if (token) {
      // Remove from active sessions
      await c.env.USER_SESSIONS?.delete(token);
    }
    
    // Audit log
    const user = c.get('user');
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, tenant_id, action, details, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).bind(
      user?.id || 'unknown',
      user?.tenant_id || 'unknown', 
      'user_logout', 
      JSON.stringify({ token: token?.substring(0, 10) + '...' })
    ).run();

    return c.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ 
      success: false, 
      error: 'Logout failed' 
    }, 500);
  }
});

export { authRouter };
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
  
  try {
    // Find user by email
    const user = await c.env.DB.prepare(`
      SELECT id, email, password_hash, role, kyc_status 
      FROM users 
      WHERE email = ?
    `).bind(email).first();
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash as string);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate JWT token
    const token = await generateJWT(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      c.env.JWT_SECRET
    );
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        kycStatus: user.kyc_status
      },
      token,
      expiresIn: 86400 // 24 hours in seconds
    });
    
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
    
    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    
    // Create user
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, role, kyc_status, created_at)
      VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(userId, email, passwordHash, role).run();
    
    // Generate JWT token
    const token = await generateJWT(
      { userId, email, role },
      c.env.JWT_SECRET
    );
    
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

export { authRouter };
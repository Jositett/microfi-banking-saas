import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { signJWT } from '../../lib/crypto';
import type { HonoContext } from '../../types/hono';

const adminAuthRouter = new Hono<HonoContext>();

// Admin login
adminAuthRouter.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, 400);
    }

    // Check admin user
    const admin = await c.env.DB.prepare(
      'SELECT * FROM admin_users WHERE email = ? AND status = ?'
    ).bind(email, 'active').first();

    if (!admin) {
      return c.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, 401);
    }

    // For demo, accept 'admin123' password
    if (password !== 'admin123') {
      return c.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, 401);
    }

    // Generate admin JWT token
    const token = await signJWT({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    }, c.env.JWT_SECRET);

    // Set secure cookie
    setCookie(c, 'admin-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 3600 // 1 hour
    });

    return c.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({ 
      success: false, 
      error: 'Login failed' 
    }, 500);
  }
});

// Admin logout
adminAuthRouter.post('/logout', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    // Clear server-side session if token exists
    if (token) {
      // Add token to blacklist or remove from active sessions
      await c.env.USER_SESSIONS?.delete(`admin_${token}`);
    }
    
    // Clear cookie
    setCookie(c, 'admin-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 0
    });

    // Audit log
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (action, details, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    ).bind('admin_logout', JSON.stringify({ token: token?.substring(0, 10) + '...' })).run();

    return c.json({ 
      success: true, 
      message: 'Platform admin logged out successfully' 
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    return c.json({ 
      success: false, 
      error: 'Logout failed' 
    }, 500);
  }
});

// Get admin profile
adminAuthRouter.get('/profile', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ 
      success: false, 
      error: 'Authentication required' 
    }, 401);
  }

  try {
    // For demo, return mock admin data
    return c.json({
      success: true,
      user: {
        id: 'admin-001',
        email: 'admin@microfi.com',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'super_admin'
      }
    });
  } catch (error) {
    console.error('Admin profile error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to get profile' 
    }, 500);
  }
});

export { adminAuthRouter };
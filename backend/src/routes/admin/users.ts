import { Hono } from 'hono';
import type { HonoContext } from '../../types/hono';

const adminUsersRouter = new Hono<HonoContext>();

// Get all platform users
adminUsersRouter.get('/', async (c) => {
  try {
    const users = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        u.last_login,
        t.name as tenant_name,
        CASE 
          WHEN u.last_login > datetime('now', '-7 days') THEN 'active'
          WHEN u.last_login IS NULL THEN 'pending'
          ELSE 'inactive'
        END as status
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      ORDER BY u.created_at DESC
      LIMIT 100
    `).all();

    return c.json({ 
      success: true, 
      users: users.results || [] 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, 500);
  }
});

export { adminUsersRouter };
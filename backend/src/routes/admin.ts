import { Hono } from 'hono';
import { requireAdmin } from '../middleware/auth';
import type { Env } from '../main';

const adminRouter = new Hono<{ Bindings: Env }>();

// Apply admin middleware to all routes
adminRouter.use('*', requireAdmin);

// Get system overview stats
adminRouter.get('/overview', async (c) => {
  try {
    // Get user count
    const userCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    
    // Get account count
    const accountCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM accounts').first();
    
    // Get transaction volume for current month
    const transactionVolume = await c.env.DB.prepare(`
      SELECT SUM(amount) as total FROM transactions 
      WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')
      AND status = 'completed'
    `).first();
    
    // Get system alerts (failed transactions, security events)
    const alertCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM transactions 
      WHERE status = 'failed' 
      AND date(timestamp) >= date('now', '-7 days')
    `).first();
    
    return c.json({
      users: {
        total: userCount?.count || 0,
        change: '+8.2%' // Could calculate from historical data
      },
      accounts: {
        total: accountCount?.count || 0,
        change: '+12.1%'
      },
      transactionVolume: {
        total: (transactionVolume?.total || 0) / 100, // Convert from kobo
        change: '+15.3%'
      },
      alerts: {
        total: alertCount?.count || 0,
        change: '-5.2%'
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return c.json({ error: 'Failed to fetch overview data' }, 500);
  }
});

// Get recent activity
adminRouter.get('/activity', async (c) => {
  try {
    const activities = await c.env.DB.prepare(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.description,
        t.timestamp,
        t.status,
        u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.timestamp DESC
      LIMIT 10
    `).all();
    
    return c.json({
      activities: activities.results.map(activity => ({
        id: activity.id,
        type: activity.type,
        amount: activity.amount / 100, // Convert from kobo
        description: activity.description,
        timestamp: activity.timestamp,
        status: activity.status,
        userEmail: activity.user_email
      }))
    });
  } catch (error) {
    console.error('Admin activity error:', error);
    return c.json({ error: 'Failed to fetch activity data' }, 500);
  }
});

// Get system alerts
adminRouter.get('/alerts', async (c) => {
  try {
    const alerts = await c.env.DB.prepare(`
      SELECT 
        'failed_transaction' as type,
        'Failed Transaction' as title,
        'Transaction ID: ' || id as message,
        timestamp,
        'high' as severity
      FROM transactions 
      WHERE status = 'failed' 
      AND date(timestamp) >= date('now', '-7 days')
      ORDER BY timestamp DESC
      LIMIT 5
    `).all();
    
    return c.json({
      alerts: alerts.results
    });
  } catch (error) {
    console.error('Admin alerts error:', error);
    return c.json({ error: 'Failed to fetch alerts data' }, 500);
  }
});

// Get user management data
adminRouter.get('/users', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    const users = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.kyc_status,
        u.created_at,
        COUNT(a.id) as account_count,
        COALESCE(SUM(a.balance), 0) as total_balance
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id
      GROUP BY u.id, u.email, u.role, u.kyc_status, u.created_at
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return c.json({
      users: users.results.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        kycStatus: user.kyc_status,
        createdAt: user.created_at,
        accountCount: user.account_count,
        totalBalance: user.total_balance / 100 // Convert from kobo
      }))
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return c.json({ error: 'Failed to fetch users data' }, 500);
  }
});

export { adminRouter };
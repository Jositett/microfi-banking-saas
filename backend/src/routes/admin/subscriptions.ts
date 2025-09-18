import { Hono } from 'hono';
import type { HonoContext } from '../../types/hono';

const adminSubscriptionsRouter = new Hono<HonoContext>();

// Get all tenant subscriptions
adminSubscriptionsRouter.get('/', async (c) => {
  try {
    const subscriptions = await c.env.DB.prepare(`
      SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        t.subscription_plan as plan,
        t.status,
        CASE t.subscription_plan
          WHEN 'starter' THEN 120
          WHEN 'professional' THEN 280
          WHEN 'premium' THEN 500
          WHEN 'enterprise' THEN 800
          ELSE 120
        END as monthly_fee,
        DATE(t.created_at, '+1 month') as next_billing,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT tr.id) as transaction_count,
        COALESCE(SUM(LENGTH(tr.description)), 0) / 1024 as storage_mb
      FROM tenants t
      LEFT JOIN users u ON t.id = u.tenant_id
      LEFT JOIN transactions tr ON t.id = tr.tenant_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `).all();

    const formattedSubscriptions = subscriptions.results.map((sub: any) => ({
      tenant_id: sub.tenant_id,
      tenant_name: sub.tenant_name,
      plan: sub.plan,
      status: sub.status,
      monthly_fee: sub.monthly_fee,
      next_billing: sub.next_billing,
      usage: {
        users: sub.user_count || 0,
        transactions: sub.transaction_count || 0,
        storage_mb: Math.round(sub.storage_mb || 0)
      }
    }));

    return c.json({ 
      success: true, 
      subscriptions: formattedSubscriptions 
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch subscriptions' 
    }, 500);
  }
});

// Update tenant subscription plan
adminSubscriptionsRouter.put('/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const { plan } = await c.req.json();

    if (!['starter', 'professional', 'premium', 'enterprise'].includes(plan)) {
      return c.json({ 
        success: false, 
        error: 'Invalid subscription plan' 
      }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE tenants 
      SET subscription_plan = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(plan, tenantId).run();

    // Log the plan change
    await c.env.DB.prepare(`
      INSERT INTO audit_logs (tenant_id, action, details, timestamp)
      VALUES (?, 'subscription_plan_changed', ?, CURRENT_TIMESTAMP)
    `).bind(tenantId, JSON.stringify({ 
      old_plan: 'unknown', 
      new_plan: plan,
      changed_by: 'admin'
    })).run();

    return c.json({ 
      success: true, 
      message: 'Subscription plan updated successfully' 
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update subscription' 
    }, 500);
  }
});

// Get subscription analytics
adminSubscriptionsRouter.get('/analytics', async (c) => {
  try {
    const analytics = await c.env.DB.prepare(`
      SELECT 
        subscription_plan as plan,
        COUNT(*) as tenant_count,
        SUM(
          CASE subscription_plan
            WHEN 'starter' THEN 120
            WHEN 'professional' THEN 280
            WHEN 'premium' THEN 500
            WHEN 'enterprise' THEN 800
            ELSE 120
          END
        ) as monthly_revenue,
        AVG(
          CASE subscription_plan
            WHEN 'starter' THEN 120
            WHEN 'professional' THEN 280
            WHEN 'premium' THEN 500
            WHEN 'enterprise' THEN 800
            ELSE 120
          END
        ) as avg_revenue_per_tenant
      FROM tenants 
      WHERE status = 'active'
      GROUP BY subscription_plan
    `).all();

    const totalRevenue = await c.env.DB.prepare(`
      SELECT SUM(
        CASE subscription_plan
          WHEN 'starter' THEN 120
          WHEN 'professional' THEN 280
          WHEN 'premium' THEN 500
          WHEN 'enterprise' THEN 800
          ELSE 120
        END
      ) as total_mrr,
      COUNT(*) as total_tenants
      FROM tenants 
      WHERE status = 'active'
    `).first();

    return c.json({
      success: true,
      analytics: {
        by_plan: analytics.results,
        totals: {
          mrr: totalRevenue?.total_mrr || 0,
          tenants: totalRevenue?.total_tenants || 0,
          arpu: totalRevenue?.total_tenants > 0 
            ? (totalRevenue.total_mrr / totalRevenue.total_tenants) 
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    }, 500);
  }
});

export { adminSubscriptionsRouter };
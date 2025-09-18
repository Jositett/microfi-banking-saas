import { Hono } from 'hono';
import type { HonoContext } from '../../types/hono';

const adminAnalyticsRouter = new Hono<HonoContext>();

// Get platform analytics
adminAnalyticsRouter.get('/', async (c) => {
  try {
    const range = c.req.query('range') || '30d';
    const daysBack = range === '7d' ? 7 : range === '90d' ? 90 : range === '1y' ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Revenue metrics
    const revenueQuery = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT id) as tenants,
        SUM(
          CASE subscription_plan
            WHEN 'starter' THEN 120
            WHEN 'professional' THEN 280
            WHEN 'premium' THEN 500
            WHEN 'enterprise' THEN 800
            ELSE 120
          END
        ) as revenue
      FROM tenants 
      WHERE created_at >= ? AND status = 'active'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).bind(startDate.toISOString()).all();

    // Current month revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentMonthRevenue = await c.env.DB.prepare(`
      SELECT SUM(
        CASE subscription_plan
          WHEN 'starter' THEN 120
          WHEN 'professional' THEN 280
          WHEN 'premium' THEN 500
          WHEN 'enterprise' THEN 800
          ELSE 120
        END
      ) as revenue
      FROM tenants 
      WHERE created_at >= ? AND status = 'active'
    `).bind(currentMonth.toISOString()).first();

    // Previous month revenue
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    previousMonth.setDate(1);
    const previousMonthEnd = new Date(currentMonth);
    previousMonthEnd.setDate(0);
    
    const previousMonthRevenue = await c.env.DB.prepare(`
      SELECT SUM(
        CASE subscription_plan
          WHEN 'starter' THEN 120
          WHEN 'professional' THEN 280
          WHEN 'premium' THEN 500
          WHEN 'enterprise' THEN 800
          ELSE 120
        END
      ) as revenue
      FROM tenants 
      WHERE created_at >= ? AND created_at <= ? AND status = 'active'
    `).bind(previousMonth.toISOString(), previousMonthEnd.toISOString()).first();

    // Tenant metrics
    const tenantStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as new_this_month
      FROM tenants
    `).bind(currentMonth.toISOString()).first();

    // Plan distribution
    const planDistribution = await c.env.DB.prepare(`
      SELECT 
        subscription_plan as plan,
        COUNT(*) as count,
        SUM(
          CASE subscription_plan
            WHEN 'starter' THEN 120
            WHEN 'professional' THEN 280
            WHEN 'premium' THEN 500
            WHEN 'enterprise' THEN 800
            ELSE 120
          END
        ) as revenue
      FROM tenants 
      WHERE status = 'active'
      GROUP BY subscription_plan
    `).all();

    // Usage metrics
    const usageStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT t.id) as total_transactions,
        COUNT(DISTINCT t.id) * 1.0 / COUNT(DISTINCT u.tenant_id) as avg_transactions_per_tenant
      FROM users u
      LEFT JOIN transactions t ON u.tenant_id = t.tenant_id
      WHERE u.created_at >= ?
    `).bind(startDate.toISOString()).first();

    // Top features (mock data for now)
    const topFeatures = [
      { feature: 'Accounts', usage_count: tenantStats?.active * 3 || 0 },
      { feature: 'Transfers', usage_count: tenantStats?.active * 2 || 0 },
      { feature: 'Reports', usage_count: tenantStats?.active * 1.5 || 0 },
      { feature: 'Settings', usage_count: tenantStats?.active * 1 || 0 },
    ];

    // Calculate growth rate
    const currentRev = currentMonthRevenue?.revenue || 0;
    const previousRev = previousMonthRevenue?.revenue || 1;
    const growthRate = ((currentRev - previousRev) / previousRev) * 100;

    const analytics = {
      revenue: {
        current_month: currentRev,
        previous_month: previousRev,
        growth_rate: growthRate,
        daily_data: revenueQuery.results || []
      },
      tenants: {
        total: tenantStats?.total || 0,
        active: tenantStats?.active || 0,
        new_this_month: tenantStats?.new_this_month || 0,
        churn_rate: 2.5, // Mock data
        by_plan: planDistribution.results || []
      },
      usage: {
        total_users: usageStats?.total_users || 0,
        total_transactions: usageStats?.total_transactions || 0,
        avg_transactions_per_tenant: usageStats?.avg_transactions_per_tenant || 0,
        top_features: topFeatures
      },
      performance: {
        avg_response_time: 85, // Mock data
        uptime_percentage: 99.9,
        error_rate: 0.1,
        support_tickets: 3
      }
    };

    return c.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    }, 500);
  }
});

export { adminAnalyticsRouter };
import { Hono } from 'hono';
import type { HonoContext } from '../../types/hono';

const adminTenantsRouter = new Hono<HonoContext>();

// Get all tenants with statistics
adminTenantsRouter.get('/', async (c) => {
  try {
    const tenants = await c.env.DB.prepare(`
      SELECT 
        t.*,
        ts.company_name,
        ts.currency,
        ts.primary_color,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT a.id) as account_count,
        COALESCE(SUM(a.balance), 0) as total_balance
      FROM tenants t
      LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id
      LEFT JOIN users u ON t.id = u.tenant_id
      LEFT JOIN accounts a ON t.id = a.tenant_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `).all();

    return c.json({ 
      success: true, 
      tenants: tenants.results 
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch tenants' 
    }, 500);
  }
});

// Create new tenant
adminTenantsRouter.post('/', async (c) => {
  try {
    const { name, domain, subscription_plan = 'starter', settings = {} } = await c.req.json();

    if (!name || !domain) {
      return c.json({ 
        success: false, 
        error: 'Name and domain are required' 
      }, 400);
    }

    const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const settingsId = `settings-${tenantId}`;

    // Create tenant
    await c.env.DB.prepare(`
      INSERT INTO tenants (id, name, domain, subscription_plan, status)
      VALUES (?, ?, ?, ?, 'active')
    `).bind(tenantId, name, domain, subscription_plan).run();

    // Create tenant settings
    await c.env.DB.prepare(`
      INSERT INTO tenant_settings (
        id, tenant_id, company_name, primary_color, currency, timezone
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      settingsId,
      tenantId,
      settings.company_name || name,
      settings.primary_color || '#3b82f6',
      settings.currency || 'GHS',
      settings.timezone || 'Africa/Accra'
    ).run();

    return c.json({ 
      success: true, 
      tenant: {
        id: tenantId,
        name,
        domain,
        subscription_plan,
        status: 'active'
      }
    }, 201);
  } catch (error) {
    console.error('Error creating tenant:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to create tenant' 
    }, 500);
  }
});

export { adminTenantsRouter };
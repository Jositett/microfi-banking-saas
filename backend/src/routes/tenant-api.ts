import { Hono } from 'hono';
import type { HonoContext } from '../types/hono';

const tenantApiRouter = new Hono<HonoContext>();

// Tenant resolution endpoint
tenantApiRouter.get('/resolve', async (c) => {
  const tenant = c.get('tenant');
  
  if (!tenant) {
    return c.json({
      success: false,
      error: 'Tenant not found'
    }, 404);
  }

  return c.json({
    success: true,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      settings: tenant.settings
    }
  });
});

export { tenantApiRouter };
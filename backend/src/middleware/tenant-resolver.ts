import { Context, Next } from 'hono';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  custom_domain?: string;
  status: 'active' | 'suspended' | 'inactive';
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  settings?: {
    logo_url?: string;
    primary_color: string;
    currency: string;
    timezone: string;
    company_name?: string;
  };
}

export const tenantResolver = async (c: Context, next: Next) => {
  const host = c.req.header('host') || '';
  const isDevelopment = ['localhost', '127.0.0.1'].some(dev => host.includes(dev));
  
  // Skip tenant resolution for development and health checks
  if (isDevelopment || c.req.path === '/health') {
    // Set default demo tenant for development
    const demoTenant: Tenant = {
      id: 'demo-tenant',
      name: 'Demo Banking',
      domain: 'demo.microfi.com',
      status: 'active',
      subscription_plan: 'enterprise',
      settings: {
        primary_color: '#3b82f6',
        currency: 'GHS',
        timezone: 'Africa/Accra',
        company_name: 'Demo Banking Corp'
      }
    };
    c.set('tenant', demoTenant);
    await next();
    return;
  }

  try {
    // Extract subdomain or use full domain for custom domains
    const subdomain = host.split('.')[0];
    const fullDomain = host;
    
    // Query tenant by subdomain pattern or custom domain
    const tenant = await c.env.DB.prepare(`
      SELECT t.*, ts.logo_url, ts.primary_color, ts.currency, ts.timezone, ts.company_name
      FROM tenants t
      LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id
      WHERE t.domain = ? OR t.custom_domain = ? OR t.domain = ?
    `).bind(`${subdomain}.microfi.com`, fullDomain, fullDomain).first();

    if (!tenant) {
      return c.json({ 
        error: 'Tenant not found',
        message: `No tenant configured for domain: ${host}`,
        code: 'TENANT_NOT_FOUND'
      }, 404);
    }

    if (tenant.status !== 'active') {
      return c.json({ 
        error: 'Tenant suspended',
        message: 'This banking instance is currently unavailable',
        code: 'TENANT_SUSPENDED'
      }, 403);
    }

    // Structure tenant data
    const tenantData: Tenant = {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      custom_domain: tenant.custom_domain,
      status: tenant.status,
      subscription_plan: tenant.subscription_plan,
      settings: {
        logo_url: tenant.logo_url,
        primary_color: tenant.primary_color || '#3b82f6',
        currency: tenant.currency || 'GHS',
        timezone: tenant.timezone || 'Africa/Accra',
        company_name: tenant.company_name || tenant.name
      }
    };

    c.set('tenant', tenantData);
    await next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    return c.json({ 
      error: 'Tenant resolution failed',
      message: 'Unable to resolve tenant context',
      code: 'TENANT_RESOLUTION_ERROR'
    }, 500);
  }
};

export const requireTenant = async (c: Context, next: Next) => {
  const tenant = c.get('tenant');
  if (!tenant) {
    return c.json({ 
      error: 'Tenant context required',
      code: 'TENANT_CONTEXT_MISSING'
    }, 400);
  }
  await next();
};
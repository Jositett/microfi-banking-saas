import { Hono } from 'hono';
import { GatewayEncryptionService } from '../services/gateway-encryption';
import type { HonoContext } from '../types/hono';

const tenantGatewaysRouter = new Hono<HonoContext>();

// Get tenant gateway configurations
tenantGatewaysRouter.get('/', async (c) => {
  try {
    const tenantId = c.get('tenant')?.id;
    if (!tenantId) return c.json({ error: 'Tenant required' }, 400);

    const gateways = await c.env.DB.prepare(`
      SELECT id, gateway_type, status, created_at, updated_at
      FROM tenant_gateways 
      WHERE tenant_id = ?
    `).bind(tenantId).all();

    return c.json({ 
      success: true, 
      gateways: gateways.results || [] 
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch gateways' }, 500);
  }
});

// Configure gateway (encrypt and store keys)
tenantGatewaysRouter.post('/', async (c) => {
  try {
    const tenantId = c.get('tenant')?.id;
    if (!tenantId) return c.json({ error: 'Tenant required' }, 400);

    const { gateway_type, config } = await c.req.json();
    
    // Encrypt the configuration
    const { encrypted, iv } = await GatewayEncryptionService.encryptGatewayConfig(
      tenantId,
      config,
      c.env.GATEWAY_MASTER_KEY
    );

    // Store encrypted config
    const result = await c.env.DB.prepare(`
      INSERT OR REPLACE INTO tenant_gateways 
      (id, tenant_id, gateway_type, encrypted_config, encryption_iv, status, updated_at)
      VALUES (?, ?, ?, ?, ?, 'inactive', CURRENT_TIMESTAMP)
    `).bind(
      `${tenantId}-${gateway_type}`,
      tenantId,
      gateway_type,
      encrypted,
      iv
    ).run();

    // Store in KV as backup
    await c.env.TENANT_GATEWAYS.put(
      `${tenantId}-${gateway_type}`,
      JSON.stringify({ encrypted, iv, gateway_type })
    );

    return c.json({ 
      success: true, 
      message: 'Gateway configured successfully',
      id: result.meta.last_row_id 
    });
  } catch (error) {
    return c.json({ error: 'Failed to configure gateway' }, 500);
  }
});

// Test gateway connection
tenantGatewaysRouter.post('/:gatewayId/test', async (c) => {
  try {
    const tenantId = c.get('tenant')?.id;
    const gatewayId = c.req.param('gatewayId');
    
    // Retrieve and decrypt config
    const gateway = await c.env.DB.prepare(`
      SELECT encrypted_config, encryption_iv, gateway_type
      FROM tenant_gateways 
      WHERE id = ? AND tenant_id = ?
    `).bind(gatewayId, tenantId).first();

    if (!gateway) {
      return c.json({ error: 'Gateway not found' }, 404);
    }

    const config = await GatewayEncryptionService.decryptGatewayConfig(
      tenantId,
      gateway.encrypted_config,
      gateway.encryption_iv,
      c.env.GATEWAY_MASTER_KEY
    );

    // Test connection based on gateway type
    let testResult = false;
    if (gateway.gateway_type === 'paystack') {
      const response = await fetch('https://api.paystack.co/bank', {
        headers: { 'Authorization': `Bearer ${config.secret_key}` }
      });
      testResult = response.ok;
    }

    return c.json({ 
      success: true, 
      connected: testResult,
      message: testResult ? 'Connection successful' : 'Connection failed'
    });
  } catch (error) {
    return c.json({ error: 'Test failed' }, 500);
  }
});

// Activate/deactivate gateway
tenantGatewaysRouter.patch('/:gatewayId/status', async (c) => {
  try {
    const tenantId = c.get('tenant')?.id;
    const gatewayId = c.req.param('gatewayId');
    const { status } = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE tenant_gateways 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND tenant_id = ?
    `).bind(status, gatewayId, tenantId).run();

    return c.json({ 
      success: true, 
      message: `Gateway ${status}` 
    });
  } catch (error) {
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

export { tenantGatewaysRouter };
import { Hono } from 'hono';
import type { Env } from '../main';

const gatewayRouter = new Hono<{ Bindings: Env }>();

// CBMP Compliance: Block ALL gateway-related routes
gatewayRouter.all('*', async (c) => {
  return c.json({
    error: 'CBMP Compliance: Gateway features completely removed',
    message: 'Payment gateway configurations are prohibited for compliance',
    compliance: 'BoG/CBN compliant - zero payment gateway code',
    alternative: 'Use CSV upload for business data from your licensed payment systems',
    status: 'gateway_configuration_disabled'
  }, 403);
});

export { gatewayRouter };
import { Hono } from 'hono';
import type { Env } from '../main';

const paymentsRouter = new Hono<{ Bindings: Env }>();

// CBMP Compliance: Block ALL payment-related routes
paymentsRouter.all('*', async (c) => {
  return c.json({
    error: 'CBMP Compliance: Payment features completely removed',
    message: 'MicroFi is pure business management software only',
    compliance: 'BoG/CBN compliant - zero payment code',
    alternative: 'Use CSV upload for business data import',
    status: 'payment_processing_disabled'
  }, 403);
});

export { paymentsRouter };
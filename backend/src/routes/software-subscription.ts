import { Hono } from 'hono';
import { SoftwareSubscriptionService } from '../services/software-subscription';
import type { HonoContext } from '../types/hono';

const subscriptionRouter = new Hono<HonoContext>();

// Get subscription plans
subscriptionRouter.get('/plans', async (c) => {
  const plans = Object.values(SoftwareSubscriptionService.getSubscriptionPlan('starter') ? {
    starter: SoftwareSubscriptionService.getSubscriptionPlan('starter'),
    professional: SoftwareSubscriptionService.getSubscriptionPlan('professional'),
    enterprise: SoftwareSubscriptionService.getSubscriptionPlan('enterprise')
  } : {});

  return c.json({
    success: true,
    plans: plans.filter(Boolean)
  });
});

// Get tenant's current subscription
subscriptionRouter.get('/current', async (c) => {
  const tenant = c.get('tenant');
  
  if (!tenant) {
    return c.json({ error: 'Tenant context required' }, 400);
  }

  const subscription = await SoftwareSubscriptionService.getTenantSubscription(
    c.env.DB,
    tenant.id
  );

  return c.json({
    success: true,
    subscription
  });
});

// Create subscription (software billing only)
subscriptionRouter.post('/create', async (c) => {
  const tenant = c.get('tenant');
  const { planId, months = 1 } = await c.req.json();

  if (!tenant) {
    return c.json({ error: 'Tenant context required' }, 400);
  }

  const result = await SoftwareSubscriptionService.processSubscriptionPayment(
    c.env.DB,
    tenant.id,
    planId,
    months
  );

  return c.json(result);
});

export { subscriptionRouter };
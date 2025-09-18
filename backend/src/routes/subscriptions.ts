import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SubscriptionService } from '../services/subscription';
import type { Env } from '../main';

const subscriptionsRouter = new Hono<{ Bindings: Env }>();

const subscribeSchema = z.object({
  planId: z.enum(['starter', 'growth', 'professional']),
  paymentReference: z.string()
});

// Get all available plans
subscriptionsRouter.get('/plans', async (c) => {
  try {
    const plans = SubscriptionService.getAllPlans();
    return c.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return c.json({ error: 'Failed to get plans' }, 500);
  }
});

// Get specific plan details
subscriptionsRouter.get('/plans/:planId', async (c) => {
  try {
    const planId = c.req.param('planId');
    const plan = SubscriptionService.getPlan(planId);
    
    if (!plan) {
      return c.json({ error: 'Plan not found' }, 404);
    }
    
    return c.json({ plan });
  } catch (error) {
    console.error('Get plan error:', error);
    return c.json({ error: 'Failed to get plan' }, 500);
  }
});

// Subscribe to a plan
subscriptionsRouter.post('/subscribe', zValidator('json', subscribeSchema), async (c) => {
  const { planId, paymentReference } = c.req.valid('json');
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  try {
    const result = await SubscriptionService.createSubscription(
      c.env.DB,
      user.id,
      planId,
      paymentReference
    );

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({
      message: 'Subscription created successfully',
      subscription: result.subscription
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return c.json({ error: 'Subscription failed' }, 500);
  }
});

// Get user's current subscription
subscriptionsRouter.get('/current', async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  try {
    const subscription = await SubscriptionService.getUserSubscription(c.env.DB, user.id);
    
    if (!subscription) {
      return c.json({ message: 'No active subscription' }, 404);
    }

    return c.json({ subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    return c.json({ error: 'Failed to get subscription' }, 500);
  }
});

// Extend subscription
subscriptionsRouter.post('/extend', async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  try {
    const { days, paymentReference } = await c.req.json();
    
    if (!days || days <= 0) {
      return c.json({ error: 'Invalid extension period' }, 400);
    }

    const result = await SubscriptionService.extendSubscription(
      c.env.DB,
      user.id,
      days,
      paymentReference
    );

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({
      message: 'Subscription extended successfully',
      newEndDate: result.newEndDate
    });
  } catch (error) {
    console.error('Extend subscription error:', error);
    return c.json({ error: 'Failed to extend subscription' }, 500);
  }
});

// Check subscription limits
subscriptionsRouter.get('/limits/:action', async (c) => {
  const user = c.get('user');
  const action = c.req.param('action') as 'add_member' | 'transaction';
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  try {
    const result = await SubscriptionService.checkSubscriptionLimits(
      c.env.DB,
      user.id,
      action
    );

    return c.json(result);
  } catch (error) {
    console.error('Check limits error:', error);
    return c.json({ error: 'Failed to check limits' }, 500);
  }
});

export { subscriptionsRouter };
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../main';
import type { JWTPayload } from '../middleware/auth';

const savingsRouter = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

const createSavingsPlanSchema = z.object({
  accountId: z.string(),
  name: z.string(),
  targetAmount: z.number().positive(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  endDate: z.string().optional()
});

// Get user savings plans
savingsRouter.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    const plans = await c.env.DB.prepare(`
      SELECT sp.*, a.account_number
      FROM savings_plans sp
      JOIN accounts a ON sp.account_id = a.id
      WHERE sp.user_id = ?
      ORDER BY sp.created_at DESC
    `).bind(user.userId).all();
    
    return c.json({ savingsPlans: plans.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch savings plans' }, 500);
  }
});

// Create savings plan
savingsRouter.post('/', zValidator('json', createSavingsPlanSchema), async (c) => {
  const user = c.get('user');
  const { accountId, name, targetAmount, frequency, endDate } = c.req.valid('json');
  
  try {
    // Verify account ownership
    const account = await c.env.DB.prepare(`
      SELECT id FROM accounts WHERE id = ? AND user_id = ? AND status = 'active'
    `).bind(accountId, user.userId).first();
    
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }
    
    const planId = crypto.randomUUID();
    
    await c.env.DB.prepare(`
      INSERT INTO savings_plans (id, user_id, account_id, name, target_amount, current_amount, frequency, start_date, end_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, DATE('now'), ?, 'active', CURRENT_TIMESTAMP)
    `).bind(planId, user.userId, accountId, name, targetAmount, frequency, endDate || null).run();
    
    const plan = await c.env.DB.prepare(`
      SELECT * FROM savings_plans WHERE id = ?
    `).bind(planId).first();
    
    return c.json({ savingsPlan: plan }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create savings plan' }, 500);
  }
});

export { savingsRouter };
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../main';
import type { JWTPayload } from '../middleware/auth';

const accountsRouter = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

const createAccountSchema = z.object({
  type: z.enum(['savings', 'current', 'investment']),
  currency: z.string().default('NGN')
});

// Get user accounts
accountsRouter.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    const accounts = await c.env.DB.prepare(`
      SELECT id, account_number, balance, currency, type, status, created_at
      FROM accounts 
      WHERE user_id = ? AND status = 'active'
      ORDER BY created_at DESC
    `).bind(user.userId).all();
    
    return c.json({ accounts: accounts.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch accounts' }, 500);
  }
});

// Create new account
accountsRouter.post('/', zValidator('json', createAccountSchema), async (c) => {
  const user = c.get('user');
  const { type, currency } = c.req.valid('json');
  
  try {
    const accountId = crypto.randomUUID();
    const accountNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    await c.env.DB.prepare(`
      INSERT INTO accounts (id, user_id, account_number, balance, currency, type, status, created_at)
      VALUES (?, ?, ?, 0, ?, ?, 'active', CURRENT_TIMESTAMP)
    `).bind(accountId, user.userId, accountNumber, currency, type).run();
    
    const account = await c.env.DB.prepare(`
      SELECT id, account_number, balance, currency, type, status, created_at
      FROM accounts WHERE id = ?
    `).bind(accountId).first();
    
    return c.json({ account }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Get account balance
accountsRouter.get('/:id/balance', async (c) => {
  const user = c.get('user');
  const accountId = c.req.param('id');
  
  try {
    const account = await c.env.DB.prepare(`
      SELECT balance, currency FROM accounts 
      WHERE id = ? AND user_id = ? AND status = 'active'
    `).bind(accountId, user.userId).first();
    
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }
    
    return c.json({ 
      balance: account.balance,
      currency: account.currency 
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch balance' }, 500);
  }
});

export { accountsRouter };
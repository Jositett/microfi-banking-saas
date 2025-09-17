import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../main';
import type { JWTPayload } from '../middleware/auth';

const paymentsRouter = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

const transferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.number().positive(),
  description: z.string().optional()
});

// Transfer money between accounts
paymentsRouter.post('/transfer', zValidator('json', transferSchema), async (c) => {
  const user = c.get('user');
  const { fromAccountId, toAccountId, amount, description } = c.req.valid('json');
  
  try {
    // Start transaction
    await c.env.DB.prepare('BEGIN TRANSACTION').run();
    
    // Verify source account ownership and balance
    const fromAccount = await c.env.DB.prepare(`
      SELECT balance, currency FROM accounts 
      WHERE id = ? AND user_id = ? AND status = 'active'
    `).bind(fromAccountId, user.userId).first();
    
    if (!fromAccount || fromAccount.balance < amount) {
      await c.env.DB.prepare('ROLLBACK').run();
      return c.json({ error: 'Insufficient funds or invalid account' }, 400);
    }
    
    // Verify destination account exists
    const toAccount = await c.env.DB.prepare(`
      SELECT id FROM accounts WHERE id = ? AND status = 'active'
    `).bind(toAccountId).first();
    
    if (!toAccount) {
      await c.env.DB.prepare('ROLLBACK').run();
      return c.json({ error: 'Destination account not found' }, 404);
    }
    
    // Update balances
    await c.env.DB.prepare(`
      UPDATE accounts SET balance = balance - ? WHERE id = ?
    `).bind(amount, fromAccountId).run();
    
    await c.env.DB.prepare(`
      UPDATE accounts SET balance = balance + ? WHERE id = ?
    `).bind(amount, toAccountId).run();
    
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const reference = `TXN${Date.now()}`;
    
    await c.env.DB.prepare(`
      INSERT INTO transactions (id, from_account, to_account, amount, currency, type, description, reference, status, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, 'transfer', ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
    `).bind(transactionId, fromAccountId, toAccountId, amount, fromAccount.currency, description || 'Transfer', reference, user.userId).run();
    
    await c.env.DB.prepare('COMMIT').run();
    
    return c.json({
      transactionId,
      reference,
      status: 'completed'
    });
    
  } catch (error) {
    await c.env.DB.prepare('ROLLBACK').run();
    return c.json({ error: 'Transfer failed' }, 500);
  }
});

// Get transaction history
paymentsRouter.get('/transactions', async (c) => {
  const user = c.get('user');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  try {
    const transactions = await c.env.DB.prepare(`
      SELECT t.*, fa.account_number as from_account_number, ta.account_number as to_account_number
      FROM transactions t
      LEFT JOIN accounts fa ON t.from_account = fa.id
      LEFT JOIN accounts ta ON t.to_account = ta.id
      WHERE t.user_id = ?
      ORDER BY t.timestamp DESC
      LIMIT ? OFFSET ?
    `).bind(user.userId, limit, offset).all();
    
    return c.json({ transactions: transactions.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

export { paymentsRouter };
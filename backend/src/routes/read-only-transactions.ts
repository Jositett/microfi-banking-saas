import { Hono } from 'hono';
import type { HonoContext } from '../types/hono';

const readOnlyTransactionsRouter = new Hono<HonoContext>();

// Get read-only transaction history
readOnlyTransactionsRouter.get('/', async (c) => {
  const user = c.get('user');
  const tenant = c.get('tenant');

  if (!user || !tenant) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    // Get read-only transactions for display only
    const transactions = await c.env.DB.prepare(`
      SELECT id, from_account, to_account, amount, currency, type, 
             description, status, timestamp
      FROM transactions 
      WHERE user_id = ? AND tenant_id = ?
      ORDER BY timestamp DESC
      LIMIT 50
    `).bind(user.id, tenant.id).all();

    return c.json({
      success: true,
      transactions: transactions.results.map(tx => ({
        ...tx,
        amount: tx.amount / 100, // Convert from cents
        readonly: true,
        platform_notice: 'Display only - no processing available'
      })),
      compliance_notice: 'MicroFi is a software platform only - we do not process payments'
    });
  } catch (error) {
    console.error('Read-only transactions error:', error);
    return c.json({ error: 'Failed to retrieve transactions' }, 500);
  }
});

// Get account balance (read-only)
readOnlyTransactionsRouter.get('/balance/:accountId', async (c) => {
  const accountId = c.req.param('accountId');
  const user = c.get('user');
  const tenant = c.get('tenant');

  if (!user || !tenant) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const account = await c.env.DB.prepare(`
      SELECT balance, currency, type FROM accounts 
      WHERE id = ? AND user_id = ? AND tenant_id = ?
    `).bind(accountId, user.id, tenant.id).first();

    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }

    return c.json({
      success: true,
      balance: account.balance / 100, // Convert from cents
      currency: account.currency,
      account_type: account.type,
      readonly: true,
      compliance_notice: 'Balance display only - use your own payment gateway for transactions'
    });
  } catch (error) {
    console.error('Balance check error:', error);
    return c.json({ error: 'Failed to retrieve balance' }, 500);
  }
});

export { readOnlyTransactionsRouter };
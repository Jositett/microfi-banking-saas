import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AuditService, AuditEvents } from '../services/audit';
import type { Env } from '../main';

const accountsRouter = new Hono<{ Bindings: Env }>();

const createAccountSchema = z.object({
  type: z.enum(['savings', 'current', 'investment']),
  currency: z.string().default('GHS')
});

// Get user accounts
accountsRouter.get('/', async (c) => {
  const user = c.get('user');
  const tenant = c.get('tenant');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const accounts = await c.env.DB.prepare(`
      SELECT id, account_number, balance, currency, type, status, created_at
      FROM accounts 
      WHERE user_id = ? AND tenant_id = ? AND status = 'active'
      ORDER BY created_at DESC
    `).bind(user.id, tenant.id).all();

    // Log account access
    const auditService = new AuditService(c.env);
    await auditService.logEvent({
      userId: user.id,
      action: AuditEvents.ACCOUNT_VIEWED,
      resource: 'accounts',
      details: { accountCount: accounts.results.length },
      riskLevel: 'low',
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });

    return c.json({
      accounts: accounts.results.map(account => ({
        ...account,
        balance: account.balance / 100 // Convert from kobo to GHS
      }))
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return c.json({ error: 'Failed to retrieve accounts' }, 500);
  }
});

// Create new account
accountsRouter.post('/', zValidator('json', createAccountSchema), async (c) => {
  const { type, currency } = c.req.valid('json');
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const accountId = crypto.randomUUID();
    const accountNumber = generateAccountNumber();

    await c.env.DB.prepare(`
      INSERT INTO accounts (id, user_id, tenant_id, account_number, type, currency, balance, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, 'active', CURRENT_TIMESTAMP)
    `).bind(accountId, user.id, tenant.id, accountNumber, type, currency).run();

    // Log account creation
    const auditService = new AuditService(c.env);
    await auditService.logEvent({
      userId: user.id,
      action: AuditEvents.ACCOUNT_CREATED,
      resource: 'account',
      resourceId: accountId,
      details: { type, currency, accountNumber },
      riskLevel: 'medium',
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });

    return c.json({
      account: {
        id: accountId,
        accountNumber,
        type,
        currency,
        balance: 0,
        status: 'active'
      }
    }, 201);
  } catch (error) {
    console.error('Create account error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Get account balance
accountsRouter.get('/:id/balance', async (c) => {
  const accountId = c.req.param('id');
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const account = await c.env.DB.prepare(`
      SELECT balance, currency FROM accounts 
      WHERE id = ? AND user_id = ? AND tenant_id = ? AND status = 'active'
    `).bind(accountId, user.id, tenant.id).first();

    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }

    // Log balance check
    const auditService = new AuditService(c.env);
    await auditService.logEvent({
      userId: user.id,
      action: AuditEvents.BALANCE_CHECKED,
      resource: 'account',
      resourceId: accountId,
      details: { balance: account.balance },
      riskLevel: 'low',
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });

    return c.json({
      balance: account.balance / 100, // Convert from kobo to GHS
      currency: account.currency
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return c.json({ error: 'Failed to retrieve balance' }, 500);
  }
});

function generateAccountNumber(): string {
  // Generate 10-digit account number
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export { accountsRouter };
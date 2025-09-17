import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AuditService, AuditEvents } from '../services/audit';
import { PaystackService } from '../services/paystack';
import { FlutterwaveService } from '../services/flutterwave';
import type { Env } from '../main';

const paymentsRouter = new Hono<{ Bindings: Env }>();

const transferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.number().positive(),
  description: z.string().optional()
});

// Transfer money between accounts
paymentsRouter.post('/transfer', zValidator('json', transferSchema), async (c) => {
  const { fromAccountId, toAccountId, amount, description } = c.req.valid('json');
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    // Convert amount to kobo
    const amountInKobo = Math.round(amount * 100);
    
    // Start transaction
    await c.env.DB.prepare('BEGIN TRANSACTION').run();

    // Verify source account ownership and balance
    const fromAccount = await c.env.DB.prepare(`
      SELECT balance, currency FROM accounts 
      WHERE id = ? AND user_id = ? AND status = 'active'
    `).bind(fromAccountId, user.id).first();

    if (!fromAccount) {
      await c.env.DB.prepare('ROLLBACK').run();
      return c.json({ error: 'Source account not found' }, 404);
    }

    if (fromAccount.balance < amountInKobo) {
      await c.env.DB.prepare('ROLLBACK').run();
      return c.json({ error: 'Insufficient funds' }, 400);
    }

    // Verify destination account exists
    const toAccount = await c.env.DB.prepare(`
      SELECT id, currency FROM accounts WHERE id = ? AND status = 'active'
    `).bind(toAccountId).first();

    if (!toAccount) {
      await c.env.DB.prepare('ROLLBACK').run();
      return c.json({ error: 'Destination account not found' }, 404);
    }

    // Perform double-entry bookkeeping
    const transactionId = crypto.randomUUID();
    const reference = `TXN${Date.now()}`;

    // Debit source account
    await c.env.DB.prepare(`
      UPDATE accounts SET balance = balance - ? WHERE id = ?
    `).bind(amountInKobo, fromAccountId).run();

    // Credit destination account
    await c.env.DB.prepare(`
      UPDATE accounts SET balance = balance + ? WHERE id = ?
    `).bind(amountInKobo, toAccountId).run();

    // Record transaction
    await c.env.DB.prepare(`
      INSERT INTO transactions (id, from_account, to_account, amount, currency, type, description, reference, status, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, 'transfer', ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
    `).bind(transactionId, fromAccountId, toAccountId, amountInKobo, fromAccount.currency, description || 'Transfer', reference, user.id).run();

    await c.env.DB.prepare('COMMIT').run();

    // Log successful transfer
    const auditService = new AuditService(c.env);
    await auditService.logEvent({
      userId: user.id,
      action: AuditEvents.TRANSFER_COMPLETED,
      resource: 'transaction',
      resourceId: transactionId,
      details: { 
        fromAccountId, 
        toAccountId, 
        amount: amountInKobo, 
        reference,
        description 
      },
      riskLevel: amountInKobo > 100000 ? 'high' : 'medium',
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });

    return c.json({
      transaction: {
        id: transactionId,
        reference,
        amount: amount,
        currency: fromAccount.currency,
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    await c.env.DB.prepare('ROLLBACK').run();
    console.error('Transfer error:', error);
    
    // Log failed transfer
    const auditService = new AuditService(c.env);
    await auditService.logEvent({
      userId: user.id,
      action: AuditEvents.TRANSFER_FAILED,
      resource: 'transaction',
      details: { fromAccountId, toAccountId, amount, error: error.message },
      riskLevel: 'high',
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });

    return c.json({ error: 'Transfer failed' }, 500);
  }
});

// Get transaction history
paymentsRouter.get('/transactions', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

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
    `).bind(user.id, limit, offset).all();

    return c.json({
      transactions: transactions.results.map(tx => ({
        ...tx,
        amount: tx.amount / 100 // Convert from kobo to GHS
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return c.json({ error: 'Failed to retrieve transactions' }, 500);
  }
});

// Paystack payment initialization
paymentsRouter.post('/paystack/initialize', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'User not found' }, 401);
    
    const { amount, email, reference } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }
    
    const paystackService = new PaystackService(c.env);
    const result = await paystackService.initializePayment(
      amount, 
      email || user.email, 
      user.id, 
      reference
    );
    
    return c.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return c.json({ error: 'Payment initialization failed' }, 500);
  }
});

// Paystack payment verification
paymentsRouter.post('/paystack/verify', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'User not found' }, 401);
    
    const { reference } = await c.req.json();
    
    if (!reference) {
      return c.json({ error: 'Payment reference required' }, 400);
    }
    
    const paystackService = new PaystackService(c.env);
    const result = await paystackService.verifyPayment(reference);
    
    if (result.data.status === 'success') {
      const amount = result.data.amount / 100;
      
      await c.env.DB.prepare('BEGIN TRANSACTION').run();
      
      try {
        await c.env.DB.prepare(
          'UPDATE accounts SET balance = balance + ? WHERE user_id = ? AND type = "savings"'
        ).bind(amount * 100, user.id).run();
        
        await c.env.DB.prepare(
          'INSERT INTO transactions (id, user_id, type, amount, description, reference, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        ).bind(
          crypto.randomUUID(),
          user.id,
          'deposit',
          amount * 100,
          'Paystack deposit',
          reference,
          'completed'
        ).run();
        
        await c.env.DB.prepare('COMMIT').run();
        
        return c.json({
          success: true,
          message: 'Payment verified and account credited',
          amount
        });
      } catch (dbError) {
        await c.env.DB.prepare('ROLLBACK').run();
        throw dbError;
      }
    } else {
      return c.json({
        success: false,
        message: 'Payment verification failed',
        status: result.data.status
      });
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    return c.json({ error: 'Payment verification failed' }, 500);
  }
});

// Flutterwave payment initialization
paymentsRouter.post('/flutterwave/initialize', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'User not found' }, 401);
    
    const { amount, email, reference } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }
    
    const flutterwaveService = new FlutterwaveService(c.env);
    const result = await flutterwaveService.initializePayment(
      amount, 
      email || user.email, 
      user.id, 
      reference
    );
    
    return c.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Flutterwave initialization error:', error);
    return c.json({ error: 'Payment initialization failed' }, 500);
  }
});

// Flutterwave payment verification
paymentsRouter.post('/flutterwave/verify', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'User not found' }, 401);
    
    const { txRef } = await c.req.json();
    
    if (!txRef) {
      return c.json({ error: 'Transaction reference required' }, 400);
    }
    
    const flutterwaveService = new FlutterwaveService(c.env);
    const result = await flutterwaveService.verifyPayment(txRef);
    
    if (result.data.status === 'successful') {
      const amount = result.data.amount;
      
      await c.env.DB.prepare('BEGIN TRANSACTION').run();
      
      try {
        await c.env.DB.prepare(
          'UPDATE accounts SET balance = balance + ? WHERE user_id = ? AND type = "savings"'
        ).bind(amount * 100, user.id).run();
        
        await c.env.DB.prepare(
          'INSERT INTO transactions (id, user_id, type, amount, description, reference, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
        ).bind(
          crypto.randomUUID(),
          user.id,
          'deposit',
          amount * 100,
          'Flutterwave deposit',
          txRef,
          'completed'
        ).run();
        
        await c.env.DB.prepare('COMMIT').run();
        
        return c.json({
          success: true,
          message: 'Payment verified and account credited',
          amount
        });
      } catch (dbError) {
        await c.env.DB.prepare('ROLLBACK').run();
        throw dbError;
      }
    } else {
      return c.json({
        success: false,
        message: 'Payment verification failed',
        status: result.data.status
      });
    }
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    return c.json({ error: 'Payment verification failed' }, 500);
  }
});

export { paymentsRouter };
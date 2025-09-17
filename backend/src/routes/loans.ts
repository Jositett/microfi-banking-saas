import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../main';
import type { JWTPayload } from '../middleware/auth';

const loansRouter = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

const loanApplicationSchema = z.object({
  amount: z.number().positive(),
  termMonths: z.number().int().min(1).max(60),
  purpose: z.string().optional()
});

// Get user loans
loansRouter.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    const loans = await c.env.DB.prepare(`
      SELECT * FROM loans 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(user.userId).all();
    
    return c.json({ loans: loans.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch loans' }, 500);
  }
});

// Apply for loan
loansRouter.post('/apply', zValidator('json', loanApplicationSchema), async (c) => {
  const user = c.get('user');
  const { amount, termMonths } = c.req.valid('json');
  
  try {
    const loanId = crypto.randomUUID();
    const interestRate = 0.15; // 15% annual rate
    const monthlyPayment = Math.ceil((amount * (1 + interestRate)) / termMonths);
    
    await c.env.DB.prepare(`
      INSERT INTO loans (id, user_id, amount, interest_rate, term_months, monthly_payment, outstanding_balance, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(loanId, user.userId, amount, interestRate, termMonths, monthlyPayment, amount).run();
    
    const loan = await c.env.DB.prepare(`
      SELECT * FROM loans WHERE id = ?
    `).bind(loanId).first();
    
    return c.json({ loan }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to apply for loan' }, 500);
  }
});

export { loansRouter };
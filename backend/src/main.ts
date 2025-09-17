import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';
import { errorHandler } from './middleware/error';

// Import routes
import { authRouter } from './routes/auth';
import { accountsRouter } from './routes/accounts';
import { paymentsRouter } from './routes/payments';
import { savingsRouter } from './routes/savings';
import { loansRouter } from './routes/loans';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  PAYSTACK_SECRET_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers
app.use('*', async (c, next) => {
  c.header('Content-Security-Policy', "default-src 'self'");
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  await next();
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
app.route('/auth', authRouter);

// Protected routes (auth required)
app.use('/api/*', authMiddleware);
app.use('/api/*', auditMiddleware);

app.route('/api/accounts', accountsRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/savings', savingsRouter);
app.route('/api/loans', loansRouter);

// Error handling
app.onError(errorHandler);

export default app;
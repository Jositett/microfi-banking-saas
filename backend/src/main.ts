import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';
import { errorHandler } from './middleware/error';

// Import routes
import { authRouter } from './routes/auth';
import { webauthnRouter } from './routes/webauthn';
import { accountsRouter } from './routes/accounts';
import { paymentsRouter } from './routes/payments';
import { savingsRouter } from './routes/savings';
import { loansRouter } from './routes/loans';
import { healthRouter } from './routes/health';

// Import security middleware
import { securityHeaders, rateLimiting, mfaVerification } from './middleware/security';
import { transactionMFA } from './middleware/transaction-mfa';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  WEBAUTHN_RP_ID: string;
  WEBAUTHN_ORIGIN: string;
  WEBAUTHN_RP_NAME: string;
  WEBAUTHN_CREDENTIALS: KVNamespace;
  USER_SESSIONS: KVNamespace;
  AUDIT_LOGS: KVNamespace;
  PAYSTACK_SECRET_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://169.254.146.124:3000', 'https://your-frontend-domain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-MFA-Challenge', 'X-MFA-Response'],
  credentials: true,
}));

// Banking-grade security middleware
app.use('*', securityHeaders);
app.use('*', rateLimiting);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
app.route('/health', healthRouter);
app.route('/auth', authRouter);
app.route('/webauthn', webauthnRouter);

// Protected routes (auth required)
app.use('/api/*', mfaVerification);
app.use('/api/*', transactionMFA);
app.use('/api/*', auditMiddleware);

app.route('/api/accounts', accountsRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/savings', savingsRouter);
app.route('/api/loans', loansRouter);

// Error handling
app.onError(errorHandler);

export default app;
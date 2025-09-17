import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';
import { errorHandler } from './middleware/error';
import type { User } from './types/context';
import type { HonoEnv } from './types/hono';

// Import routes
import { authRouter } from './routes/auth';
import { webauthnRouter } from './routes/webauthn';
import { accountsRouter } from './routes/accounts';
import { paymentsRouter } from './routes/payments';
import { savingsRouter } from './routes/savings';
import { loansRouter } from './routes/loans';
import { healthRouter } from './routes/health';
import { adminRouter } from './routes/admin';
import { notificationsRouter } from './routes/notifications';

// Import security middleware
import { securityHeaders } from './middleware/auth';
import { authRateLimit, apiRateLimit, paymentRateLimit } from './middleware/rate-limiting';

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
  FLUTTERWAVE_CLIENT_ID: string;
  FLUTTERWAVE_ENCRYPTION_KEY: string;
  HUBTEL_CLIENT_ID: string;
  HUBTEL_CLIENT_SECRET: string;
  HUBTEL_SENDER_ID: string;
  RESEND_API_KEY: string;
  ENVIRONMENT?: string;
}

const app = new Hono<HonoEnv>();

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

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
app.route('/health', healthRouter);
app.use('/auth/*', authRateLimit.middleware);
app.route('/auth', authRouter);
app.route('/webauthn', webauthnRouter);

// Protected routes (auth required)
app.use('/api/*', apiRateLimit.middleware);
app.use('/api/*', authMiddleware);
app.use('/api/payments/*', paymentRateLimit.middleware);
app.use('/api/*', auditMiddleware);

app.route('/api/accounts', accountsRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/savings', savingsRouter);
app.route('/api/loans', loansRouter);
app.route('/api/admin', adminRouter);
app.route('/api/notifications', notificationsRouter);

// Error handling
app.onError(errorHandler);

export default app;
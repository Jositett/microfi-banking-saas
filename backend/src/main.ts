import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';
import { errorHandler } from './middleware/error';
import { tenantResolver, requireTenant } from './middleware/tenant-resolver';
import type { User } from './types/context';
import type { HonoEnv } from './types/hono';

// Import routes
import { authRouter } from './routes/auth';
import { webauthnRouter } from './routes/webauthn';
import { accountsRouter } from './routes/accounts';
import { paymentsRouter } from './routes/payments'; // CBMP: Now blocks all payment routes
import { savingsRouter } from './routes/savings';
import { loansRouter } from './routes/loans';
import { healthRouter } from './routes/health';
import { adminRouter } from './routes/admin';
import { notificationsRouter } from './routes/notifications';
import { subscriptionsRouter } from './routes/subscriptions';
import { gatewayRouter } from './routes/gateway'; // CBMP: Now blocks all gateway routes
import { adminAuthRouter } from './routes/admin/auth';
import { adminTenantsRouter } from './routes/admin/tenants';
import { adminAnalyticsRouter } from './routes/admin/analytics';
import { adminSubscriptionsRouter } from './routes/admin/subscriptions';
import { adminUsersRouter } from './routes/admin/users';
import { adminSettingsRouter } from './routes/admin/settings';
import { tenantApiRouter } from './routes/tenant-api';
import { subscriptionRouter } from './routes/software-subscription';
import { businessRouter } from './routes/cbmp-business'; // CBMP: New business management routes

// Import security middleware
import { securityHeaders } from './middleware/auth';
import { authRateLimit, apiRateLimit } from './middleware/rate-limiting';
import { 
  cbmpComplianceMiddleware,
  businessOnlyMiddleware,
  csvOnlyMiddleware,
  auditComplianceMiddleware
} from './middleware/cbmp-compliance';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  WEBAUTHN_RP_ID: string;
  WEBAUTHN_ORIGIN: string;
  WEBAUTHN_RP_NAME: string;
  WEBAUTHN_CREDENTIALS: KVNamespace;
  USER_SESSIONS: KVNamespace;
  AUDIT_LOGS: KVNamespace;
  // CBMP: Payment gateway keys removed for compliance
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
  allowHeaders: ['Content-Type', 'Authorization', 'X-MFA-Challenge', 'X-MFA-Response', 'Host', 'X-Tenant-Host'],
  credentials: true,
}));

// Banking-grade security middleware
app.use('*', securityHeaders);

// 🚨 CBMP COMPLIANCE (CRITICAL - MUST BE FIRST)
app.use('*', cbmpComplianceMiddleware);
app.use('*', businessOnlyMiddleware);
app.use('*', csvOnlyMiddleware);
app.use('*', auditComplianceMiddleware);

// Multi-tenant resolution (before auth)
app.use('*', tenantResolver);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin routes (separate domain: admin.microfi.com)
app.use('/admin/auth/*', authRateLimit.middleware);
app.route('/admin/auth', adminAuthRouter);
app.use('/admin/api/*', apiRateLimit.middleware);
app.route('/admin/api/tenants', adminTenantsRouter);
app.route('/admin/api/analytics', adminAnalyticsRouter);
app.route('/admin/api/subscriptions', adminSubscriptionsRouter);
app.route('/admin/api/users', adminUsersRouter);
app.route('/admin/api/settings', adminSettingsRouter);
app.route('/admin/api', adminRouter);

// Public routes (no auth required)
app.route('/health', healthRouter);
app.use('/auth/*', authRateLimit.middleware);
app.route('/auth', authRouter);
app.route('/webauthn', webauthnRouter);

// Admin routes (no tenant isolation required)
app.use('/api/admin/*', apiRateLimit.middleware);
app.use('/api/admin/*', authMiddleware);
app.use('/api/admin/*', auditMiddleware);
app.route('/api/admin', adminRouter);

// Protected routes (auth + tenant required)
app.use('/api/*', requireTenant);
app.use('/api/*', apiRateLimit.middleware);
app.use('/api/*', authMiddleware);
app.use('/api/*', auditMiddleware);

// CBMP Compliant Routes Only
app.route('/api/business', businessRouter); // New: Business management
app.route('/api/accounts', accountsRouter); // Modified: Account info only
app.route('/api/payments', paymentsRouter); // CBMP: Returns 403 for all routes
app.route('/api/gateway', gatewayRouter); // CBMP: Returns 403 for all routes
app.route('/api/savings', savingsRouter); // Modified: Savings tracking only
app.route('/api/loans', loansRouter); // Modified: Loan applications only
app.route('/api/notifications', notificationsRouter);
app.route('/api/subscriptions', subscriptionsRouter);
app.route('/api/tenant', tenantApiRouter);
app.route('/api/software-subscription', subscriptionRouter);

// Error handling
app.onError(errorHandler);

export default app;
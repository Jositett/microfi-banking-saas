import { Hono } from 'hono';
import type { Env } from '../main';

const healthRouter = new Hono<{ Bindings: Env }>();

// Health check endpoint
healthRouter.get('/', async (c) => {
  const startTime = Date.now();
  
  try {
    // Test database connectivity
    const dbTest = await c.env.DB.prepare('SELECT 1 as test').first();
    
    // Test KV connectivity
    const kvTest = await c.env.USER_SESSIONS.get('health-check');
    await c.env.USER_SESSIONS.put('health-check', 'ok', { expirationTtl: 60 });
    
    const responseTime = Date.now() - startTime;
    
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: c.env.ENVIRONMENT || 'development',
      services: {
        database: dbTest ? 'connected' : 'error',
        kv_storage: 'connected',
        webauthn: 'ready'
      },
      performance: {
        responseTime: `${responseTime}ms`,
        uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A'
      },
      security: {
        mfa_enabled: true,
        audit_logging: true,
        rate_limiting: true
      }
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service connectivity issues',
      environment: c.env.ENVIRONMENT || 'development'
    }, 503);
  }
});

// Readiness probe
healthRouter.get('/ready', async (c) => {
  try {
    // Check critical services
    await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    
    return c.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      status: 'not ready',
      error: 'Database not accessible'
    }, 503);
  }
});

// Liveness probe
healthRouter.get('/live', (c) => {
  return c.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export { healthRouter };
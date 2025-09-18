import { Hono } from 'hono';
import type { Context } from 'hono';

interface HealthCheck {
  healthy: boolean;
  responseTime: number;
  error?: string;
  details?: any;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    paystack: HealthCheck;
    flutterwave: HealthCheck;
    hubtel: HealthCheck;
    resend: HealthCheck;
    kv: HealthCheck;
  };
  performance: {
    avgResponseTime: number;
    requestCount: number;
    errorRate: number;
  };
}

const healthRouter = new Hono();

// Simple health check
healthRouter.get('/', async (c: Context) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MicroFi Banking API'
  });
});

// Comprehensive health check
healthRouter.get('/detailed', async (c: Context) => {
  const startTime = Date.now();
  
  const checks = await Promise.allSettled([
    checkDatabaseHealth(c.env.DB),
    checkPaystackHealth(c.env.PAYSTACK_SECRET_KEY),
    checkFlutterwaveHealth(c.env.FLUTTERWAVE_SECRET_KEY),
    checkHubtelHealth(c.env.HUBTEL_CLIENT_ID, c.env.HUBTEL_CLIENT_SECRET),
    checkResendHealth(c.env.RESEND_API_KEY),
    checkKVHealth(c.env.USER_SESSIONS)
  ]);

  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    checks: {
      database: checks[0].status === 'fulfilled' ? checks[0].value : { healthy: false, responseTime: 0, error: 'Check failed' },
      paystack: checks[1].status === 'fulfilled' ? checks[1].value : { healthy: false, responseTime: 0, error: 'Check failed' },
      flutterwave: checks[2].status === 'fulfilled' ? checks[2].value : { healthy: false, responseTime: 0, error: 'Check failed' },
      hubtel: checks[3].status === 'fulfilled' ? checks[3].value : { healthy: false, responseTime: 0, error: 'Check failed' },
      resend: checks[4].status === 'fulfilled' ? checks[4].value : { healthy: false, responseTime: 0, error: 'Check failed' },
      kv: checks[5].status === 'fulfilled' ? checks[5].value : { healthy: false, responseTime: 0, error: 'Check failed' }
    },
    performance: {
      avgResponseTime: Date.now() - startTime,
      requestCount: 0, // Would be tracked in production
      errorRate: 0 // Would be calculated from metrics
    }
  };

  // Determine overall status
  const unhealthyServices = Object.values(healthStatus.checks).filter(check => !check.healthy);
  if (unhealthyServices.length === 0) {
    healthStatus.status = 'healthy';
  } else if (unhealthyServices.length <= 2) {
    healthStatus.status = 'degraded';
  } else {
    healthStatus.status = 'unhealthy';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                    healthStatus.status === 'degraded' ? 206 : 503;

  return c.json(healthStatus, statusCode);
});

// Individual service health checks
async function checkDatabaseHealth(db: D1Database): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const result = await db.prepare('SELECT 1 as test').first();
    return {
      healthy: result?.test === 1,
      responseTime: Date.now() - start,
      details: { connected: true }
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
  }
}

async function checkPaystackHealth(secretKey?: string): Promise<HealthCheck> {
  const start = Date.now();
  if (!secretKey) {
    return {
      healthy: false,
      responseTime: 0,
      error: 'Paystack secret key not configured'
    };
  }

  try {
    const response = await fetch('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      healthy: response.ok,
      responseTime: Date.now() - start,
      details: { status: response.status }
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Paystack API unreachable'
    };
  }
}

async function checkFlutterwaveHealth(secretKey?: string): Promise<HealthCheck> {
  const start = Date.now();
  if (!secretKey) {
    return {
      healthy: false,
      responseTime: 0,
      error: 'Flutterwave secret key not configured'
    };
  }

  try {
    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      healthy: response.ok,
      responseTime: Date.now() - start,
      details: { status: response.status }
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Flutterwave API unreachable'
    };
  }
}

async function checkHubtelHealth(clientId?: string, clientSecret?: string): Promise<HealthCheck> {
  const start = Date.now();
  if (!clientId || !clientSecret) {
    return {
      healthy: false,
      responseTime: 0,
      error: 'Hubtel credentials not configured'
    };
  }

  try {
    // Check account balance endpoint
    const auth = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch('https://smpp.hubtel.com/v1/messages/balance', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      healthy: response.ok,
      responseTime: Date.now() - start,
      details: { status: response.status }
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Hubtel API unreachable'
    };
  }
}

async function checkResendHealth(apiKey?: string): Promise<HealthCheck> {
  const start = Date.now();
  if (!apiKey) {
    return {
      healthy: false,
      responseTime: 0,
      error: 'Resend API key not configured'
    };
  }

  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      healthy: response.ok,
      responseTime: Date.now() - start,
      details: { status: response.status }
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Resend API unreachable'
    };
  }
}

async function checkKVHealth(kv: KVNamespace): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const testKey = `health_check_${Date.now()}`;
    await kv.put(testKey, 'test', { expirationTtl: 60 });
    const result = await kv.get(testKey);
    await kv.delete(testKey);

    return {
      healthy: result === 'test',
      responseTime: Date.now() - start,
      details: { kvOperational: true }
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'KV storage failed'
    };
  }
}

export { healthRouter };
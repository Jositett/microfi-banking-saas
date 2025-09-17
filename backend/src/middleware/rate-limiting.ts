import type { Context, Next } from 'hono';
import type { HonoContext } from '../types/hono';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}

export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(private config: RateLimitConfig) {}

  middleware = async (c: HonoContext, next: Next) => {
    const key = this.config.keyGenerator ? this.config.keyGenerator(c) : this.getDefaultKey(c);
    const now = Date.now();
    
    const record = this.requests.get(key);
    
    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      await next();
      return;
    }
    
    if (record.count >= this.config.maxRequests) {
      return c.json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      }, 429);
    }
    
    record.count++;
    await next();
  };

  private getDefaultKey(c: Context): string {
    const ip = c.req.header('CF-Connecting-IP') || 
               c.req.header('X-Forwarded-For') || 
               'unknown';
    return `rate_limit:${ip}`;
  }
}

// Pre-configured rate limiters
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 login attempts per 15 minutes
});

export const apiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
});

export const paymentRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 payment requests per minute
});
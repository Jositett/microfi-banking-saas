# MicroFi Banking SaaS - Development Rules

## Project Setup & Environment

1. **Wrangler CLI Setup**
   - Install latest Wrangler: `npm install -g wrangler@latest`
   - Authenticate: `wrangler auth login`
   - Use `wrangler dev` for local development

2. **Database Configuration**
   - Create D1 database: `wrangler d1 create microfi-banking`
   - Configure `wrangler.toml` with D1 binding:
     ```toml
     [[d1_databases]]
     binding = "DB"
     database_name = "microfi-banking"
     database_id = "<database-id>"
     ```

3. **Environment Variables**
   - JWT_SECRET for authentication tokens
   - WEBAUTHN_RP_ID for WebAuthn relying party
   - WEBAUTHN_ORIGIN for WebAuthn origin validation
   - PAYSTACK_SECRET_KEY for payment processing
   - FLUTTERWAVE_SECRET_KEY for payment processing
   - TWILIO_AUTH_TOKEN for SMS notifications
   - SENDGRID_API_KEY for email notifications

4. **Cloudflare KV Configuration**
   - Create KV namespaces: `wrangler kv:namespace create WEBAUTHN_CREDENTIALS`
   - Configure wrangler.toml with KV bindings:
     ```toml
     [[kv_namespaces]]
     binding = "WEBAUTHN_CREDENTIALS"
     id = "<namespace-id>"
     
     [[kv_namespaces]]
     binding = "USER_SESSIONS"
     id = "<namespace-id>"
     
     [[kv_namespaces]]
     binding = "AUDIT_LOGS"
     id = "<namespace-id>"
     ```

## Code Standards

4. **TypeScript First**
   - All new code must be TypeScript
   - Use strict type checking
   - Define interfaces for all API responses and database models

5. **Component Architecture**
   - Use shadcn/ui components exclusively
   - Follow Next.js 14 App Router patterns
   - Implement server components where possible

6. **Database Operations**
   - Access D1 via `env.DB` in Workers
   - Use prepared statements: `env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId)`
   - Execute schema changes via: `wrangler d1 execute microfi-banking --file schema.sql`
   - All queries must use prepared statements with parameter binding

## Banking-Specific Rules

7. **Financial Data Handling**
   - Store monetary values as integers (cents/kobo)
   - Convert to display format only in frontend
   - Always validate transaction amounts > 0
   - Implement double-entry bookkeeping for all transactions

8. **Security Requirements - BANK LEVEL**
   - **WebAuthn MFA MANDATORY**: All authentication must use FIDO2/WebAuthn
   - **NO TOTP/SMS**: Prohibited due to phishing/SIM swapping vulnerabilities
   - **NIST SP 800-63B Level 3**: Compliance required for banking operations
   - **Hardware Security Keys**: Support YubiKey, Touch ID, Face ID, Windows Hello
   - **Phishing-Resistant**: Only cryptographic authentication methods
   - **Role-based access**: User/Admin with MFA verification
   - **Transaction MFA**: Separate WebAuthn challenge for financial operations
   - **Session Security**: JWT + WebAuthn verification for sensitive actions
   - **Audit Logging**: All security events logged to KV with immutable timestamps

9. **Transaction Processing**
   - Wrap financial operations in database transactions
   - Implement double-entry bookkeeping principles
   - Validate account balances before debits

## API Development

10. **RESTful Endpoints**
    - Follow `/api/[resource]` pattern
    - Use proper HTTP methods (GET, POST, PUT, DELETE)
    - Return consistent error responses with status codes

11. **Authentication Middleware**
    - Protect all `/api/` routes except auth endpoints
    - Validate JWT tokens on each request
    - Check user roles for admin endpoints

12. **Data Validation**
    - Validate all inputs server-side
    - Sanitize user data before database operations
    - Use Zod schemas for request validation

## Frontend Standards

13. **Responsive Design**
    - Mobile-first approach using Tailwind CSS
    - Test on mobile, tablet, and desktop breakpoints
    - Use CSS custom properties for theming

14. **Theme Implementation**
    - Support light/dark/system themes via next-themes
    - Use OKLCH color space for consistent colors
    - Implement theme-aware components

15. **Performance Optimization**
    - Lazy load non-critical components
    - Optimize images with Next.js Image component
    - Target Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

## Testing Requirements

16. **Unit Testing**
    - Test all utility functions and services
    - Mock external dependencies (payment gateways, D1 database)
    - Achieve >90% code coverage
    - Use Vitest + Hono test utilities

17. **Integration Testing**
    - Test API endpoints with sample data
    - Validate authentication flows
    - Test database operations

## Deployment Process

18. **Pre-deployment Checks**
    - Run `wrangler dev` to test locally
    - Validate all environment variables
    - Test database migrations

19. **Production Deployment**
    - Deploy with: `wrangler deploy`
    - Monitor deployment logs
    - Verify all endpoints post-deployment

## Error Handling

20. **Graceful Degradation**
    - Implement proper error boundaries
    - Show user-friendly error messages
    - Log errors for debugging

21. **Financial Error Handling**
    - Never allow negative balances
    - Rollback failed transactions
    - Alert admins of critical failures

## Monitoring & Maintenance

22. **Logging Standards**
    - Log all financial transactions
    - Track user authentication events
    - Monitor API response times

23. **Data Backup**
    - Regular D1 database backups
    - Test restore procedures
    - Maintain audit trails for compliance

## Cloudflare Workers & D1 Backend Architecture

24. **Feature-based Project Structure**
    - Organize by business domain: `src/features/accounts/`, `src/features/savings/`, `src/features/loans/`
    - Separate files: `handlers.ts`, `services.ts`, `types.ts`, `tests/`
    - Keep files under 200 lines

25. **Service-layer Architecture**
    ```ts
    export class TransferService {
      async execute(db: D1Database, from: string, to: string, amount: number, userId: string) {
        await db.prepare("BEGIN TRANSACTION;").run();
        try {
          await db.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?")
            .bind(amount, from, userId).run();
          await db.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?")
            .bind(amount, to).run();
          await db.prepare("COMMIT").run();
        } catch (e) {
          await db.prepare("ROLLBACK").run();
          throw e;
        }
      }
    }
    ```

26. **Hono Router Organization**
    ```ts
    import { Hono } from "hono";
    export const app = new Hono()
      .route("/accounts", accountRouter)
      .route("/payments", paymentRouter)
      .route("/savings", savingsRouter)
      .use("*", authMiddleware)
      .use("*", auditMiddleware);
    ```

27. **D1 Migration Management**
    - Store schema changes in versioned SQL files: `migrations/001_initial_schema.sql`
    - Apply via: `wrangler d1 migrations apply microfi-banking`
    - Include all core tables: users, accounts, transactions, savings_plans, loans

28. **Caching Strategy**
    - Use Cloudflare KV for read-heavy data (account balances, user sessions)
    - Cache frequently accessed data with TTL
    - Implement cache invalidation for financial data updates

29. **Security Middleware - Banking Grade**
    ```ts
    // Security Headers Middleware
    app.use("*", async (c, next) => {
      c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
      c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
      c.header("X-Frame-Options", "DENY");
      c.header("X-Content-Type-Options", "nosniff");
      c.header("Referrer-Policy", "strict-origin-when-cross-origin");
      c.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
      await next();
    });
    
    // WebAuthn MFA Middleware
    app.use("/api/*", async (c, next) => {
      const token = c.req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return c.json({ error: "Authentication required" }, 401);
      
      const session = await c.env.USER_SESSIONS.get(token);
      if (!session || !JSON.parse(session).mfaVerified) {
        return c.json({ error: "MFA verification required" }, 401);
      }
      
      await next();
    });
    ```

30. **Payment Gateway Integration**
    - Implement unified payment interface for Paystack, Flutterwave
    - Store API keys in Workers Secrets
    - Handle webhooks for payment confirmations
    - Implement retry logic for failed transactions

31. **Audit Trail Implementation**
    ```ts
    export const auditMiddleware = async (c: Context, next: Next) => {
      await next();
      const user = c.get("user");
      const action = `${c.req.method} ${c.req.url}`;
      await c.env.DB.prepare(
        "INSERT INTO audit_logs (user_id, action, details, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
      ).bind(user.id, action, JSON.stringify(await c.req.json())).run();
    };
    ```

32. **Scheduled Jobs**
    - Daily interest calculation for savings plans
    - Automated loan repayment processing
    - Backup jobs to R2 storage
    - Use cron triggers: `wrangler publish --cron "0 0 * * *"`

33. **Type Definitions**
    ```ts
    export interface User {
      id: string;
      email: string;
      role: "admin" | "user";
      kycStatus: "pending" | "verified" | "rejected";
      createdAt: Date;
    }
    
    export interface Account {
      id: string;
      userId: string;
      accountNumber: string;
      balance: number; // stored in cents/kobo
      currency: string;
      type: "savings" | "current" | "investment";
    }
    ```

34. **WebAuthn MFA Implementation**
    ```ts
    // WebAuthn Registration
    import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
    
    app.post('/auth/webauthn/register', async (c) => {
      const options = await generateRegistrationOptions({
        rpID: c.env.WEBAUTHN_RP_ID,
        rpName: 'MicroFi Banking',
        userID: userId,
        userName: userEmail,
        attestationType: 'direct',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        }
      });
      
      await c.env.USER_SESSIONS.put(`challenge_${userId}`, options.challenge, { expirationTtl: 300 });
      return c.json(options);
    });
    
    // WebAuthn Authentication
    app.post('/auth/webauthn/authenticate', async (c) => {
      const { response } = await c.req.json();
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: storedChallenge,
        expectedOrigin: c.env.WEBAUTHN_ORIGIN,
        expectedRPID: c.env.WEBAUTHN_RP_ID,
        authenticator: storedCredential
      });
      
      if (verification.verified) {
        const sessionToken = generateSecureToken();
        await c.env.USER_SESSIONS.put(sessionToken, JSON.stringify({
          userId,
          mfaVerified: true,
          lastActivity: Date.now(),
          expiresAt: Date.now() + 3600000 // 1 hour
        }));
        return c.json({ token: sessionToken });
      }
    });
    ```

35. **KV Storage Patterns**
    - Store WebAuthn credentials in WEBAUTHN_CREDENTIALS namespace
    - Use USER_SESSIONS for MFA-verified sessions
    - Log all security events to AUDIT_LOGS with TTL
    - Implement key rotation for long-lived credentials
    - Use atomic operations for critical security updates

36. **Optimization Checklist**
    - Use prepared statements with parameter binding for all queries
    - Add indexes for frequent WHERE/JOIN columns (user_id, account_number)
    - Avoid N+1 queries with JOINs or batched queries
    - Wrap database operations in retry logic for transient errors
    - Use `wrangler dev --local` for local testing with D1
    - Implement connection pooling for high-traffic scenarios
    - Cache WebAuthn credentials in KV for sub-100ms authentication
    - Use edge-optimized KV for global MFA verification
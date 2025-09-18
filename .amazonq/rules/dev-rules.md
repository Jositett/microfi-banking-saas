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
   - HUBTEL_CLIENT_ID for SMS notifications
   - HUBTEL_CLIENT_SECRET for SMS authentication
   - HUBTEL_SENDER_ID for SMS sender identification
   - RESEND_API_KEY for email notifications

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

22. **Error Report Generation**
    - **Two-Try Rule**: If an issue cannot be resolved after 2 attempts, generate comprehensive error report
    - **Report Location**: Create in `docs/ERROR-REPORT-[ISSUE-NAME]-[TIMESTAMP].md`
    - **Report Template**: Use standardized format for external assistance
    - **Include**: Error logs, affected files, environment details, attempted solutions
    - **Purpose**: Enable external entities to provide targeted assistance
    
    **Error Report Template Structure**:
    ```markdown
    # [Issue Name] Error Report
    
    ## 🚨 Critical Issue Summary
    [Brief description of the problem]
    
    ## 📋 Error Details
    ### Primary Issue
    - Problem: [Specific technical issue]
    - Impact: [Business/functional impact]
    - Environment: [Runtime environment details]
    
    ### Error Logs
    ```
    [Actual error messages and stack traces]
    ```
    
    ### Expected vs Actual
    - Expected: [What should happen]
    - Actual: [What actually happens]
    
    ## 🔧 Technical Analysis
    ### Root Cause
    [Analysis of underlying cause]
    
    ### Solutions Attempted
    1. ❌ [First attempt description]
    2. ❌ [Second attempt description]
    
    ### Code Location
    **File**: [Affected file path]
    **Method**: [Function/method name]
    **Lines**: [Line numbers]
    
    ## 📁 Affected Files
    [List all files involved in the issue]
    
    ## 🔍 Environment Details
    [Runtime, dependencies, browser, OS details]
    
    ## 🛠️ Debugging Information
    [Step-by-step flow analysis]
    
    ## 🎯 Potential Solutions
    [Suggested approaches for resolution]
    
    ## 📞 Support Request
    ### Assistance Needed
    [Specific help required]
    
    ### Expected Outcome
    [Desired end result]
    
    ## 📊 Impact Assessment
    ### Severity: [Critical/High/Medium/Low]
    ### Affected Features: [List impacted functionality]
    ### Business Impact: [Business consequences]
    ```

## Monitoring & Maintenance

23. **Logging Standards**
    - Log all financial transactions
    - Track user authentication events
    - Monitor API response times

24. **Data Backup**
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

30. **🚨 CBMP COMPLIANCE - BUSINESS MANAGEMENT ONLY** 🚨
    - ❌ **COMPLETELY PROHIBITED**: Any payment-related code or interfaces
    - ❌ **COMPLETELY PROHIBITED**: Payment gateway configurations
    - ❌ **COMPLETELY PROHIBITED**: Real-time payment system connections
    - ❌ **COMPLETELY PROHIBITED**: Payment credential storage (any form)
    - ✅ **ALLOWED**: CSV data import for business reporting
    - ✅ **ALLOWED**: Software subscription billing (platform revenue only)
    - ✅ **ALLOWED**: Pure business management features (CRM, HR, documents)

31. **Communication Services Integration** ✅
    - ✅ Hubtel SMS service for business alerts and notifications
    - ✅ Resend Email service for system notifications
    - ✅ Business management templates (loan status, KYC updates)
    - ✅ Comprehensive audit logging for all communications
    - ✅ Multi-channel notification system for business operations
    - ❌ **COMPLETELY PROHIBITED**: Any payment-related communications

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

## 🚨 CBMP COMPLIANCE RULES (MANDATORY - 100% LEGAL)

47. **CORE PRINCIPLE - PURE BUSINESS MANAGEMENT SaaS**
    - **Zero payment-related code anywhere in system**
    - **CSV-only data import for all financial information**
    - **Pure business management features only**
    - **Absolute regulatory safety with zero risk**

48. **COMPLETELY PROHIBITED OPERATIONS**
    ```typescript
    // BLOCK ALL PAYMENT-RELATED CODE AND ROUTES
    const COMPLETELY_BLOCKED = [
      '/payment', '/transfer', '/deposit', '/withdraw', '/charge',
      '/payout', '/gateway', '/paystack', '/flutterwave', '/momo',
      '/balance', '/transaction', '/fund', '/wallet', '/billing'
    ];
    
    app.use('*', (c, next) => {
      if (COMPLETELY_BLOCKED.some(route => c.req.path.includes(route))) {
        return c.json({ 
          error: 'Payment features completely removed for compliance',
          message: 'MicroFi is pure business management software only',
          compliance: 'BoG/CBN compliant - zero payment code'
        }, 403);
      }
      return next();
    });
    ```

49. **ALLOWED BUSINESS MANAGEMENT OPERATIONS**
    - **Customer Relationship Management**: Client profiles and KYC documents
    - **Loan Application Tracking**: Manual status updates (no payment processing)
    - **CSV Data Import**: Manual upload of business data from external systems
    - **Expense Categorization**: Basic reporting from uploaded CSV data
    - **Staff Management**: HR and employee management features

50. **DATA IMPORT RULES (CSV-ONLY)**
    - **No API connections to payment systems**
    - **Manual CSV upload only** for all financial data
    - **Business data only** (no payment credentials or transaction processing)
    - **Tenant uploads data from their own licensed payment systems**

51. **ABSOLUTE COMPLIANCE MIDDLEWARE**
    ```typescript
    export const cbmpComplianceMiddleware = async (c: Context, next: Next) => {
      // Block ANY payment-related operations
      const paymentKeywords = [
        'payment', 'charge', 'transfer', 'balance', 'transaction',
        'paystack', 'flutterwave', 'momo', 'gateway', 'fund'
      ];
      
      const path = c.req.path.toLowerCase();
      if (paymentKeywords.some(keyword => path.includes(keyword))) {
        return c.json({
          error: 'CBMP Compliance: Payment features removed',
          message: 'Pure business management software only',
          compliance: 'BoG/CBN exempt - zero payment code',
          alternative: 'Use CSV upload for business data import'
        }, 403);
      }
      await next();
    };
    ```

52. **SUBSCRIPTION BILLING (SOFTWARE LICENSE ONLY)**
    - **Only charge for software license** (GHS 20-50/month)
    - **Use platform's own payment account** (completely separate)
    - **Never touch tenant's business operations**
    - **Clear separation: software licensing vs business management**

## 🚨 **CBMP COMPLIANCE VERIFICATION**

62. **AUTOMATED COMPLIANCE CHECKS**
    ```typescript
    // Run before every deployment
    export const cbmpComplianceCheck = {
      codebaseCheck: () => {
        const paymentKeywords = [
          'paystack', 'flutterwave', 'momo', 'payment', 'charge',
          'transfer', 'balance', 'transaction', 'gateway'
        ];
        // Scan entire codebase for prohibited keywords
        return scanCodebase(paymentKeywords);
      },
      
      databaseCheck: () => {
        const prohibitedTables = [
          'payments', 'transactions', 'balances', 'gateways'
        ];
        const prohibitedColumns = [
          'amount', 'balance', 'transaction_id', 'payment_status'
        ];
        // Verify database schema compliance
        return validateDatabaseSchema(prohibitedTables, prohibitedColumns);
      },
      
      routeCheck: () => {
        const prohibitedRoutes = [
          '/payment', '/transfer', '/charge', '/gateway', '/balance'
        ];
        // Verify all payment routes return 403
        return testRouteBlocking(prohibitedRoutes);
      }
    };
    ```

63. **DEPLOYMENT COMPLIANCE GATE**
    ```bash
    # Pre-deployment compliance check (MANDATORY)
    npm run cbmp:compliance-check
    
    # Only deploy if 100% compliant
    if [ $? -eq 0 ]; then
      echo "✅ CBMP Compliance verified - deploying"
      wrangler deploy
    else
      echo "❌ CBMP Compliance failed - blocking deployment"
      exit 1
    fi
    ```

## Multi-Tenant SaaS Architecture Rules

37. **Domain Routing Standards**
    - **Root Domain**: `microfi.com` serves public marketing site and demo
    - **Admin Panel**: `admin.microfi.com` for tenant management (separate auth)
    - **Tenant Subdomains**: `client1.microfi.com` for isolated tenant instances
    - **Custom Domains**: `mymfi.com` for client-branded instances
    - **Host Header Validation**: Always validate host against tenants table

38. **Tenant Isolation Rules**
    - **Zero-Trust Database**: ALL queries MUST include `tenant_id = ?`
    - **JWT Tenant Context**: All tokens MUST include `tenant_id` claim
    - **Host Verification**: Verify JWT `tenant_id` matches host header
    - **No Cross-Tenant Access**: Strict data isolation enforced at application layer

39. **Authentication Flow Standards**
    - **Tenant-Scoped Tokens**: JWT tokens include both `user_id` and `tenant_id`
    - **Host-Based Routing**: Authentication context determined by host header
    - **Admin vs Tenant Auth**: Separate authentication systems for admin and tenants
    - **Client-Side Auth Checks**: Always verify tenant context before loading data

38. **API Response Standards**
    - **Consistent Error Format**: All API errors must follow standard format
    - **Success Response Format**: All successful responses must include expected data structure
    - **TypeScript Interfaces**: Define shared interfaces between frontend and backend
    - **Status Code Standards**: Use proper HTTP status codes (200, 401, 404, 500)

39. **Middleware Configuration Rules**
    - **Demo Mode Support**: Authentication middleware must support both JWT and demo tokens
    - **Flexible Auth Checks**: Middleware should check cookies first, then Authorization header
    - **Graceful Degradation**: Disable strict MFA requirements in demo/development mode
    - **Route Protection**: Protect `/api/*` routes but allow `/auth/*` and `/health` endpoints

40. **Multi-Tenant Database Standards**
    - **Tenant Table**: Master source of truth for all tenant routing
    - **Tenant ID Enforcement**: Every table MUST have `tenant_id` foreign key
    - **Query Isolation**: No queries without `tenant_id` parameter binding
    - **Data Sovereignty**: Country-specific D1 regions (GH, NG, KE)
    - **Migration Scripts**: Include tenant_id in all table schemas

41. **Multi-Tenant Development Workflow**
    - **Host Routing**: Test with different host headers for tenant isolation
    - **Tenant Context**: Always test with valid tenant_id in JWT tokens
    - **Public Site Testing**: Test marketing site on root domain separately
    - **Admin Panel Testing**: Test admin functionality on admin subdomain
    - **DNS Setup**: Configure local DNS for subdomain testing

42. **Error Prevention Checklist**
    - **Before Login Implementation**: Verify backend returns expected response format
    - **Before Frontend Integration**: Define TypeScript interfaces for all API responses
    - **Before Production**: Replace demo tokens with proper JWT implementation

43. **Debugging Standards**
    - **Console Logging**: Use structured logging for authentication flows
    - **Error Context**: Always log full error context including request/response data
    - **Network Debugging**: Use browser dev tools to verify API calls and responses
    - **Token Verification**: Log token storage and retrieval for debugging auth issues

44. **Integration Testing Rules**
    - **End-to-End Flow**: Test complete login → dashboard → API call → logout flow
    - **Role-Based Testing**: Verify admin and user roles redirect correctly
    - **Error Scenarios**: Test invalid credentials, network failures, and server errors
    - **Cross-Browser**: Test authentication on Chrome, Firefox, Safari, Edge

45. **Documentation Requirements**
    - **API Documentation**: Document all endpoints with request/response examples
    - **Setup Instructions**: Provide exact commands for backend and frontend setup
    - **Demo Credentials**: Always document demo account credentials in README
    - **Troubleshooting**: Include common issues and solutions in documentation

46. **Security Transition Rules**
    - **Demo to Production**: Clear migration path from demo tokens to JWT + WebAuthn
    - **Middleware Flags**: Use environment variables to enable/disable security features
    - **Audit Trail**: Log all authentication events even in demo mode
    - **Token Expiration**: Implement proper token expiration even for demo tokens

## 🚨 CBMP COMPLIANCE ENFORCEMENT (MANDATORY - 100% LEGAL)

53. **CRITICAL COMPLIANCE MIDDLEWARE ORDER**
    ```typescript
    // MUST BE FIRST - ABSOLUTE COMPLIANCE
    app.use('*', cbmpComplianceMiddleware);    // Block ALL payment code
    app.use('*', businessOnlyMiddleware);      // Business management only
    app.use('*', csvOnlyMiddleware);           // CSV import enforcement
    app.use('*', auditComplianceMiddleware);   // Log all violations
    // Then other middleware...
    ```

54. **ABSOLUTE LEGAL PROTECTION REQUIREMENTS**
    - **Every API Response**: Must include CBMP compliance headers
    - **Complete Payment Blocking**: Return 403 for ANY payment-related request
    - **Audit Logging**: Log every blocked attempt for legal protection
    - **Terms of Service**: Clear business management software status
    - **Zero Payment Code**: Absolutely no payment-related code anywhere

55. **ALLOWED OPERATIONS (BUSINESS MANAGEMENT ONLY)**
    - ✅ Customer relationship management (CRM)
    - ✅ Loan application tracking (manual status only)
    - ✅ CSV data import and basic reporting
    - ✅ Staff and HR management
    - ✅ Document management and KYC uploads
    - ✅ Software subscription billing (platform revenue only)

56. **COMPLETELY PROHIBITED OPERATIONS**
    - ❌ ANY payment processing code or interfaces
    - ❌ Payment gateway configurations or API connections
    - ❌ Transaction processing, transfers, or fund movements
    - ❌ Payment credential storage (even encrypted)
    - ❌ Real-time payment system integrations
    - ❌ Balance tracking or financial calculations

57. **TECHNICAL ENFORCEMENT RULES (CBMP)**
    - **Complete Route Blocking**: ALL payment-related routes → 403
    - **Database Schema**: Zero payment-related fields in any table
    - **Code Scanning**: Automated checks for payment-related keywords
    - **Compliance Headers**: Every response declares business-only status
    - **CSV-Only Import**: Manual data upload is the only financial data source

## 📜 **MANDATORY TOS CLAUSE (CBMP VERSION)**

58. **LEGAL PROTECTION CLAUSE**
    ```html
    <!-- MUST BE INCLUDED IN ALL PAGES -->
    <div class="compliance-notice">
      <p><strong>Business Management Software Only</strong></p>
      <p>This platform is pure business management SaaS. We:</p>
      <ul>
        <li>Do not process payments or handle funds</li>
        <li>Do not access payment systems (Paystack, MTN MoMo, Flutterwave)</li>
        <li>Do not store payment credentials or transaction data</li>
        <li>Do not set up payment systems for clients</li>
      </ul>
      <p>Clients are solely responsible for managing their own payment operations via their licensed payment providers.</p>
      <p><strong>Compliance:</strong> BoG/CBN exempt - software provider only</p>
    </div>
    ```

## 📋 **CBMP IMPLEMENTATION CHECKLIST**

59. **MANDATORY REMOVAL CHECKLIST**
    - [ ] Delete all payment gateway configuration pages
    - [ ] Remove payment credential storage and encryption services
    - [ ] Remove all payment processing endpoints and middleware
    - [ ] Delete transaction amount fields and balance tracking
    - [ ] Remove payment-related database tables and schemas
    - [ ] Update all UI components to remove payment references
    - [ ] Replace payment features with CSV import functionality

60. **CBMP FEATURE IMPLEMENTATION**
    ```typescript
    // CBMP-Compliant Features Only
    const ALLOWED_FEATURES = {
      crm: 'Customer relationship management',
      loans: 'Loan application tracking (manual status)',
      csv: 'CSV data import and reporting',
      hr: 'Staff and employee management',
      documents: 'Document management and KYC uploads',
      subscription: 'Software license billing (platform only)'
    };
    
    const PROHIBITED_FEATURES = {
      payments: 'Any payment processing',
      gateways: 'Payment gateway configurations',
      transactions: 'Real-time transaction processing',
      balances: 'Account balance tracking',
      transfers: 'Fund transfer operations'
    };
    ```

61. **CSV-ONLY DATA IMPORT SYSTEM**
    ```typescript
    // CSV Import Service (CBMP Compliant)
    export class CSVImportService {
      async importBusinessData(file: File, tenantId: string) {
        // Only business data - no payment processing
        const allowedColumns = [
          'customer_name', 'loan_status', 'application_date',
          'kyc_status', 'staff_name', 'expense_category'
        ];
        
        // Block any payment-related columns
        const prohibitedColumns = [
          'amount', 'balance', 'transaction_id', 'payment_status',
          'gateway_response', 'account_number'
        ];
        
        // Validate CSV contains only business management data
        return this.processBusinessCSV(file, tenantId, allowedColumns);
      }
    }
    ```
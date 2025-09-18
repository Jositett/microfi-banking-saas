# 🌐 Sprint 6: Multi-Tenant Infrastructure Implementation

## 📊 **Sprint Objective**
Transform MicroFi from single-tenant to multi-tenant SaaS architecture with strict data isolation and domain-based routing.

**Target**: Achieve 40% Multi-Tenant Infrastructure completion  
**Duration**: 2 weeks (10 working days)  
**Priority**: Critical architectural transformation  

---

## 🎯 **Sprint Goals**

### **Primary Objectives**
1. **Database Migration**: Add tenant_id to all tables with proper constraints
2. **Host Routing**: Implement domain-based routing in Cloudflare Workers
3. **Tenant Middleware**: Enforce tenant_id in all database queries
4. **Public Site**: Deploy marketing site to root domain

### **Success Criteria**
- [ ] Zero cross-tenant data access possible
- [ ] Host-based routing functional for all domain types
- [ ] All database queries include tenant_id parameter
- [ ] Public marketing site operational on microfi.com

---

## 🗂️ **Database Migration Plan**

### **Phase 1: Schema Transformation**
```sql
-- Create tenants master table
CREATE TABLE tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'starter',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);

-- Add tenant_id to all existing tables
ALTER TABLE users ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;
ALTER TABLE accounts ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;
ALTER TABLE transactions ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;
ALTER TABLE subscriptions ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;
ALTER TABLE gateway_configs ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;
ALTER TABLE communication_usage ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1;

-- Add foreign key constraints
ALTER TABLE users ADD FOREIGN KEY(tenant_id) REFERENCES tenants(id);
ALTER TABLE accounts ADD FOREIGN KEY(tenant_id) REFERENCES tenants(id);
ALTER TABLE transactions ADD FOREIGN KEY(tenant_id) REFERENCES tenants(id);

-- Create performance indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_accounts_tenant_id ON accounts(tenant_id);
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_tenants_host ON tenants(host);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);
```

### **Phase 2: Data Migration**
```sql
-- Create default tenant for existing data
INSERT INTO tenants (id, host, name, country_code) 
VALUES (1, 'demo', 'Demo Tenant', 'GH');

-- Verify all existing data has tenant_id = 1
UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE accounts SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE transactions SET tenant_id = 1 WHERE tenant_id IS NULL;
```

---

## 🌐 **Host Routing Implementation**

### **Core Routing Logic**
```typescript
// backend/src/routing/host-router.ts
export class HostRouter {
  static async route(request: Request, env: Env): Promise<Response> {
    const host = request.headers.get('Host') || '';
    const url = new URL(request.url);
    
    // 1. PUBLIC SITE: Root domain
    if (this.isRootDomain(host)) {
      return this.handlePublicSite(request, env);
    }
    
    // 2. ADMIN PANEL: admin subdomain
    if (this.isAdminDomain(host)) {
      return this.handleAdminPanel(request, env);
    }
    
    // 3. TENANT SITES: All other domains
    const tenant = await this.getTenantByHost(host, env);
    if (!tenant) {
      return new Response('Tenant not found', { status: 404 });
    }
    
    return this.handleTenant(request, tenant, env);
  }
  
  private static isRootDomain(host: string): boolean {
    return host === 'microfi.com' || host === 'www.microfi.com';
  }
  
  private static isAdminDomain(host: string): boolean {
    return host === 'admin.microfi.com';
  }
  
  private static async getTenantByHost(host: string, env: Env) {
    const db = env.DB;
    
    // Extract subdomain (e.g., "client1" from "client1.microfi.com")
    const subdomain = host.replace('.microfi.com', '');
    
    const result = await db.prepare(`
      SELECT * FROM tenants 
      WHERE host = ? OR custom_domain = ?
    `).bind(subdomain, host).first();
    
    return result;
  }
}
```

### **Tenant Middleware**
```typescript
// backend/src/middleware/tenant.ts
export const tenantMiddleware = async (c: Context, next: Next) => {
  const host = c.req.header('Host');
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  
  try {
    const payload = jwt.verify(token, c.env.JWT_SECRET) as any;
    const tenant = await getTenantByHost(host, c.env);
    
    if (!tenant) {
      return c.json({ error: 'Invalid tenant' }, 404);
    }
    
    // Critical: Verify token tenant matches host tenant
    if (payload.tenant_id !== tenant.id) {
      return c.json({ error: 'Tenant mismatch' }, 401);
    }
    
    c.set('tenant', tenant);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
```

---

## 🔒 **Query Isolation Implementation**

### **Database Service Layer**
```typescript
// backend/src/services/database.ts
export class DatabaseService {
  private db: D1Database;
  private tenantId: number;
  
  constructor(db: D1Database, tenantId: number) {
    this.db = db;
    this.tenantId = tenantId;
  }
  
  // All queries automatically include tenant_id
  async getUsers(role?: string) {
    let query = 'SELECT * FROM users WHERE tenant_id = ?';
    let params = [this.tenantId];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    return await this.db.prepare(query).bind(...params).all();
  }
  
  async getAccounts(userId?: string) {
    let query = 'SELECT * FROM accounts WHERE tenant_id = ?';
    let params = [this.tenantId];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    return await this.db.prepare(query).bind(...params).all();
  }
  
  async createTransaction(data: any) {
    return await this.db.prepare(`
      INSERT INTO transactions (tenant_id, user_id, amount, type, description)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      this.tenantId,
      data.userId,
      data.amount,
      data.type,
      data.description
    ).run();
  }
}
```

### **Updated Route Handlers**
```typescript
// backend/src/routes/accounts.ts (updated)
accountsRouter.get('/', async (c) => {
  const tenant = c.get('tenant');
  const user = c.get('user');
  
  const dbService = new DatabaseService(c.env.DB, tenant.id);
  const accounts = await dbService.getAccounts(user.user_id);
  
  return c.json({ accounts: accounts.results });
});
```

---

## 🌍 **Public Site Implementation**

### **Static Marketing Site**
```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MicroFi - Multi-Tenant Banking SaaS</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <header class="bg-white shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-gray-900">MicroFi</h1>
        </div>
        <div class="flex items-center space-x-4">
          <a href="#pricing" class="text-gray-700 hover:text-gray-900">Pricing</a>
          <a href="#demo" class="bg-blue-600 text-white px-4 py-2 rounded-md">Try Demo</a>
          <a href="#signup" class="bg-green-600 text-white px-4 py-2 rounded-md">Get Started</a>
        </div>
      </div>
    </nav>
  </header>
  
  <main>
    <section class="py-20 text-center">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">
        Banking SaaS for Microfinance Institutions
      </h2>
      <p class="text-xl text-gray-600 mb-8">
        Launch your own branded banking platform in minutes
      </p>
      <div class="space-x-4">
        <button onclick="startDemo()" class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg">
          Try Free Demo
        </button>
        <button onclick="showSignup()" class="bg-green-600 text-white px-8 py-3 rounded-lg text-lg">
          Start Your Platform
        </button>
      </div>
    </section>
  </main>
  
  <script>
    async function startDemo() {
      const response = await fetch('/api/public/demo', { method: 'POST' });
      const result = await response.json();
      window.open(`https://${result.subdomain}`, '_blank');
    }
    
    function showSignup() {
      document.getElementById('signup-modal').classList.remove('hidden');
    }
  </script>
</body>
</html>
```

### **Public API Endpoints**
```typescript
// backend/src/routes/public.ts
export const publicRouter = new Hono();

// Create demo tenant
publicRouter.post('/demo', async (c) => {
  const demoHost = `demo${Date.now()}`;
  
  const tenant = await c.env.DB.prepare(`
    INSERT INTO tenants (host, name, country_code, status)
    VALUES (?, ?, ?, ?)
  `).bind(demoHost, 'Demo Tenant', 'GH', 'demo').run();
  
  return c.json({
    subdomain: `${demoHost}.microfi.com`,
    expires: '24 hours'
  });
});

// Create new tenant
publicRouter.post('/signup', async (c) => {
  const { name, country, email } = await c.req.json();
  
  const host = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const tenant = await c.env.DB.prepare(`
    INSERT INTO tenants (host, name, country_code)
    VALUES (?, ?, ?)
  `).bind(host, name, country).run();
  
  return c.json({
    subdomain: `${host}.microfi.com`,
    setupUrl: `https://${host}.microfi.com/setup`
  });
});
```

---

## 📋 **Implementation Checklist**

### **Week 1: Database & Core Infrastructure**
- [ ] **Day 1-2**: Create and run database migration scripts
- [ ] **Day 3**: Implement host routing logic in Workers
- [ ] **Day 4**: Create tenant middleware and validation
- [ ] **Day 5**: Update all existing routes with tenant context

### **Week 2: Public Site & Testing**
- [ ] **Day 6-7**: Deploy public marketing site to microfi.com
- [ ] **Day 8**: Implement public API endpoints (demo, signup)
- [ ] **Day 9**: Test tenant isolation with multiple test tenants
- [ ] **Day 10**: Performance testing and optimization

---

## 🧪 **Testing Strategy**

### **Tenant Isolation Tests**
```typescript
// tests/tenant-isolation.test.ts
describe('Tenant Isolation', () => {
  test('should not access cross-tenant data', async () => {
    // Create two test tenants
    const tenant1 = await createTestTenant('tenant1');
    const tenant2 = await createTestTenant('tenant2');
    
    // Create user in tenant1
    const user1 = await createTestUser(tenant1.id);
    
    // Try to access tenant1 data with tenant2 token
    const tenant2Token = generateJWT({ tenant_id: tenant2.id });
    
    const response = await fetch('/api/accounts', {
      headers: {
        'Host': 'tenant1.microfi.com',
        'Authorization': `Bearer ${tenant2Token}`
      }
    });
    
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Tenant mismatch' });
  });
});
```

### **Performance Tests**
```typescript
// tests/multi-tenant-performance.test.ts
describe('Multi-Tenant Performance', () => {
  test('should maintain <100ms response time with 100 tenants', async () => {
    const tenants = await createMultipleTestTenants(100);
    
    const promises = tenants.map(tenant => {
      return measureResponseTime(`https://${tenant.host}.microfi.com/api/accounts`);
    });
    
    const responseTimes = await Promise.all(promises);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    
    expect(avgResponseTime).toBeLessThan(100);
  });
});
```

---

## 🎯 **Success Metrics**

### **Technical KPIs**
- [ ] **Database Migration**: 100% of tables include tenant_id
- [ ] **Query Isolation**: 0 queries without tenant_id parameter
- [ ] **Host Routing**: 100% accurate domain routing
- [ ] **Performance**: <100ms response time per tenant

### **Functional KPIs**
- [ ] **Public Site**: Marketing site operational on microfi.com
- [ ] **Demo Creation**: Automated demo tenant provisioning
- [ ] **Tenant Signup**: Self-service tenant creation
- [ ] **Data Isolation**: Zero cross-tenant data access

### **Business KPIs**
- [ ] **Demo Conversion**: Track demo-to-signup conversion rate
- [ ] **Tenant Onboarding**: <5 minutes from signup to operational
- [ ] **Support Reduction**: Self-service reduces support tickets
- [ ] **Market Validation**: Positive feedback from pilot tenants

---

## 🚨 **Risk Mitigation**

### **High Risk Items**
1. **Data Migration Failure**
   - **Risk**: Existing data corruption during tenant_id addition
   - **Mitigation**: Full database backup before migration, rollback plan

2. **Performance Degradation**
   - **Risk**: Multi-tenant queries slower than single-tenant
   - **Mitigation**: Comprehensive indexing, query optimization

3. **Security Vulnerabilities**
   - **Risk**: Cross-tenant data leakage through routing bugs
   - **Mitigation**: Extensive isolation testing, security audit

### **Medium Risk Items**
1. **DNS Configuration**
   - **Risk**: Subdomain routing issues affecting tenant access
   - **Mitigation**: Cloudflare Pages configuration testing

2. **Token Validation**
   - **Risk**: JWT tenant_id verification bypass
   - **Mitigation**: Multiple validation layers, comprehensive testing

---

## 🔮 **Post-Sprint 6 Status**

### **Expected Completion**
- **Multi-Tenant Infrastructure**: 40% ✅
- **Database Schema**: 100% ✅
- **Host Routing**: 80% ✅
- **Tenant Isolation**: 70% ✅
- **Public Site**: 60% ✅

### **Next Sprint (Sprint 7) Preparation**
- Admin panel development
- Tenant onboarding automation
- Custom domain support
- Advanced security features

**Sprint 6 Goal**: Establish solid multi-tenant foundation with strict data isolation and functional domain routing.

**Success Definition**: Zero cross-tenant data access possible + functional public site + automated tenant creation.**
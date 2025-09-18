# Multi-Tenant SaaS Conversion Implementation Plan

## 🎯 **Conversion Overview**

**Objective**: Transform single-tenant banking platform to multi-tenant SaaS with domain-based routing and strict tenant isolation.

**Timeline**: 4 phases over 2-3 weeks
**Risk Level**: Medium (requires careful data migration)
**Rollback Strategy**: Git branches + database backups

## 📋 **Phase 1: Database Schema Migration (Days 1-2)**

### **1.1 Tenant Management Tables**
```sql
-- Create tenants table (master source of truth)
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  status TEXT DEFAULT 'active',
  subscription_plan TEXT DEFAULT 'starter',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create tenant_settings table
CREATE TABLE tenant_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  currency TEXT DEFAULT 'GHS',
  timezone TEXT DEFAULT 'Africa/Accra',
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

### **1.2 Add tenant_id to Existing Tables**
```sql
-- Add tenant_id to all existing tables
ALTER TABLE users ADD COLUMN tenant_id TEXT;
ALTER TABLE accounts ADD COLUMN tenant_id TEXT;
ALTER TABLE transactions ADD COLUMN tenant_id TEXT;
ALTER TABLE savings_plans ADD COLUMN tenant_id TEXT;
ALTER TABLE loans ADD COLUMN tenant_id TEXT;
ALTER TABLE audit_logs ADD COLUMN tenant_id TEXT;

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_accounts_tenant_id ON accounts(tenant_id);
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
```

### **1.3 Data Migration Strategy**
```sql
-- Create default tenant for existing data
INSERT INTO tenants (id, name, domain, status) 
VALUES ('demo-tenant', 'Demo Banking', 'demo.microfi.com', 'active');

-- Migrate existing users to demo tenant
UPDATE users SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE accounts SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE transactions SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
```

## 📋 **Phase 2: Backend Architecture Update (Days 3-5)**

### **2.1 Tenant Resolution Middleware**
```typescript
// backend/src/middleware/tenant-resolver.ts
export const tenantResolver = async (c: Context, next: Next) => {
  const host = c.req.header('host') || '';
  const subdomain = host.split('.')[0];
  
  // Resolve tenant from subdomain
  const tenant = await c.env.DB.prepare(
    'SELECT * FROM tenants WHERE domain = ? OR custom_domain = ?'
  ).bind(`${subdomain}.microfi.com`, host).first();
  
  if (!tenant && !['localhost', '127.0.0.1'].includes(host.split(':')[0])) {
    return c.json({ error: 'Tenant not found' }, 404);
  }
  
  c.set('tenant', tenant);
  await next();
};
```

### **2.2 Update Authentication Middleware**
```typescript
// backend/src/middleware/auth.ts
export const authMiddleware = async (c: Context, next: Next) => {
  const tenant = c.get('tenant');
  const token = c.req.header('Authorization')?.replace('Bearer ', '') || 
                getCookie(c, 'auth-token');
  
  if (!token) return c.json({ error: 'Authentication required' }, 401);
  
  const payload = await verifyJWT(token);
  if (tenant && payload.tenant_id !== tenant.id) {
    return c.json({ error: 'Invalid tenant context' }, 403);
  }
  
  c.set('user', payload);
  await next();
};
```

### **2.3 Update All Service Classes**
```typescript
// Example: backend/src/services/account.ts
export class AccountService {
  static async getAccounts(db: D1Database, userId: string, tenantId: string) {
    return await db.prepare(
      'SELECT * FROM accounts WHERE user_id = ? AND tenant_id = ?'
    ).bind(userId, tenantId).all();
  }
  
  static async createAccount(db: D1Database, data: CreateAccountData, tenantId: string) {
    return await db.prepare(
      'INSERT INTO accounts (id, user_id, tenant_id, account_number, balance, type) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(data.id, data.userId, tenantId, data.accountNumber, data.balance, data.type).run();
  }
}
```

## 📋 **Phase 3: Frontend Multi-Tenant Support (Days 6-8)**

### **3.1 Tenant Context Provider**
```typescript
// lib/tenant-context.tsx
export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  
  useEffect(() => {
    const host = window.location.host;
    fetch(`/api/tenant/resolve?host=${host}`)
      .then(res => res.json())
      .then(setTenant);
  }, []);
  
  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};
```

### **3.2 Update API Client**
```typescript
// lib/api-client.ts
export class ApiClient {
  private static getHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      'X-Tenant-Host': window.location.host
    };
  }
  
  static async request(endpoint: string, options: RequestInit = {}) {
    return fetch(`/api${endpoint}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers }
    });
  }
}
```

### **3.3 Tenant-Aware Components**
```typescript
// components/tenant/tenant-branding.tsx
export const TenantBranding = () => {
  const { tenant } = useTenant();
  
  return (
    <div style={{ '--primary-color': tenant?.settings?.primary_color }}>
      {tenant?.settings?.logo_url && (
        <img src={tenant.settings.logo_url} alt={tenant.name} />
      )}
      <h1>{tenant?.name || 'MicroFi Banking'}</h1>
    </div>
  );
};
```

## 📋 **Phase 4: Admin Panel & Tenant Management (Days 9-10)**

### **4.1 Admin Authentication System**
```typescript
// backend/src/routes/admin-auth.ts
export const adminAuthRouter = new Hono()
  .post('/login', async (c) => {
    const { email, password } = await c.req.json();
    
    // Separate admin user table
    const admin = await c.env.DB.prepare(
      'SELECT * FROM admin_users WHERE email = ?'
    ).bind(email).first();
    
    if (admin && await verifyPassword(password, admin.password_hash)) {
      const token = await signJWT({ 
        userId: admin.id, 
        role: 'admin',
        type: 'admin' 
      });
      return c.json({ token, user: admin });
    }
    
    return c.json({ error: 'Invalid credentials' }, 401);
  });
```

### **4.2 Tenant Management API**
```typescript
// backend/src/routes/admin-tenants.ts
export const adminTenantsRouter = new Hono()
  .get('/', async (c) => {
    const tenants = await c.env.DB.prepare(
      'SELECT t.*, COUNT(u.id) as user_count FROM tenants t LEFT JOIN users u ON t.id = u.tenant_id GROUP BY t.id'
    ).all();
    return c.json(tenants);
  })
  .post('/', async (c) => {
    const { name, domain } = await c.req.json();
    const tenantId = generateId();
    
    await c.env.DB.prepare(
      'INSERT INTO tenants (id, name, domain) VALUES (?, ?, ?)'
    ).bind(tenantId, name, domain).run();
    
    return c.json({ id: tenantId, name, domain });
  });
```

## 🔧 **Implementation Steps**

### **Step 1: Database Migration**
```bash
# Create migration files
cd backend/migrations
touch 006_add_tenant_support.sql
touch 007_migrate_existing_data.sql

# Apply migrations
wrangler d1 migrations apply microfi-banking --local
wrangler d1 migrations apply microfi-banking --remote
```

### **Step 2: Backend Updates**
```bash
# Create new middleware and services
mkdir -p backend/src/middleware
mkdir -p backend/src/routes/admin
mkdir -p backend/src/services/tenant

# Update existing services with tenant isolation
# Test with local development
wrangler dev --port 8787
```

### **Step 3: Frontend Updates**
```bash
# Create tenant context and components
mkdir -p components/tenant
mkdir -p components/admin
mkdir -p lib/tenant

# Update existing components
# Test with development server
npm run dev
```

### **Step 4: Admin Panel**
```bash
# Create admin subdomain routing
# Deploy admin panel
# Test tenant creation and management
```

## 🧪 **Testing Strategy**

### **Local Testing Setup**
```bash
# Add to /etc/hosts (Windows: C:\Windows\System32\drivers\etc\hosts)
127.0.0.1 demo.microfi.local
127.0.0.1 client1.microfi.local
127.0.0.1 admin.microfi.local

# Test different tenant contexts
curl -H "Host: demo.microfi.local" http://localhost:3000/api/accounts
curl -H "Host: client1.microfi.local" http://localhost:3000/api/accounts
```

### **Integration Tests**
```typescript
// tests/integration/multi-tenant.test.ts
describe('Multi-tenant isolation', () => {
  test('should isolate data between tenants', async () => {
    const tenant1Response = await request(app)
      .get('/api/accounts')
      .set('Host', 'tenant1.microfi.com')
      .set('Authorization', `Bearer ${tenant1Token}`);
    
    const tenant2Response = await request(app)
      .get('/api/accounts')
      .set('Host', 'tenant2.microfi.com')
      .set('Authorization', `Bearer ${tenant2Token}`);
    
    expect(tenant1Response.body).not.toEqual(tenant2Response.body);
  });
});
```

## 🚀 **Deployment Strategy**

### **Staging Deployment**
1. Deploy backend with feature flags
2. Test with staging subdomains
3. Verify tenant isolation
4. Performance testing

### **Production Rollout**
1. Blue-green deployment
2. DNS updates for subdomains
3. Monitor tenant routing
4. Gradual traffic migration

## 📊 **Success Metrics**

- ✅ Zero cross-tenant data leakage
- ✅ <100ms tenant resolution time
- ✅ 99.9% uptime during migration
- ✅ All existing functionality preserved
- ✅ Admin panel operational

## 🔄 **Rollback Plan**

1. **Database Rollback**: Restore from pre-migration backup
2. **Code Rollback**: Revert to single-tenant branch
3. **DNS Rollback**: Point domains back to original setup
4. **Data Recovery**: Restore user sessions and transactions

---

**This plan ensures systematic conversion to multi-tenant architecture with minimal downtime and zero data loss.**
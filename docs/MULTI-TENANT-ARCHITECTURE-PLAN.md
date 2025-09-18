# 🌐 MicroFi Multi-Tenant SaaS Architecture Plan

## 📊 **Architecture Overview**

**Transformation**: Single-tenant → Multi-tenant SaaS platform  
**Domain Strategy**: Root domain + subdomains + custom domains  
**Data Isolation**: Application-layer with strict tenant_id enforcement  
**Target**: 10,000+ tenants with zero data leakage risk  

---

## 🌍 **Domain Structure & Routing**

### **Domain Types**
| Domain Type | Example | Purpose | Authentication |
|-------------|---------|---------|----------------|
| **Root Domain** | `microfi.com` | Public marketing, demo, signup | Public access |
| **Admin Panel** | `admin.microfi.com` | Tenant management dashboard | Admin-only auth |
| **Tenant Subdomains** | `client1.microfi.com` | Client-specific instances | Tenant-scoped auth |
| **Custom Domains** | `mymfi.com` | Client-branded instances | Tenant-scoped auth |

### **Routing Logic Flow**
```typescript
// Host-based routing in Cloudflare Workers
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const host = request.headers.get('Host');
    
    // 1. PUBLIC SITE: Root domain
    if (host === 'microfi.com' || host === 'www.microfi.com') {
      return handlePublicSite(request, env);
    }
    
    // 2. ADMIN PANEL: admin subdomain
    if (host === 'admin.microfi.com') {
      return handleAdminPanel(request, env);
    }
    
    // 3. TENANT SITES: All other domains
    const tenant = await getTenantByHost(host, env);
    if (!tenant) {
      return new Response('Tenant not found', { status: 404 });
    }
    
    return handleTenant(request, tenant, env);
  }
};
```

---

## 🗂️ **Database Schema Transformation**

### **New Multi-Tenant Schema**
```sql
-- Master tenants table
CREATE TABLE tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host TEXT UNIQUE NOT NULL,           -- e.g., "client1"
  custom_domain TEXT UNIQUE,           -- e.g., "mymfi.com"
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,          -- ISO 3166-1 (GH, NG, KE)
  subscription_plan TEXT DEFAULT 'starter',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);

-- All existing tables get tenant_id
ALTER TABLE users ADD COLUMN tenant_id INTEGER NOT NULL;
ALTER TABLE accounts ADD COLUMN tenant_id INTEGER NOT NULL;
ALTER TABLE transactions ADD COLUMN tenant_id INTEGER NOT NULL;
ALTER TABLE subscriptions ADD COLUMN tenant_id INTEGER NOT NULL;
ALTER TABLE gateway_configs ADD COLUMN tenant_id INTEGER NOT NULL;
ALTER TABLE communication_usage ADD COLUMN tenant_id INTEGER NOT NULL;

-- Foreign key constraints
ALTER TABLE users ADD FOREIGN KEY(tenant_id) REFERENCES tenants(id);
ALTER TABLE accounts ADD FOREIGN KEY(tenant_id) REFERENCES tenants(id);
ALTER TABLE transactions ADD FOREIGN KEY(tenant_id) REFERENCES tenants(id);

-- Indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_accounts_tenant_id ON accounts(tenant_id);
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
```

### **Query Transformation Examples**
```typescript
// OLD: Single-tenant query
const users = await db.prepare('SELECT * FROM users WHERE role = ?').bind('admin').all();

// NEW: Multi-tenant query (REQUIRED)
const users = await db.prepare(
  'SELECT * FROM users WHERE tenant_id = ? AND role = ?'
).bind(tenantId, 'admin').all();
```

---

## 🔒 **Security & Isolation**

### **Tenant Isolation Enforcement**
```typescript
// JWT token structure
interface TenantJWT {
  user_id: string;
  tenant_id: number;
  role: string;
  exp: number;
}

// Middleware for tenant verification
export const tenantMiddleware = async (c: Context, next: Next) => {
  const host = c.req.header('Host');
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) return c.json({ error: 'Authentication required' }, 401);
  
  const payload = jwt.verify(token, c.env.JWT_SECRET) as TenantJWT;
  const tenant = await getTenantByHost(host, c.env);
  
  // Critical: Verify token tenant matches host tenant
  if (!tenant || payload.tenant_id !== tenant.id) {
    return c.json({ error: 'Tenant mismatch' }, 401);
  }
  
  c.set('tenant', tenant);
  c.set('user', payload);
  await next();
};
```

### **Data Sovereignty Compliance**
```typescript
// Country-specific D1 regions
const getD1Region = (countryCode: string): string => {
  switch (countryCode) {
    case 'GH': return 'weur'; // West Europe (closest to Ghana)
    case 'NG': return 'weur'; // West Europe (closest to Nigeria)
    case 'KE': return 'eeur'; // East Europe (closest to Kenya)
    default: return 'weur';
  }
};
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Core Infrastructure (Week 1)**
- [ ] **Database Migration**: Add tenant_id to all tables
- [ ] **Host Routing**: Implement domain-based routing logic
- [ ] **Public Site**: Deploy marketing site to root domain
- [ ] **Admin Panel**: Create tenant management interface

### **Phase 2: Tenant Onboarding (Week 2)**
- [ ] **Signup Flow**: Public site tenant creation
- [ ] **Subdomain Generation**: Automatic tenant.microfi.com creation
- [ ] **DNS Configuration**: Cloudflare Pages domain setup
- [ ] **Tenant Isolation**: Enforce strict data separation

### **Phase 3: Security & Compliance (Week 3)**
- [ ] **JWT Enhancement**: Add tenant_id to all tokens
- [ ] **MFA Integration**: Tenant-scoped WebAuthn
- [ ] **Audit Logging**: Multi-tenant audit trails
- [ ] **Rate Limiting**: Per-tenant rate limits

### **Phase 4: Advanced Features (Week 4)**
- [ ] **Custom Domains**: Client-branded domain support
- [ ] **Tenant Analytics**: Usage and billing per tenant
- [ ] **Backup & Recovery**: Tenant-specific data backup
- [ ] **Performance Optimization**: Multi-tenant caching

---

## 💰 **Updated Business Model**

### **SaaS Pricing Structure**
```typescript
interface TenantPricing {
  plan: 'starter' | 'growth' | 'professional' | 'enterprise';
  monthlyFee: number;
  userLimit: number;
  transactionLimit: number;
  customDomain: boolean;
  whiteLabel: boolean;
}

const PRICING_TIERS: Record<string, TenantPricing> = {
  starter: {
    plan: 'starter',
    monthlyFee: 12000, // GHS 120/month
    userLimit: 50,
    transactionLimit: 1000,
    customDomain: false,
    whiteLabel: false
  },
  growth: {
    plan: 'growth',
    monthlyFee: 24000, // GHS 240/month
    userLimit: 200,
    transactionLimit: 5000,
    customDomain: true,
    whiteLabel: false
  },
  professional: {
    plan: 'professional',
    monthlyFee: 48000, // GHS 480/month
    userLimit: 1000,
    transactionLimit: 20000,
    customDomain: true,
    whiteLabel: true
  }
};
```

### **Revenue Projections**
- **100 Tenants**: GHS 12,000 - 48,000/month recurring
- **1,000 Tenants**: GHS 120,000 - 480,000/month recurring
- **Communication Revenue**: Additional GHS 50-200/tenant/month
- **Custom Domain Setup**: One-time GHS 500 fee

---

## 🌍 **Global Expansion Strategy**

### **Regional Deployment**
```typescript
// Country-specific configurations
interface RegionalConfig {
  countryCode: string;
  currency: string;
  d1Region: string;
  regulatoryCompliance: string[];
  localPaymentGateways: string[];
}

const REGIONAL_CONFIGS: Record<string, RegionalConfig> = {
  GH: {
    countryCode: 'GH',
    currency: 'GHS',
    d1Region: 'weur',
    regulatoryCompliance: ['BoG', 'GDPR'],
    localPaymentGateways: ['paystack', 'flutterwave']
  },
  NG: {
    countryCode: 'NG',
    currency: 'NGN',
    d1Region: 'weur',
    regulatoryCompliance: ['CBN', 'GDPR'],
    localPaymentGateways: ['paystack', 'flutterwave']
  },
  KE: {
    countryCode: 'KE',
    currency: 'KES',
    d1Region: 'eeur',
    regulatoryCompliance: ['CBK', 'GDPR'],
    localPaymentGateways: ['mpesa', 'flutterwave']
  }
};
```

---

## 📊 **Updated Feature Tally**

### **Multi-Tenant Infrastructure** - NEW
| Feature | Status | Implementation Details |
|---------|--------|------------------------|
| **Host-Based Routing** | 🔄 **IN PROGRESS** | Domain routing logic for public/admin/tenant sites |
| **Tenant Isolation** | 🔄 **IN PROGRESS** | Strict data separation with tenant_id enforcement |
| **Public Marketing Site** | 🔄 **IN PROGRESS** | Root domain serving landing page and signup |
| **Admin Panel** | 🔄 **IN PROGRESS** | Tenant management dashboard on admin subdomain |
| **Custom Domain Support** | ⏳ **PLANNED** | Client-branded domain configuration |

### **Updated Core Categories**
| Category | Previous | **New Target** | Gap Analysis |
|----------|----------|----------------|--------------|
| **Multi-Tenant Architecture** | 0% | **100%** | Complete infrastructure transformation |
| **SaaS Business Model** | 100% | **100%** | Enhanced with tenant-based pricing |
| **Global Compliance** | 60% | **90%** | Country-specific data residency |
| **Scalability** | 85% | **95%** | 10,000+ tenant support |

---

## 🎯 **Success Metrics**

### **Technical KPIs**
- **Tenant Isolation**: 100% data separation (zero leakage)
- **Performance**: <100ms response time per tenant
- **Scalability**: Support 10,000+ tenants on single D1 instance
- **Uptime**: 99.9% availability across all tenant domains

### **Business KPIs**
- **Tenant Acquisition**: 100 tenants in first 6 months
- **Revenue Growth**: GHS 100,000/month recurring by month 6
- **Churn Rate**: <5% monthly tenant churn
- **Expansion Revenue**: 30% of tenants upgrade plans

### **Compliance KPIs**
- **Data Residency**: 100% compliance with local regulations
- **Security Audits**: Zero critical vulnerabilities
- **Audit Trail Coverage**: 100% of tenant actions logged
- **Regulatory Approval**: Licensed in GH, NG, KE markets

---

## 🚨 **Critical Implementation Rules**

### **Zero-Trust Database Access**
```typescript
// ❌ NEVER DO THIS (no tenant_id)
const users = await db.prepare('SELECT * FROM users').all();

// ✅ ALWAYS DO THIS (with tenant_id)
const users = await db.prepare(
  'SELECT * FROM users WHERE tenant_id = ?'
).bind(tenantId).all();
```

### **Host Header Validation**
```typescript
// ❌ NEVER TRUST HOST HEADER ALONE
const host = request.headers.get('Host');
// Process request...

// ✅ ALWAYS VALIDATE AGAINST TENANTS TABLE
const host = request.headers.get('Host');
const tenant = await validateTenantHost(host, env);
if (!tenant) return new Response('Invalid tenant', { status: 404 });
```

### **JWT Tenant Verification**
```typescript
// ❌ INSUFFICIENT (missing tenant verification)
const payload = jwt.verify(token, secret);

// ✅ COMPLETE (with tenant verification)
const payload = jwt.verify(token, secret);
const tenant = await getTenantByHost(host, env);
if (payload.tenant_id !== tenant.id) {
  throw new Error('Tenant mismatch');
}
```

---

## 🔮 **Future Roadmap**

### **Phase 5: Advanced Multi-Tenancy (Month 2)**
- [ ] **Tenant Analytics**: Usage dashboards per tenant
- [ ] **White-Label Branding**: Custom logos and themes
- [ ] **API Rate Limiting**: Per-tenant quotas
- [ ] **Backup & Recovery**: Tenant-specific data export

### **Phase 6: Enterprise Features (Month 3)**
- [ ] **SSO Integration**: Tenant-specific SAML/OAuth
- [ ] **Advanced Permissions**: Role-based access per tenant
- [ ] **Compliance Reporting**: Automated regulatory reports
- [ ] **Multi-Region Deployment**: Global data residency

### **Phase 7: Platform Ecosystem (Month 4+)**
- [ ] **Tenant Marketplace**: App store for tenant add-ons
- [ ] **API Ecosystem**: Third-party integrations per tenant
- [ ] **Partner Program**: Reseller and integration partners
- [ ] **Enterprise Sales**: Dedicated tenant success teams

**Status**: 🚀 **Ready to begin multi-tenant transformation**

This architecture positions MicroFi as a true SaaS platform capable of serving thousands of microfinance institutions globally while maintaining strict data isolation and regulatory compliance.
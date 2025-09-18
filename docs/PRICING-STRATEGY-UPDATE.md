# 💰 MicroFi SaaS - Updated Pricing Strategy

## 🎯 **New Pricing Structure with Custom Domains**

**Updated**: September 18, 2025  
**Focus**: Premium custom domain and email features  
**Revenue Impact**: +40% average revenue per tenant

---

## 📊 **Updated Subscription Plans**

### **Starter Plan - GHS 120/month**
- ✅ Basic financial dashboard
- ✅ Up to 5 users
- ✅ Transaction viewing (read-only)
- ✅ Basic reporting
- ✅ **Email redirect** (via Cloudflare to specified email)
- ✅ Email support

**Target Market**: Small fintech startups, MVPs  
**Email Feature**: `tenant@microfi.com` → redirects to `client@gmail.com`

### **Professional Plan - GHS 240/month**
- ✅ Advanced financial dashboard
- ✅ Up to 25 users
- ✅ Unlimited transaction viewing
- ✅ Advanced reporting & analytics
- ✅ Custom branding
- ✅ **Email redirect** (via Cloudflare to specified email)
- ✅ Priority support

**Target Market**: Growing fintech companies  
**Email Feature**: `tenant@microfi.com` → redirects to `client@company.com`

### **🆕 Premium Plan - GHS 500/month**
- ✅ Full financial management suite
- ✅ Up to 100 users
- ✅ **Custom domain** (`clientbank.com`)
- ✅ **Professional email** (`support@clientbank.com`)
- ✅ Advanced analytics & reporting
- ✅ White-label solution
- ✅ Priority support
- ✅ SSL certificates included

**Target Market**: Established financial institutions  
**Email Feature**: Full custom domain with professional email addresses

### **Enterprise Plan - GHS 800/month**
- ✅ Enterprise financial management suite
- ✅ Unlimited users
- ✅ **Multiple custom domains** (up to 5)
- ✅ **Enterprise email suite** (unlimited addresses)
- ✅ Custom integrations & API access
- ✅ Dedicated account manager
- ✅ SLA guarantee (99.9% uptime)

**Target Market**: Large banks, enterprise clients  
**Email Feature**: Multiple domains with unlimited professional email addresses

---

## 🔧 **Technical Implementation**

### **Email Routing Architecture**

#### **Basic Plans (Starter/Professional)**
```typescript
// Cloudflare Email Routing - Simple Redirect
const emailRedirect = {
  source: 'tenant@microfi.com',
  destination: 'client@gmail.com',
  type: 'redirect'
};
```

#### **Premium Plans (Premium/Enterprise)**
```typescript
// Custom Domain Email - Full Professional Setup
const customDomainEmail = {
  domain: 'clientbank.com',
  emails: [
    'support@clientbank.com',
    'info@clientbank.com',
    'admin@clientbank.com'
  ],
  mx_records: 'route.mx.cloudflare.net',
  ssl_enabled: true
};
```

### **Database Schema**
```sql
-- Email routing tables
CREATE TABLE email_routes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  custom_domain TEXT NOT NULL,
  email_address TEXT NOT NULL,
  destination_email TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

CREATE TABLE custom_domains (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  domain_name TEXT UNIQUE NOT NULL,
  verification_status TEXT DEFAULT 'pending',
  ssl_status TEXT DEFAULT 'pending'
);
```

---

## 💡 **Business Impact Analysis**

### **Revenue Increase Projections**

#### **Current vs New Pricing**
```
Old Average: GHS 280/month per tenant
New Average: GHS 390/month per tenant (+39% increase)

Premium Adoption (20%): +GHS 110/month per premium tenant
Enterprise Adoption (10%): +GHS 210/month per enterprise tenant
```

#### **Monthly Revenue Impact**
```
1,000 tenants with new pricing:
- 50% Starter (GHS 120): GHS 60,000
- 30% Professional (GHS 240): GHS 72,000  
- 15% Premium (GHS 500): GHS 75,000
- 5% Enterprise (GHS 800): GHS 40,000
Total: GHS 247,000/month vs GHS 175,000 (old pricing)
Increase: +41% revenue
```

### **Market Positioning**

#### **Competitive Advantage**
- **Custom Domains**: Professional branding for clients
- **Email Integration**: Complete business email solution
- **White-Label**: Full brand customization
- **Compliance**: 100% MFI compliant software-only platform

#### **Value Proposition**
- **Starter/Professional**: Cost-effective with email redirect
- **Premium**: Professional presence with custom domain
- **Enterprise**: Complete business solution with multiple domains

---

## 🎯 **Go-to-Market Strategy**

### **Pricing Communication**

#### **Feature Comparison Table**
| Feature | Starter | Professional | Premium | Enterprise |
|---------|---------|--------------|---------|------------|
| Users | 5 | 25 | 100 | Unlimited |
| Custom Domain | ❌ | ❌ | ✅ | ✅ (5 domains) |
| Professional Email | ❌ | ❌ | ✅ (10 accounts) | ✅ (Unlimited) |
| Email Redirect | ✅ | ✅ | ✅ | ✅ |
| White-Label | ❌ | ❌ | ✅ | ✅ |
| Support | Email | Priority | Priority | Dedicated |
| Price/Month | GHS 120 | GHS 240 | GHS 500 | GHS 800 |

### **Sales Strategy**

#### **Upselling Path**
1. **Start with Starter**: Low barrier to entry
2. **Upgrade to Professional**: As team grows
3. **Move to Premium**: When branding becomes important
4. **Scale to Enterprise**: For large operations

#### **Target Segments**
- **Starter**: Fintech MVPs, solo entrepreneurs
- **Professional**: Growing fintech startups (5-25 employees)
- **Premium**: Established financial services (professional image needed)
- **Enterprise**: Banks, large MFIs, financial institutions

---

## 📈 **Implementation Timeline**

### **Phase 1: Database & Backend (2 days)**
- [ ] Apply email routing migration
- [ ] Update subscription service with new plans
- [ ] Implement email routing service
- [ ] Test custom domain functionality

### **Phase 2: Frontend & UI (2 days)**
- [ ] Update pricing page with new plans
- [ ] Add custom domain setup interface
- [ ] Create email configuration dashboard
- [ ] Test upgrade/downgrade flows

### **Phase 3: Integration & Testing (1 day)**
- [ ] Integrate with Cloudflare Email Routing API
- [ ] Test email redirect functionality
- [ ] Verify custom domain SSL setup
- [ ] End-to-end testing

---

## 🎉 **Expected Outcomes**

### **Revenue Growth**
- **+41% Average Revenue**: From GHS 280 to GHS 390 per tenant
- **Premium Adoption**: 20% of tenants expected to upgrade
- **Enterprise Growth**: 10% targeting large institutions
- **Annual Revenue**: GHS 4.7M potential (1,000 tenants)

### **Market Differentiation**
- **Professional Image**: Custom domains set clients apart
- **Complete Solution**: Email + domain + platform in one package
- **Compliance**: Maintained 100% MFI compliance
- **Scalability**: Ready for enterprise-level clients

---

**🔥 STRATEGIC IMPACT: The new pricing structure positions MicroFi as a premium, professional solution while maintaining accessibility for startups, potentially increasing revenue by 41% per tenant.**
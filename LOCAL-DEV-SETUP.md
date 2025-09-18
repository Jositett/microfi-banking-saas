# 🔧 MicroFi Local Development Setup

## 🚀 Quick Start (5 Minutes)

### **Prerequisites**
- Node.js 18+
- Wrangler CLI: `npm install -g wrangler@latest`
- Git

### **Automated Setup**
```bash
# 1. Run automated setup script
node scripts/setup-local-dev.js

# 2. Test database and KV setup
cd backend && node test-database-setup.js

# 3. Test API endpoints
node ../scripts/test-local-setup.js
```

### **Manual Verification**
```bash
# Start backend (Terminal 1)
cd backend
wrangler dev --port 8787

# Start frontend (Terminal 2)
npm run dev

# Visit: http://localhost:3000
```

---

## 📊 **Database Tables Verification**

### **Core Tables**
- ✅ `users` - User accounts with tenant_id
- ✅ `accounts` - Bank accounts with balances
- ✅ `transactions` - Transaction history
- ✅ `savings_plans` - Savings goals and plans
- ✅ `loans` - Loan applications and tracking

### **Multi-Tenant Tables**
- ✅ `tenants` - Tenant organizations
- ✅ `tenant_settings` - Tenant configurations
- ✅ `admin_users` - Admin panel users

### **Subscription Tables**
- ✅ `subscriptions` - Tenant subscription plans
- ✅ `subscription_usage` - Usage tracking
- ✅ `communication_usage` - SMS/Email costs

### **Gateway Tables**
- ✅ `gateway_configurations` - Payment gateway settings
- ✅ `gateway_transactions` - Payment processing logs

### **Email Routing Tables**
- ✅ `email_routes` - Custom domain email routing
- ✅ `email_redirects` - Email forwarding rules
- ✅ `custom_domains` - Premium domain management

---

## 🗄️ **KV Namespaces Verification**

### **Required KV Namespaces**
- ✅ `WEBAUTHN_CREDENTIALS` - WebAuthn credential storage
- ✅ `USER_SESSIONS` - JWT session management
- ✅ `AUDIT_LOGS` - Security event logging

### **KV Testing Commands**
```bash
# List local KV namespaces
wrangler kv:namespace list --local

# Test KV operations
wrangler kv:key put test-key "test-value" --namespace-id=<ID> --local
wrangler kv:key get test-key --namespace-id=<ID> --local
```

---

## 🧪 **API Endpoint Testing**

### **Health Checks**
- ✅ `GET /health` - Basic health status
- ✅ `GET /health/detailed` - Comprehensive health info

### **Authentication**
- ✅ `POST /auth/login` - User login
- ✅ `POST /auth/logout` - User logout
- ✅ `POST /webauthn/register` - WebAuthn registration
- ✅ `POST /webauthn/authenticate` - WebAuthn login

### **Protected Endpoints**
- ✅ `GET /api/accounts` - User accounts
- ✅ `GET /api/transactions` - Transaction history
- ✅ `GET /api/savings` - Savings plans
- ✅ `GET /api/loans` - Loan applications

### **Admin Endpoints**
- ✅ `GET /admin/api/tenants` - Tenant management
- ✅ `GET /admin/api/analytics` - Platform analytics
- ✅ `GET /admin/api/subscriptions` - Subscription management

### **Multi-Tenant Routing**
- ✅ Host header validation
- ✅ Tenant context resolution
- ✅ Data isolation enforcement

---

## 🔐 **Demo Accounts**

### **User Accounts**
```
Email: john.doe@microfi.com
Password: demo123
Role: user
Tenant: demo-tenant
```

```
Email: sarah.admin@microfi.com  
Password: admin123
Role: admin
Tenant: demo-tenant
```

```
Email: mike.business@microfi.com
Password: business123
Role: user
Tenant: demo-tenant
```

### **Admin Accounts**
```
Email: admin@microfi.com
Password: admin123
Role: super_admin
Access: admin.microfi.com
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Database Connection Failed**
```bash
# Recreate local database
wrangler d1 create microfi-banking --local
wrangler d1 execute microfi-banking --local --file=migrations/001_initial_schema.sql
```

#### **KV Namespace Not Found**
```bash
# Recreate KV namespaces
wrangler kv:namespace create WEBAUTHN_CREDENTIALS --local
wrangler kv:namespace create USER_SESSIONS --local
wrangler kv:namespace create AUDIT_LOGS --local
```

#### **Port Already in Use**
```bash
# Kill existing processes
npx kill-port 8787
npx kill-port 3000

# Or use different ports
wrangler dev --port 8788
npm run dev -- --port 3001
```

#### **Migration Errors**
```bash
# Reset database and reapply migrations
rm -rf .wrangler/state/d1
node scripts/setup-local-dev.js
```

### **Environment Variables**
```bash
# Backend .dev.vars (already configured)
JWT_SECRET=dev-secret-key
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
PAYSTACK_SECRET_KEY=sk_test_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxx
HUBTEL_CLIENT_ID=xxx
HUBTEL_CLIENT_SECRET=xxx
RESEND_API_KEY=re_xxx
ENVIRONMENT=development
```

---

## 📋 **Development Workflow**

### **Daily Development**
```bash
# 1. Start backend
cd backend && wrangler dev --port 8787

# 2. Start frontend  
npm run dev

# 3. Run tests
npm test

# 4. Check API health
curl http://127.0.0.1:8787/health/detailed
```

### **Database Changes**
```bash
# 1. Create migration file
touch backend/migrations/009_new_feature.sql

# 2. Apply migration
wrangler d1 execute microfi-banking --local --file=migrations/009_new_feature.sql

# 3. Test changes
node backend/test-database-setup.js
```

### **Testing Multi-Tenancy**
```bash
# Test different tenant contexts
curl -H "X-Tenant-Host: demo.microfi.com" http://127.0.0.1:8787/api/accounts
curl -H "X-Tenant-Host: client1.microfi.com" http://127.0.0.1:8787/api/accounts
```

---

## ✅ **Setup Verification Checklist**

### **Backend Setup**
- [ ] Wrangler CLI installed and authenticated
- [ ] D1 database created with all migrations applied
- [ ] KV namespaces created and accessible
- [ ] Demo data seeded successfully
- [ ] Backend starts on port 8787
- [ ] Health endpoints responding

### **Frontend Setup**
- [ ] Dependencies installed
- [ ] Next.js app starts on port 3000
- [ ] Can connect to backend API
- [ ] Login with demo accounts works
- [ ] Dashboard loads with data

### **Multi-Tenant Testing**
- [ ] Host header routing works
- [ ] Tenant context resolution
- [ ] Data isolation verified
- [ ] Admin panel accessible
- [ ] Cross-tenant access blocked

### **API Testing**
- [ ] All health checks pass
- [ ] Authentication endpoints work
- [ ] Protected routes require auth
- [ ] Admin endpoints accessible
- [ ] Error handling works

---

## 🚀 **Ready for Development**

Once all checkboxes are ✅, your local development environment is ready!

**Next Steps:**
1. Explore the codebase structure
2. Make changes and test locally
3. Run comprehensive tests
4. Deploy to production when ready

**Support:** Check existing documentation or create issues for any setup problems.
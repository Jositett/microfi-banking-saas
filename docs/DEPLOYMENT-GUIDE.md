# MicroFi Banking SaaS - Production Deployment Guide

## 🚀 **Pre-Deployment Checklist**

### **Security Requirements** ✅
- [x] WebAuthn MFA implemented and tested
- [x] Banking-grade security headers configured
- [x] Audit logging system operational
- [x] Rate limiting and DDoS protection active
- [x] All credentials properly secured
- [x] NIST SP 800-63B Level 3 compliance verified

### **Infrastructure Setup** 
- [ ] Cloudflare account configured
- [ ] D1 database created
- [ ] KV namespaces provisioned
- [ ] Environment variables set
- [ ] Domain and SSL configured

## 📋 **Deployment Steps**

### **1. Backend Deployment (Cloudflare Workers)**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create production D1 database
wrangler d1 create microfi-banking-prod

# Create KV namespaces for production
wrangler kv namespace create WEBAUTHN_CREDENTIALS --env production
wrangler kv namespace create USER_SESSIONS --env production  
wrangler kv namespace create AUDIT_LOGS --env production

# Update wrangler.toml with production IDs
# Copy from wrangler.example.toml and update with actual IDs

# Set production secrets
wrangler secret put JWT_SECRET --env production
wrangler secret put WEBAUTHN_RP_ID --env production
wrangler secret put WEBAUTHN_ORIGIN --env production
wrangler secret put PAYSTACK_SECRET_KEY --env production
wrangler secret put FLUTTERWAVE_SECRET_KEY --env production

# Run database migrations
wrangler d1 migrations apply microfi-banking --env production

# Deploy to production
npm run deploy:production
```

### **2. Frontend Deployment (Vercel/Netlify)**

```bash
# Build for production
npm run build

# Set environment variables in deployment platform:
NEXT_PUBLIC_API_URL=https://your-worker.your-subdomain.workers.dev
NEXT_PUBLIC_ENVIRONMENT=production

# Deploy
vercel --prod
# OR
netlify deploy --prod
```

### **3. Domain Configuration**

```bash
# Add custom domain to Cloudflare Workers
wrangler custom-domains add api.microfi.com

# Update frontend environment
NEXT_PUBLIC_API_URL=https://api.microfi.com
```

## 🔒 **Security Configuration**

### **Production Environment Variables**
```bash
# Backend (Cloudflare Secrets)
JWT_SECRET=<strong-random-secret-256-bit>
WEBAUTHN_RP_ID=microfi.com
WEBAUTHN_ORIGIN=https://microfi.com
PAYSTACK_SECRET_KEY=sk_live_<your-live-key>
FLUTTERWAVE_SECRET_KEY=FLWSECK-<your-live-key>

# Frontend (Deployment Platform)
NEXT_PUBLIC_API_URL=https://api.microfi.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### **SSL/TLS Configuration**
- Enable HTTPS-only mode
- Configure HSTS headers
- Set up certificate pinning
- Enable OCSP stapling

## 📊 **Monitoring & Observability**

### **Cloudflare Analytics**
- Enable Workers Analytics
- Set up Real User Monitoring (RUM)
- Configure security event alerts
- Monitor KV usage and performance

### **Application Monitoring**
```javascript
// Add to main.ts
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  
  // Log performance metrics
  console.log(`${c.req.method} ${c.req.path} - ${duration}ms`)
})
```

### **Health Check Endpoint**
```javascript
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env.ENVIRONMENT
  })
})
```

## 🏦 **Banking Compliance**

### **Regulatory Requirements**
- [ ] Data encryption at rest and in transit
- [ ] Audit trail retention (7 years for critical events)
- [ ] Multi-factor authentication mandatory
- [ ] Transaction monitoring and reporting
- [ ] Incident response procedures documented

### **Compliance Validation**
```bash
# Run compliance tests
npm run test:compliance

# Verify security headers
curl -I https://api.microfi.com

# Test WebAuthn functionality
npm run test:webauthn
```

## 🚨 **Incident Response**

### **Monitoring Alerts**
- Failed authentication attempts > 10/minute
- High-value transactions > 10,000 GHS
- Database connection failures
- KV namespace errors
- Security policy violations

### **Emergency Procedures**
1. **Security Incident**: Rotate all credentials immediately
2. **Service Outage**: Activate backup systems
3. **Data Breach**: Follow regulatory notification requirements
4. **DDoS Attack**: Enable Cloudflare DDoS protection

## 📈 **Performance Optimization**

### **Caching Strategy**
- Static assets: 1 year cache
- API responses: 5 minutes cache
- User sessions: Edge caching
- WebAuthn challenges: No cache

### **Database Optimization**
- Connection pooling enabled
- Query optimization with indexes
- Regular backup schedule
- Performance monitoring

## 🔄 **Backup & Recovery**

### **Database Backups**
```bash
# Daily automated backups
wrangler d1 backup create microfi-banking --env production

# Manual backup before deployments
wrangler d1 export microfi-banking --output backup-$(date +%Y%m%d).sql
```

### **KV Namespace Backups**
```bash
# Export critical KV data
wrangler kv bulk get --namespace-id <AUDIT_LOGS_ID> --output audit-backup.json
```

## ✅ **Post-Deployment Verification**

### **Functional Tests**
- [ ] User registration and login
- [ ] WebAuthn MFA setup and authentication
- [ ] Account creation and management
- [ ] Money transfers with MFA verification
- [ ] Transaction history and audit logs
- [ ] Admin panel functionality

### **Security Tests**
- [ ] SSL/TLS configuration
- [ ] Security headers validation
- [ ] Rate limiting functionality
- [ ] CORS policy enforcement
- [ ] Input validation and sanitization

### **Performance Tests**
- [ ] API response times < 200ms
- [ ] WebAuthn verification < 100ms
- [ ] Database query performance
- [ ] Concurrent user handling

## 📞 **Support & Maintenance**

### **Monitoring Dashboard**
- Cloudflare Workers Analytics
- D1 Database metrics
- KV namespace usage
- Security event logs

### **Regular Maintenance**
- Weekly security updates
- Monthly performance reviews
- Quarterly compliance audits
- Annual penetration testing

---

**Production URL**: https://microfi.com
**API Endpoint**: https://api.microfi.com
**Status Page**: https://status.microfi.com

**Emergency Contact**: security@microfi.com
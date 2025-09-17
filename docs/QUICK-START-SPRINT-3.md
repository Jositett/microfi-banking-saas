# Quick Start Guide - Sprint 3 Implementation

## 🚀 **Immediate Actions (Start Today)**

### **Step 1: Environment Setup (30 minutes)**
```bash
# Ensure backend is running
cd backend
npx wrangler dev --port 8787

# Verify current status
curl http://127.0.0.1:8787/health
curl -X POST http://127.0.0.1:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@microfi.com","password":"demo123"}'
```

### **Step 2: WebAuthn Debug Setup (1 hour)**
```bash
# Check current WebAuthn credential storage
wrangler kv:key list --binding=WEBAUTHN_CREDENTIALS --local

# Test WebAuthn registration endpoint
curl -X POST http://127.0.0.1:8787/webauthn/register/begin \
  -H "Authorization: Bearer demo_token_demo-user-1_xxx" \
  -H "Content-Type: application/json"
```

### **Step 3: Payment Gateway Preparation (30 minutes)**
```bash
# Add payment gateway secrets (use test keys)
wrangler secret put PAYSTACK_SECRET_KEY
# Enter: sk_test_your_paystack_test_key

wrangler secret put FLUTTERWAVE_SECRET_KEY  
# Enter: FLWSECK_TEST-your_flutterwave_test_key
```

## 🔧 **Priority 1: Fix WebAuthn Credential Storage**

### **Issue Analysis**
Current problem: Credentials stored but not retrieved correctly during authentication.

### **Immediate Fix (2 hours)**
**File**: `backend/src/services/webauthn.ts`

```typescript
// Fix credential storage (lines 70-85)
const credentialData = {
  credentialID: verification.registrationInfo.credential.id,
  credentialPublicKey: base64urlEncode(verification.registrationInfo.credential.publicKey),
  counter: verification.registrationInfo.credential.counter || 0,
  deviceType: verification.registrationInfo.credentialDeviceType,
  backedUp: verification.registrationInfo.credentialBackedUp,
  createdAt: new Date().toISOString(),
  credentialIDBase64: response.id // Store the response ID for lookup
};

// Use consistent key format
const credentialKey = `${userId}_${response.id}`;
await this.env.WEBAUTHN_CREDENTIALS.put(credentialKey, JSON.stringify(credentialData));
```

### **Test Fix**
```bash
# Test credential storage
curl -X POST http://127.0.0.1:8787/webauthn/register/complete \
  -H "Authorization: Bearer demo_token_demo-user-1_xxx" \
  -H "Content-Type: application/json" \
  -d '{"response": {...webauthn_response...}}'

# Verify storage
wrangler kv:key list --binding=WEBAUTHN_CREDENTIALS --local
```

## 💳 **Priority 2: Implement Basic Payment Flow**

### **Paystack Integration (4 hours)**
**File**: `backend/src/services/paystack.ts` (create new)

```typescript
export class PaystackService {
  constructor(private env: Env) {}
  
  async initializePayment(amount: number, email: string, userId: string) {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to kobo
        email,
        metadata: { userId },
        callback_url: `http://localhost:3000/payment/callback`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status}`);
    }
    
    return response.json();
  }
}
```

### **Payment Route (1 hour)**
**File**: `backend/src/routes/payments.ts` (add to existing)

```typescript
import { PaystackService } from '../services/paystack';

// Add to existing router
paymentsRouter.post('/paystack/initialize', async (c) => {
  const user = c.get('user');
  const { amount, email } = await c.req.json();
  
  const paystackService = new PaystackService(c.env);
  const result = await paystackService.initializePayment(amount, email, user.id);
  
  return c.json(result);
});
```

### **Test Payment Integration**
```bash
# Test payment initialization
curl -X POST http://127.0.0.1:8787/api/payments/paystack/initialize \
  -H "Authorization: Bearer demo_token_demo-user-1_xxx" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "email": "john.doe@microfi.com"}'
```

## 🛡️ **Priority 3: Enable Production Security**

### **JWT Implementation (3 hours)**
**File**: `backend/src/lib/crypto.ts` (add to existing)

```typescript
export async function generateJWT(payload: any, secret: string, expiresIn: string = '24h'): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (expiresIn === '24h' ? 86400 : 3600)
  };
  
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(jwtPayload));
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = base64urlEncode(new Uint8Array(signature));
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function base64urlEncode(data: string | Uint8Array): string {
  const base64 = typeof data === 'string' 
    ? btoa(data) 
    : btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
```

### **Update Auth Route (1 hour)**
**File**: `backend/src/routes/auth.ts` (modify existing)

```typescript
// Replace demo token generation with JWT
const token = await generateJWT({
  userId: user.id,
  email: user.email,
  role: user.role
}, c.env.JWT_SECRET, '24h');
```

## 📊 **Daily Progress Tracking**

### **Day 1 Checklist**
- [ ] WebAuthn credential storage fixed
- [ ] Credential retrieval working
- [ ] Basic error logging added
- [ ] Test with browser WebAuthn API

### **Day 2 Checklist**
- [ ] Paystack service implemented
- [ ] Payment initialization working
- [ ] Test payment flow with sandbox
- [ ] Error handling added

### **Day 3 Checklist**
- [ ] JWT implementation complete
- [ ] Auth middleware updated
- [ ] Demo tokens replaced
- [ ] Authentication flow tested

## 🚨 **Critical Success Factors**

### **Must Have (Week 1)**
1. WebAuthn registration and authentication working
2. Basic payment processing functional
3. JWT authentication implemented
4. Security middleware enabled

### **Should Have (Week 2)**
1. Cross-browser WebAuthn compatibility
2. Multiple payment gateways
3. Comprehensive audit logging
4. Performance optimization

### **Could Have (Week 3)**
1. Advanced security features
2. Payment reconciliation
3. Monitoring and alerting
4. Documentation completion

## 🔄 **Daily Standup Format**

### **What did you complete yesterday?**
- Specific tasks from checklist
- Issues encountered and resolved
- Testing results

### **What will you work on today?**
- Next priority tasks
- Dependencies needed
- Expected completion time

### **Any blockers or concerns?**
- Technical challenges
- Resource needs
- Risk mitigation required

## 📞 **Support & Escalation**

### **Technical Issues**
- WebAuthn browser compatibility problems
- Payment gateway API issues
- Security configuration challenges

### **Business Issues**
- Regulatory compliance questions
- User experience concerns
- Performance requirements

### **Escalation Path**
1. Team lead consultation
2. Architecture review
3. External expert consultation
4. Vendor support engagement

---

**Start Time**: Immediate  
**First Milestone**: Day 3 (WebAuthn + Payments working)  
**Sprint Goal**: Production-ready banking platform  
**Success Metric**: End-to-end user flow completion
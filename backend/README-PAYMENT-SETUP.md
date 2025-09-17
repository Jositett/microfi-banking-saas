# 🔑 Payment Gateway Setup Guide

## Current Status: API Keys Required

The payment gateway integration is **ready** but requires **valid API keys** to function.

## 🚨 Critical Steps

### 1. Get Real API Keys

#### Paystack (Recommended for Nigeria)
1. Sign up at [Paystack](https://dashboard.paystack.com)
2. Complete business verification
3. Get test keys from **Settings > API Keys**
4. Test key format: `sk_test_...` (64+ characters)

#### Flutterwave (Multi-country support)
1. Sign up at [Flutterwave](https://dashboard.flutterwave.com)  
2. Complete business verification
3. Get test keys from **Settings > API Keys**
4. Test key format: `FLWSECK_TEST-...` (50+ characters)

### 2. Update Configuration

Replace placeholder keys in `backend/.dev.vars`:

```ini
# Replace with your actual keys
PAYSTACK_SECRET_KEY=sk_test_YOUR_REAL_KEY_HERE
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-YOUR_REAL_KEY_HERE
```

### 3. Restart Backend Server

```bash
cd backend
# Stop current server (Ctrl+C)
npx wrangler dev --port 8787
```

## ✅ Verification

Test payment integration:
1. Login to dashboard
2. Go to **Payments** section  
3. Try **Add Funds** with test amounts
4. Should redirect to payment gateway

## 🔒 Security Notes

- **Never commit real API keys** to version control
- Use test keys for development only
- Production keys go in Cloudflare Workers secrets:
  ```bash
  wrangler secret put PAYSTACK_SECRET_KEY
  wrangler secret put FLUTTERWAVE_SECRET_KEY
  ```

## 🛠️ Current Implementation

✅ **Payment Services**: Paystack + Flutterwave integration  
✅ **API Routes**: Initialize and verify payments  
✅ **Database Integration**: Automatic account crediting  
✅ **Error Handling**: Comprehensive validation  
✅ **Security**: API key validation and rate limiting  

**Missing**: Valid API keys from payment providers

## 📞 Support

- **Paystack**: [Support Center](https://support.paystack.com)
- **Flutterwave**: [Help Center](https://support.flutterwave.com)
- **MicroFi**: Check setup-payment-keys.md for detailed instructions
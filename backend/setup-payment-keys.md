# Payment Gateway Setup Instructions

## 🔑 Get Your API Keys

### Paystack Setup
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings > API Keys**
3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Update `.dev.vars` file:
   ```
   PAYSTACK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
   ```

### Flutterwave Setup
1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Navigate to **Settings > API Keys**
3. Copy your **Test Secret Key** (starts with `FLWSECK_TEST-`)
4. Update `.dev.vars` file:
   ```
   FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-YOUR_ACTUAL_KEY_HERE
   ```

## ⚠️ Important Notes

- **Current keys are placeholders** - Replace with your actual test keys
- Never use live keys in development
- Test keys are safe for development and testing
- Keys must match the exact format shown above

## 🧪 Testing

After updating keys, restart the backend server:
```bash
# Stop current server (Ctrl+C)
npx wrangler dev --port 8787
```

Then test payment integration in the frontend dashboard.

## 🔒 Production Deployment

For production, use `wrangler secret put`:
```bash
wrangler secret put PAYSTACK_SECRET_KEY
wrangler secret put FLUTTERWAVE_SECRET_KEY
```
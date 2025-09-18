# 🏦 MicroFi Banking SaaS - API Documentation

## 📋 **Overview**

**Base URL**: `http://127.0.0.1:8787` (Development) | `https://api.microfi.com` (Production)  
**Authentication**: JWT Bearer Token + WebAuthn MFA  
**Content-Type**: `application/json`  
**Rate Limits**: 5 auth/15min, 100 API/min, 10 payments/min  

---

## 🔐 **Authentication Endpoints**

### **POST /auth/login**
Authenticate user with email and password.

**Request:**
```json
{
  "email": "john.doe@microfi.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john.doe@microfi.com",
    "role": "user",
    "kycStatus": "verified"
  },
  "expiresIn": 3600
}
```

### **POST /auth/register**
Register new user account.

**Request:**
```json
{
  "email": "new.user@microfi.com",
  "password": "securePassword123",
  "firstName": "New",
  "lastName": "User"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "user_456",
    "email": "new.user@microfi.com",
    "role": "user",
    "kycStatus": "pending"
  }
}
```

### **POST /auth/logout**
Invalidate user session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 🛡️ **WebAuthn Endpoints**

### **POST /webauthn/register/begin**
Start WebAuthn credential registration.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "challenge": "base64-encoded-challenge",
  "rp": {
    "name": "MicroFi Banking",
    "id": "microfi.com"
  },
  "user": {
    "id": "user_123",
    "name": "john.doe@microfi.com",
    "displayName": "John Doe"
  },
  "pubKeyCredParams": [...],
  "timeout": 60000
}
```

### **POST /webauthn/register/complete**
Complete WebAuthn credential registration.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "id": "credential-id",
  "rawId": "base64-raw-id",
  "response": {
    "attestationObject": "base64-attestation",
    "clientDataJSON": "base64-client-data"
  },
  "type": "public-key"
}
```

### **POST /webauthn/authenticate/begin**
Start WebAuthn authentication.

**Request:**
```json
{
  "email": "john.doe@microfi.com"
}
```

**Response:**
```json
{
  "challenge": "base64-encoded-challenge",
  "allowCredentials": [
    {
      "id": "credential-id",
      "type": "public-key"
    }
  ],
  "timeout": 60000
}
```

### **POST /webauthn/authenticate/complete**
Complete WebAuthn authentication.

**Request:**
```json
{
  "id": "credential-id",
  "rawId": "base64-raw-id",
  "response": {
    "authenticatorData": "base64-auth-data",
    "clientDataJSON": "base64-client-data",
    "signature": "base64-signature"
  },
  "type": "public-key"
}
```

---

## 🏦 **Account Management**

### **GET /api/accounts**
Get user's bank accounts.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "accounts": [
    {
      "id": "acc_123",
      "accountNumber": "1234567890",
      "type": "savings",
      "balance": 150000,
      "currency": "GHS",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **POST /api/accounts**
Create new bank account.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "type": "current",
  "currency": "GHS",
  "initialDeposit": 10000
}
```

**Response:**
```json
{
  "account": {
    "id": "acc_456",
    "accountNumber": "9876543210",
    "type": "current",
    "balance": 10000,
    "currency": "GHS",
    "status": "active"
  }
}
```

---

## 💳 **Payment & Transfer Endpoints**

### **POST /api/payments/transfer**
Transfer money between accounts.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "fromAccountId": "acc_123",
  "toAccountId": "acc_456",
  "amount": 5000,
  "description": "Monthly savings transfer"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "txn_789",
    "reference": "TXN1704067200",
    "amount": 5000,
    "currency": "GHS",
    "status": "completed",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### **GET /api/payments/transactions**
Get transaction history.

**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:** `limit=50&offset=0`

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_789",
      "amount": 5000,
      "currency": "GHS",
      "type": "transfer",
      "description": "Monthly savings transfer",
      "status": "completed",
      "timestamp": "2024-01-01T12:00:00Z",
      "from_account_number": "1234567890",
      "to_account_number": "9876543210"
    }
  ]
}
```

### **GET /api/payments/fees/estimate**
Get fee estimate for transaction.

**Query Parameters:**
- `type`: Transaction type (internal_transfer, paystack_payment, etc.)
- `amount`: Transaction amount
- `currency`: Currency code (GHS, NGN, USD)

**Response:**
```json
{
  "transactionType": "paystack_payment",
  "amount": 100,
  "currency": "NGN",
  "fee": 1.5,
  "netAmount": 98.5,
  "feePercentage": 1.5,
  "description": "Payment processing fee (1.5%)"
}
```

---

## 🌍 **Payment Gateway Integration**

### **POST /api/payments/paystack/initialize**
Initialize Paystack payment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "amount": 10000,
  "email": "john.doe@microfi.com",
  "reference": "custom_ref_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "access_code_123",
    "reference": "paystack_ref_456"
  }
}
```

### **POST /api/payments/paystack/verify**
Verify Paystack payment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "reference": "paystack_ref_456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and account credited",
  "amount": 100
}
```

### **POST /api/payments/flutterwave/initialize**
Initialize Flutterwave payment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "amount": 10000,
  "email": "john.doe@microfi.com",
  "reference": "custom_ref_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "link": "https://checkout.flutterwave.com/...",
    "tx_ref": "flutterwave_ref_789"
  }
}
```

### **POST /api/payments/flutterwave/verify**
Verify Flutterwave payment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "txRef": "flutterwave_ref_789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and account credited",
  "amount": 100
}
```

---

## 📧 **Notification Endpoints**

### **POST /api/notifications/email**
Send email notification.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "to": "user@microfi.com",
  "template": "transaction_alert",
  "data": {
    "amount": 5000,
    "currency": "GHS",
    "transactionType": "transfer",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "email_123",
  "message": "Email sent successfully"
}
```

### **POST /api/notifications/sms**
Send SMS notification.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "to": "+233123456789",
  "template": "otp",
  "data": {
    "otp": "123456",
    "expiryMinutes": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "sms_456",
  "message": "SMS sent successfully"
}
```

---

## 🏥 **Health & Monitoring**

### **GET /health**
Basic health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "service": "MicroFi Banking API"
}
```

### **GET /health/detailed**
Comprehensive health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 1234567,
  "checks": {
    "database": {
      "healthy": true,
      "responseTime": 45,
      "details": { "connected": true }
    },
    "paystack": {
      "healthy": true,
      "responseTime": 120,
      "details": { "status": 200 }
    },
    "flutterwave": {
      "healthy": true,
      "responseTime": 150,
      "details": { "status": 200 }
    },
    "hubtel": {
      "healthy": true,
      "responseTime": 200,
      "details": { "status": 200 }
    },
    "resend": {
      "healthy": true,
      "responseTime": 80,
      "details": { "status": 200 }
    },
    "kv": {
      "healthy": true,
      "responseTime": 25,
      "details": { "kvOperational": true }
    }
  },
  "performance": {
    "avgResponseTime": 120,
    "requestCount": 0,
    "errorRate": 0
  }
}
```

---

## 👨‍💼 **Admin Endpoints**

### **GET /api/admin/users**
Get all users (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "john.doe@microfi.com",
      "role": "user",
      "kycStatus": "verified",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### **GET /api/payments/revenue/analytics**
Get revenue analytics (admin only).

**Headers:** `Authorization: Bearer <admin-token>`  
**Query Parameters:** `startDate=2024-01-01&endDate=2024-01-31`

**Response:**
```json
{
  "totalRevenue": 15000,
  "transactionCount": 1000,
  "averageFee": 15,
  "revenueByType": {
    "Payment processing fee (1.5%)": 12000,
    "Withdrawal processing fee (tiered)": 3000
  },
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

---

## 🚨 **Error Responses**

### **Standard Error Format**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### **HTTP Status Codes**
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Too Many Requests
- **500**: Internal Server Error
- **503**: Service Unavailable

### **Common Error Codes**
- `INVALID_CREDENTIALS`: Authentication failed
- `INSUFFICIENT_FUNDS`: Account balance too low
- `ACCOUNT_NOT_FOUND`: Account doesn't exist
- `PAYMENT_FAILED`: Payment processing error
- `MFA_REQUIRED`: Multi-factor authentication needed
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## 🔒 **Security Headers**

All API responses include banking-grade security headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 📊 **Rate Limiting**

### **Authentication Endpoints**
- **Limit**: 5 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### **API Endpoints**
- **Limit**: 100 requests per minute per user
- **Applies to**: All `/api/*` endpoints

### **Payment Endpoints**
- **Limit**: 10 requests per minute per user
- **Applies to**: All `/api/payments/*` endpoints

---

## 🧪 **Testing**

### **Demo Accounts**
```json
{
  "user": {
    "email": "john.doe@microfi.com",
    "password": "demo123"
  },
  "admin": {
    "email": "sarah.admin@microfi.com",
    "password": "admin123"
  },
  "business": {
    "email": "mike.business@microfi.com",
    "password": "business123"
  }
}
```

### **Test Payment Cards**
```json
{
  "paystack": {
    "card": "4084084084084081",
    "cvv": "408",
    "expiry": "12/25"
  },
  "flutterwave": {
    "card": "5531886652142950",
    "cvv": "564",
    "expiry": "09/25"
  }
}
```

---

## 📚 **SDK Examples**

### **JavaScript/Node.js**
```javascript
const MicroFiAPI = {
  baseURL: 'http://127.0.0.1:8787',
  token: null,

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    this.token = data.token;
    return data;
  },

  async getAccounts() {
    const response = await fetch(`${this.baseURL}/api/accounts`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return await response.json();
  },

  async transfer(fromAccountId, toAccountId, amount, description) {
    const response = await fetch(`${this.baseURL}/api/payments/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ fromAccountId, toAccountId, amount, description })
    });
    return await response.json();
  }
};
```

### **Python**
```python
import requests

class MicroFiAPI:
    def __init__(self, base_url='http://127.0.0.1:8787'):
        self.base_url = base_url
        self.token = None

    def login(self, email, password):
        response = requests.post(f'{self.base_url}/auth/login', 
                               json={'email': email, 'password': password})
        data = response.json()
        self.token = data.get('token')
        return data

    def get_accounts(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.base_url}/api/accounts', headers=headers)
        return response.json()

    def transfer(self, from_account_id, to_account_id, amount, description=None):
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        data = {
            'fromAccountId': from_account_id,
            'toAccountId': to_account_id,
            'amount': amount,
            'description': description
        }
        response = requests.post(f'{self.base_url}/api/payments/transfer', 
                               json=data, headers=headers)
        return response.json()
```

---

**API Version**: v1.0  
**Last Updated**: January 2024  
**Support**: api-support@microfi.com
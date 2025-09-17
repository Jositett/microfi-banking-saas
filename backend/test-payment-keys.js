// Quick test for payment gateway API keys
const BASE_URL = 'http://127.0.0.1:8787';

async function testPaymentKeys() {
  console.log('🔑 Testing Payment Gateway API Keys\n');
  
  try {
    // Login first
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@microfi.com',
        password: 'demo123'
      })
    });
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    
    if (!token) {
      throw new Error('Login failed');
    }
    
    console.log('✅ Authentication successful\n');
    
    // Test Paystack
    console.log('💳 Testing Paystack...');
    const paystackResponse = await fetch(`${BASE_URL}/api/payments/paystack/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 100,
        email: 'john.doe@microfi.com'
      })
    });
    
    if (paystackResponse.ok) {
      const paystackResult = await paystackResponse.json();
      console.log('✅ Paystack: SUCCESS');
      console.log('   Authorization URL:', paystackResult.data?.authorization_url ? 'Generated' : 'Missing');
    } else {
      const error = await paystackResponse.text();
      console.log('❌ Paystack: FAILED');
      console.log('   Error:', error);
    }
    
    console.log();
    
    // Test Flutterwave
    console.log('🌊 Testing Flutterwave...');
    const flutterwaveResponse = await fetch(`${BASE_URL}/api/payments/flutterwave/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 100,
        email: 'john.doe@microfi.com'
      })
    });
    
    if (flutterwaveResponse.ok) {
      const flutterwaveResult = await flutterwaveResponse.json();
      console.log('✅ Flutterwave: SUCCESS');
      console.log('   Payment Link:', flutterwaveResult.data?.link ? 'Generated' : 'Missing');
    } else {
      const error = await flutterwaveResponse.text();
      console.log('❌ Flutterwave: FAILED');
      console.log('   Error:', error);
    }
    
    console.log('\n🎯 Payment Gateway Test Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Ensure backend server is running with updated environment variables');
  }
}

testPaymentKeys();
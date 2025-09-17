// Test Payment Gateway API Keys
const PAYSTACK_SECRET_KEY = "sk_test_81fd70fdcd770d52a85a30b9992b544f26d53265";
const FLUTTERWAVE_SECRET_KEY = "FLWSECK_TEST-vZPqTJPyBQyoYJozN7T44RzHsmpvlhzT";

async function testPaystack() {
  console.log("🔍 Testing Paystack API...");
  
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "test@microfi.com",
        amount: 100000 // 1000 NGN in kobo
      })
    });

    const result = await response.json();
    
    if (response.ok && result.status) {
      console.log("✅ Paystack: API key valid");
      console.log(`   Reference: ${result.data.reference}`);
    } else {
      console.log("❌ Paystack: API key invalid");
      console.log(`   Error: ${result.message}`);
    }
  } catch (error) {
    console.log("❌ Paystack: Connection error");
    console.log(`   Error: ${error.message}`);
  }
}

async function testFlutterwave() {
  console.log("🔍 Testing Flutterwave API...");
  
  try {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: `test_${Date.now()}`,
        amount: 1000,
        currency: "NGN",
        payment_options: "card",
        customer: {
          email: "test@microfi.com",
          phone_number: "08012345678"
        },
        redirect_url: "https://microfi.com/callback"
      })
    });

    const result = await response.json();
    
    if (response.ok && result.status === 'success') {
      console.log("✅ Flutterwave: API key valid");
      console.log(`   TX Ref: ${result.data.tx_ref}`);
    } else {
      console.log("❌ Flutterwave: API key invalid");
      console.log(`   Error: ${result.message}`);
    }
  } catch (error) {
    console.log("❌ Flutterwave: Connection error");
    console.log(`   Error: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Testing Payment Gateway API Keys\n");
  
  await testPaystack();
  console.log("");
  await testFlutterwave();
  
  console.log("\n✨ Test completed!");
}

main().catch(console.error);
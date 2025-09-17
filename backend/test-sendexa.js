// Test Sendexa API Integration
const SENDEXA_API_KEY = "exa_94cb0f1cc4643ecf";
const SENDEXA_SECRET_KEY = "f25352bf17c3bcd865ea0a62";

// Create Base64 auth string
const auth = Buffer.from(`${SENDEXA_API_KEY}:${SENDEXA_SECRET_KEY}`).toString('base64');

async function testSendexaHealth() {
  console.log("🔍 Testing Sendexa API Health...");
  
  try {
    const response = await fetch('https://api.sendexa.co/v1/health', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Sendexa: API health check passed");
      console.log(`   Status: ${result.status}`);
    } else {
      console.log("❌ Sendexa: Health check failed");
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log("❌ Sendexa: Connection error");
    console.log(`   Error: ${error.message}`);
  }
}

async function testSendexaEmail() {
  console.log("🔍 Testing Sendexa Email...");
  
  try {
    const response = await fetch('https://api.sendexa.co/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: "test@microfi.com",
        subject: "MicroFi Test Email",
        html: "<h1>Test Email from MicroFi Banking</h1><p>This is a test email.</p>",
        security: {
          fraud_check: true,
          rate_limit: "high"
        },
        metadata: {
          user_id: "test-user-1",
          transaction_id: "test-tx-123"
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Sendexa: Email sent successfully");
      console.log(`   Message ID: ${result.message_id || 'N/A'}`);
    } else {
      const error = await response.text();
      console.log("❌ Sendexa: Email failed");
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log("❌ Sendexa: Email connection error");
    console.log(`   Error: ${error.message}`);
  }
}

async function testSendexaSMS() {
  console.log("🔍 Testing Sendexa SMS...");
  
  try {
    const response = await fetch('https://api.sendexa.co/v1/sms', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: "+233555555555",
        message: "MicroFi: Your OTP is 123456. Valid for 5 minutes.",
        sender_id: "MicroFi",
        security: {
          fraud_check: true,
          rate_limit: "high",
          message_type: "transactional"
        },
        metadata: {
          user_id: "test-user-1",
          transaction_id: "test-tx-123"
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Sendexa: SMS sent successfully");
      console.log(`   Message ID: ${result.message_id || 'N/A'}`);
    } else {
      const error = await response.text();
      console.log("❌ Sendexa: SMS failed");
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log("❌ Sendexa: SMS connection error");
    console.log(`   Error: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Testing Sendexa Integration\n");
  console.log(`Auth String: ${auth}\n`);
  
  await testSendexaHealth();
  console.log("");
  await testSendexaEmail();
  console.log("");
  await testSendexaSMS();
  
  console.log("\n✨ Sendexa test completed!");
}

main().catch(console.error);
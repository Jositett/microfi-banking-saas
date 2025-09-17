// Test Hubtel SMS and Resend Email Integration
const HUBTEL_CLIENT_ID = "rzhdgflh";
const HUBTEL_CLIENT_SECRET = "jqqaauhu";
const HUBTEL_SENDER_ID = "Joedroid";
const RESEND_API_KEY = "re_66tKZqWC_J8vLrA6NuhcvQ4umvqSeFdcH";

async function testHubtelSMS() {
  console.log("📱 Testing Hubtel SMS...");
  
  try {
    const testPhone = "233540511227";
    const testMessage = "MicroFi Banking: Your OTP is 123456. Valid for 5 minutes.";
    
    const params = new URLSearchParams({
      clientsecret: HUBTEL_CLIENT_SECRET,
      clientid: HUBTEL_CLIENT_ID,
      from: HUBTEL_SENDER_ID,
      to: testPhone,
      content: testMessage
    });
    
    const apiUrl = `https://smsc.hubtel.com/v1/messages/send?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Hubtel SMS: Message sent successfully");
      console.log(`   Message ID: ${result.MessageId || result.Id || 'N/A'}`);
      console.log(`   Status: ${result.Status || 'sent'}`);
    } else {
      const error = await response.text();
      console.log("❌ Hubtel SMS: Failed to send");
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log("❌ Hubtel SMS: Connection error");
    console.log(`   Error: ${error.message}`);
  }
}

async function testResendEmail() {
  console.log("📧 Testing Resend Email...");
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MicroFi <onboarding@resend.dev>',
        to: 'delivered@resend.dev',
        subject: 'MicroFi Banking Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0066cc;">MicroFi Banking</h1>
            <p>This is a test email from your banking platform.</p>
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `,
        headers: {
          'X-User-ID': 'test-user-1',
          'X-Email-Type': 'test'
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Resend Email: Email sent successfully");
      console.log(`   Message ID: ${result.data?.id || 'N/A'}`);
    } else {
      const error = await response.json();
      console.log("❌ Resend Email: Failed to send");
      console.log(`   Error: ${error.message || JSON.stringify(error)}`);
    }
  } catch (error) {
    console.log("❌ Resend Email: Connection error");
    console.log(`   Error: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Testing Hubtel + Resend Integration\n");
  
  await testHubtelSMS();
  console.log("");
  await testResendEmail();
  
  console.log("\n✨ Integration test completed!");
}

main().catch(console.error);
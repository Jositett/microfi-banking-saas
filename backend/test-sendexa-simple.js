// Simple Sendexa Test - Alternative endpoints
const SENDEXA_API_KEY = "exa_94cb0f1cc4643ecf";
const SENDEXA_SECRET_KEY = "f25352bf17c3bcd865ea0a62";
const auth = Buffer.from(`${SENDEXA_API_KEY}:${SENDEXA_SECRET_KEY}`).toString('base64');

async function testAlternativeEndpoints() {
  console.log("🔍 Testing Alternative Sendexa Endpoints...");
  console.log(`Auth: ${auth}\n`);

  // Test different possible endpoints
  const endpoints = [
    'https://api.sendexa.com/v1/health',
    'https://sendexa.co/api/v1/health', 
    'https://api.sendexa.co/health',
    'https://sendexa.com/api/health'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`  Status: ${response.status}`);
      if (response.ok) {
        const result = await response.text();
        console.log(`  ✅ Success: ${result}`);
        return endpoint; // Return working endpoint
      } else {
        console.log(`  ❌ Failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log("");
  }
  
  return null;
}

async function main() {
  console.log("🚀 Sendexa Endpoint Discovery\n");
  
  const workingEndpoint = await testAlternativeEndpoints();
  
  if (workingEndpoint) {
    console.log(`✅ Working endpoint found: ${workingEndpoint}`);
  } else {
    console.log("❌ No working endpoints found");
    console.log("📝 Note: Sendexa may require account activation or different API format");
  }
}

main().catch(console.error);
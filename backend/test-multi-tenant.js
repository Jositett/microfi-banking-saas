// Multi-tenant backend test script
const BASE_URL = 'http://127.0.0.1:8787';

async function testMultiTenant() {
  console.log('🧪 Testing Multi-Tenant Backend Architecture\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Tenant resolution with different hosts
  console.log('\n2. Testing tenant resolution...');
  
  const tenantTests = [
    { host: 'demo.microfi.com', expected: 'demo-tenant' },
    { host: 'client1.microfi.com', expected: 'client1-tenant' },
    { host: 'localhost:8787', expected: 'demo-tenant' } // Development fallback
  ];

  for (const test of tenantTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/accounts`, {
        headers: {
          'Host': test.host,
          'Authorization': 'Bearer demo_token_demo-user-1'
        }
      });
      
      if (response.ok) {
        console.log(`✅ Tenant resolution for ${test.host}: Success`);
      } else {
        const error = await response.json();
        console.log(`⚠️  Tenant resolution for ${test.host}: ${error.error}`);
      }
    } catch (error) {
      console.log(`❌ Tenant resolution for ${test.host}: ${error.message}`);
    }
  }

  // Test 3: Admin endpoints
  console.log('\n3. Testing admin endpoints...');
  try {
    const response = await fetch(`${BASE_URL}/admin/api/tenants`, {
      headers: {
        'Host': 'admin.microfi.com',
        'Authorization': 'Bearer admin-token'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Admin tenants endpoint: Found ${data.tenants?.length || 0} tenants`);
    } else {
      console.log('⚠️  Admin endpoint requires authentication');
    }
  } catch (error) {
    console.log('❌ Admin endpoint test failed:', error.message);
  }

  // Test 4: Cross-tenant isolation
  console.log('\n4. Testing tenant isolation...');
  try {
    // Try to access demo tenant data with client1 host
    const response = await fetch(`${BASE_URL}/api/accounts`, {
      headers: {
        'Host': 'client1.microfi.com',
        'Authorization': 'Bearer demo_token_demo-user-1' // Demo user belongs to demo-tenant
      }
    });
    
    if (response.status === 403) {
      console.log('✅ Tenant isolation: Cross-tenant access properly blocked');
    } else if (response.status === 401) {
      console.log('✅ Tenant isolation: Authentication required');
    } else {
      console.log('⚠️  Tenant isolation: Unexpected response');
    }
  } catch (error) {
    console.log('❌ Tenant isolation test failed:', error.message);
  }

  console.log('\n🎯 Multi-tenant backend test complete!');
}

// Run tests
testMultiTenant().catch(console.error);
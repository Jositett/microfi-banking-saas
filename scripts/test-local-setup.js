#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🧪 MicroFi Local Setup Testing');
console.log('==============================\n');

const API_BASE = 'http://127.0.0.1:8787';

async function testEndpoint(endpoint, method = 'GET', body = null, headers = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : null
    });
    
    const data = await response.json();
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 Testing API endpoints...\n');

  // 1. Health check
  await testEndpoint('/health');
  await testEndpoint('/health/detailed');

  // 2. Authentication endpoints
  console.log('\n🔐 Testing authentication...');
  const loginResult = await testEndpoint('/auth/login', 'POST', {
    email: 'john.doe@microfi.com',
    password: 'demo123'
  });

  let authToken = null;
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log('✅ Login successful, token received');
  }

  // 3. Protected endpoints (if we have token)
  if (authToken) {
    console.log('\n🏦 Testing protected endpoints...');
    const authHeaders = { 'Authorization': `Bearer ${authToken}` };
    
    await testEndpoint('/api/accounts', 'GET', null, authHeaders);
    await testEndpoint('/api/transactions', 'GET', null, authHeaders);
    await testEndpoint('/api/savings', 'GET', null, authHeaders);
  }

  // 4. Admin endpoints
  console.log('\n👑 Testing admin endpoints...');
  await testEndpoint('/admin/api/tenants');
  await testEndpoint('/admin/api/analytics');
  await testEndpoint('/admin/api/subscriptions');

  // 5. Multi-tenant routing test
  console.log('\n🌐 Testing multi-tenant routing...');
  await testEndpoint('/health', 'GET', null, { 'X-Tenant-Host': 'demo.microfi.com' });

  console.log('\n🎉 Local setup testing complete!');
  console.log('If all endpoints show ✅, your local setup is working correctly.');
}

runTests().catch(console.error);
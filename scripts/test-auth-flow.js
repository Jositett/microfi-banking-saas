#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'http://127.0.0.1:8787';

async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow');
  console.log('=============================\n');

  // Test login with demo credentials
  console.log('1. Testing login with demo credentials...');
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john.doe@microfi.com',
      password: 'demo123'
    })
  });

  const loginData = await loginResponse.json();
  console.log(`Status: ${loginResponse.status}`);
  console.log(`Response:`, loginData);

  if (loginResponse.ok && loginData.token) {
    console.log('✅ Login successful!\n');
    
    // Test protected endpoint with token
    console.log('2. Testing protected endpoint with token...');
    const accountsResponse = await fetch(`${API_BASE}/api/accounts`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'X-Tenant-Host': 'demo.microfi.com'
      }
    });
    
    const accountsData = await accountsResponse.json();
    console.log(`Status: ${accountsResponse.status}`);
    console.log(`Response:`, accountsData);
    
    if (accountsResponse.ok) {
      console.log('✅ Protected endpoint working!\n');
    } else {
      console.log('❌ Protected endpoint failed\n');
    }
  } else {
    console.log('❌ Login failed\n');
  }

  // Test admin login
  console.log('3. Testing admin login...');
  const adminLoginResponse = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@microfi.com',
      password: 'admin123'
    })
  });

  const adminLoginData = await adminLoginResponse.json();
  console.log(`Status: ${adminLoginResponse.status}`);
  console.log(`Response:`, adminLoginData);

  if (adminLoginResponse.ok) {
    console.log('✅ Admin login working!\n');
  } else {
    console.log('❌ Admin login failed\n');
  }

  console.log('🎉 Authentication flow testing complete!');
}

testAuthFlow().catch(console.error);
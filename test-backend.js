// Quick test to verify backend is running with correct CORS
const testBackend = async () => {
  try {
    console.log('Testing backend health...');
    const response = await fetch('http://127.0.0.1:8787/health');
    const data = await response.json();
    console.log('✅ Backend health:', data);

    console.log('\nTesting CORS headers...');
    const corsResponse = await fetch('http://127.0.0.1:8787/api/accounts', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization,X-Tenant-Host'
      }
    });
    
    console.log('CORS Status:', corsResponse.status);
    console.log('CORS Headers:', Object.fromEntries(corsResponse.headers.entries()));
    
    if (corsResponse.headers.get('access-control-allow-headers')?.includes('X-Tenant-Host')) {
      console.log('✅ X-Tenant-Host header is allowed');
    } else {
      console.log('❌ X-Tenant-Host header is NOT allowed');
    }

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('\n🔧 To fix:');
    console.log('1. Make sure backend is running: cd backend && npx wrangler dev --port 8787');
    console.log('2. Check if port 8787 is available');
    console.log('3. Restart backend to apply CORS changes');
  }
};

testBackend();
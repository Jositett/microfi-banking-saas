// Test admin authentication
const testAdminAuth = async () => {
  try {
    console.log('Testing admin authentication...');
    
    // Test admin overview endpoint
    const overviewResponse = await fetch('http://127.0.0.1:8787/api/admin/overview', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vLWFkbWluLTEiLCJlbWFpbCI6InNhcmFoLmFkbWluQG1pY3JvZmkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU4MTg3MjYyLCJleHAiOjE3NTgyNzM2NjJ9.7Z65Od7Tg1NbWpkcBNsV4y7RFXQYOImC4cSL9yoV9n4',
        'X-Tenant-Host': 'localhost:3000'
      }
    });
    
    console.log('Admin Overview Status:', overviewResponse.status);
    if (overviewResponse.ok) {
      const data = await overviewResponse.json();
      console.log('✅ Admin Overview working:', data);
    } else {
      const error = await overviewResponse.text();
      console.log('❌ Admin Overview error:', error);
    }

    // Test admin activity endpoint
    const activityResponse = await fetch('http://127.0.0.1:8787/api/admin/activity', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vLWFkbWluLTEiLCJlbWFpbCI6InNhcmFoLmFkbWluQG1pY3JvZmkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU4MTg3MjYyLCJleHAiOjE3NTgyNzM2NjJ9.7Z65Od7Tg1NbWpkcBNsV4y7RFXQYOImC4cSL9yoV9n4',
        'X-Tenant-Host': 'localhost:3000'
      }
    });
    
    console.log('Admin Activity Status:', activityResponse.status);
    if (activityResponse.ok) {
      const data = await activityResponse.json();
      console.log('✅ Admin Activity working:', data);
    } else {
      const error = await activityResponse.text();
      console.log('❌ Admin Activity error:', error);
    }

  } catch (error) {
    console.error('❌ Admin auth test failed:', error.message);
  }
};

testAdminAuth();
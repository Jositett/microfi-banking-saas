// Test frontend API calls with proper headers
const testFrontendAPI = async () => {
  try {
    console.log('Testing API calls with tenant headers...');
    
    // Test accounts endpoint
    const accountsResponse = await fetch('http://127.0.0.1:8787/api/accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vLXVzZXItMSIsImVtYWlsIjoiam9obi5kb2VAbWljcm9maS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1ODE4Njk0OSwiZXhwIjoxNzU4MjczMzQ5fQ.z_lMG8KmF_TTMdCQq_08y6x63F4x8ZFqRW_Mxxq7L9g',
        'X-Tenant-Host': 'localhost:3000'
      }
    });
    
    console.log('Accounts API Status:', accountsResponse.status);
    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      console.log('✅ Accounts API working:', accountsData);
    } else {
      const error = await accountsResponse.text();
      console.log('❌ Accounts API error:', error);
    }

    // Test transactions endpoint
    const transactionsResponse = await fetch('http://127.0.0.1:8787/api/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vLXVzZXItMSIsImVtYWlsIjoiam9obi5kb2VAbWljcm9maS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1ODE4Njk0OSwiZXhwIjoxNzU4MjczMzQ5fQ.z_lMG8KmF_TTMdCQq_08y6x63F4x8ZFqRW_Mxxq7L9g',
        'X-Tenant-Host': 'localhost:3000'
      }
    });
    
    console.log('Transactions API Status:', transactionsResponse.status);
    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();
      console.log('✅ Transactions API working:', transactionsData);
    } else {
      const error = await transactionsResponse.text();
      console.log('❌ Transactions API error:', error);
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

testFrontendAPI();
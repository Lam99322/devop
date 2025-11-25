// Backend Health Check Utility
export const checkBackendHealth = async () => {
  const healthEndpoints = [
    'http://localhost:8080/actuator/health',
    'http://localhost:8080/bookstore/actuator/health', 
    'http://localhost:8080/health',
    'http://localhost:8080/bookstore/health',
    'http://localhost:8080/api/health'
  ];

  console.log('🔍 Checking backend health...');
  
  for (const endpoint of healthEndpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET', timeout: 5000 });
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Backend is UP at ${endpoint}:`, data);
        return { status: 'UP', endpoint, data };
      }
    } catch (error) {
      console.log(`❌ Health check failed for ${endpoint}:`, error.message);
    }
  }
  
  console.log('💔 Backend appears to be DOWN or unreachable');
  return { status: 'DOWN', error: 'No health endpoint responded' };
};

export const testOrderEndpoints = async () => {
  const testEndpoints = [
    'http://localhost:8080/bookstore/orders',
    'http://localhost:8080/orders', 
    'http://localhost:8080/api/orders',
    'http://localhost:8080/bookstore/api/orders'
  ];

  console.log('🔍 Testing order endpoints...');
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(endpoint, { 
        method: 'OPTIONS',
        headers: { 'Origin': 'http://localhost:5173' }
      });
      console.log(`✅ ${endpoint} - Status: ${response.status}, CORS: ${response.headers.get('access-control-allow-origin')}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Error:`, error.message);
    }
  }
};
// Test backend authentication to get correct user roles
import axiosClient from "../api/axiosClient";
import { authAPI } from "../api/apiHelpers";

// Test different login credentials to find correct admin account
export const testBackendAuth = async () => {
  console.log("🔍 Testing backend authentication...");
  
  const testCredentials = [
    { username: "admin", password: "admin" },
    { username: "admin123", password: "admin123" },
    { username: "administrator", password: "admin" },
    { username: "root", password: "root" },
    { username: "admin", password: "123456" }
  ];
  
  const results = [];
  
  for (const cred of testCredentials) {
    try {
      console.log(`Testing: ${cred.username}/${cred.password}`);
      
      const response = await authAPI.login(cred);
      console.log(`✅ Login successful for ${cred.username}:`, response.data);
      
      // Try to decode JWT to see role info
      const token = response.data?.data?.accessToken || response.data?.accessToken;
      if (token) {
        try {
          const parts = token.split('.');
          const payload = JSON.parse(atob(parts[1] + '='.repeat((4 - parts[1].length % 4) % 4)));
          
          results.push({
            username: cred.username,
            password: cred.password,
            success: true,
            user: response.data?.data?.user || response.data?.user,
            jwtPayload: payload,
            authorities: payload.authorities || payload.roles || [],
            isAdmin: (payload.authorities || payload.roles || []).some(auth => 
              auth === 'ADMIN' || auth === 'ROLE_ADMIN' || auth.includes('ADMIN')
            )
          });
        } catch (jwtError) {
          results.push({
            username: cred.username,
            password: cred.password,
            success: true,
            error: "Failed to decode JWT",
            token: token.substring(0, 50) + "..."
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ Login failed for ${cred.username}:`, error.response?.data || error.message);
      results.push({
        username: cred.username,
        password: cred.password,
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
    }
  }
  
  return results;
};

// Get current user info from backend
export const getCurrentUserFromBackend = async () => {
  console.log("🔍 Getting current user from backend...");
  
  try {
    const response = await axiosClient.get('/users/me');
    console.log("✅ Current user from backend:", response.data);
    
    return {
      success: true,
      user: response.data?.data || response.data,
      message: "Successfully retrieved user info"
    };
  } catch (error) {
    console.error("❌ Failed to get current user:", error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      suggestion: error.response?.status === 401 ? 
        "Token expired or invalid" : 
        "Backend /users/me endpoint not available"
    };
  }
};

// Test user permissions and endpoints
export const testUserPermissions = async () => {
  console.log("🔍 Testing user permissions...");
  
  const testEndpoints = [
    { method: 'GET', url: '/users', description: 'List all users (admin only)' },
    { method: 'GET', url: '/orders/list', description: 'List all orders (admin only)' },
    { method: 'GET', url: '/books/list', description: 'List books' },
    { method: 'GET', url: '/categories/list', description: 'List categories' },
    { method: 'GET', url: '/users/me', description: 'Get current user info' }
  ];
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.url}...`);
      
      const response = endpoint.method === 'GET' ? 
        await axiosClient.get(endpoint.url) : 
        await axiosClient.post(endpoint.url);
      
      results.push({
        ...endpoint,
        success: true,
        status: response.status,
        hasData: !!response.data?.data,
        dataType: Array.isArray(response.data?.data) ? 'array' : typeof response.data?.data
      });
      
      console.log(`✅ ${endpoint.url} - Success (${response.status})`);
      
    } catch (error) {
      const status = error.response?.status;
      results.push({
        ...endpoint,
        success: false,
        status: status,
        error: error.response?.data?.message || error.message,
        meaning: status === 401 ? 'Unauthorized' : 
                status === 403 ? 'Forbidden (insufficient permissions)' :
                status === 404 ? 'Not found' : 'Unknown error'
      });
      
      console.log(`❌ ${endpoint.url} - ${status || 'No response'}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  return results;
};
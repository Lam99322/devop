// Backend connectivity and CORS checker
import axiosClient from "../api/axiosClient";

export const checkBackendConnection = async () => {
  console.log("🔍 Checking backend connection and CORS...");
  
  try {
    // Test basic connectivity
    const response = await axiosClient.get('/orders/list?pageNo=0&pageSize=1', { 
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log("✅ Backend connection successful:", response.status);
    console.log("📋 CORS headers:", response.headers);
    console.log("🔍 Response structure:", response.data);
    
    return {
      connected: true,
      status: response.status,
      corsAllowed: true,
      responseStructure: typeof response.data,
      hasApiResponse: !!response.data?.message,
      hasPageResponse: !!response.data?.data?.content
    };
    
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
    
    const result = {
      connected: false,
      status: error.response?.status || 'NO_RESPONSE',
      corsAllowed: false,
      error: error.message
    };
    
    // Analyze error type
    if (error.code === 'ERR_NETWORK') {
      result.issue = 'NETWORK_ERROR - Backend không chạy hoặc sai URL';
    } else if (error.response?.status === 0) {
      result.issue = 'CORS_ERROR - CORS không được cấu hình đúng';
    } else if (error.response?.status === 404) {
      result.issue = 'ENDPOINT_NOT_FOUND - Controller không có endpoint này';
    } else if (error.response?.status === 401) {
      result.issue = 'UNAUTHORIZED - Can JWT token';
    } else if (error.response?.status === 500) {
      result.issue = 'SERVER_ERROR - Loi trong Spring Boot application';
    } else {
      result.issue = `HTTP_ERROR_${error.response?.status}`;
    }
    
    return result;
  }
};

export const verifyOrderController = async () => {
  console.log("🔍 Verifying OrderController endpoints...");
  
  const endpoints = [
    { method: 'GET', path: '/orders/list', desc: 'Get all orders' },
    { method: 'POST', path: '/orders', desc: 'Create order' },
    { method: 'GET', path: '/orders/1', desc: 'Get order by ID' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      if (endpoint.method === 'GET') {
        const response = await axiosClient.get(endpoint.path, { timeout: 3000 });
        results.push({
          ...endpoint,
          available: true,
          status: response.status,
          responseType: typeof response.data
        });
      } else if (endpoint.method === 'POST') {
        // Just check if endpoint exists without actually creating
        try {
          await axiosClient.post(endpoint.path, {}, { timeout: 3000 });
        } catch (postError) {
          if (postError.response?.status === 400) {
            // 400 means endpoint exists but data is invalid - that's good!
            results.push({
              ...endpoint,
              available: true,
              status: 400,
              note: 'Endpoint exists (400 = bad request data)'
            });
          } else {
            throw postError;
          }
        }
      }
    } catch (error) {
      results.push({
        ...endpoint,
        available: false,
        status: error.response?.status || 'NO_RESPONSE',
        error: error.message
      });
    }
  }
  
  return results;
};

export default { checkBackendConnection, verifyOrderController };
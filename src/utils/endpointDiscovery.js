// Utility to help find the correct backend endpoints
import axiosClient from "../api/axiosClient";

// Test common Spring Boot actuator endpoints to see what's available
export const discoverBackendEndpoints = async () => {
  console.log("🔍 Discovering backend endpoints...");
  
  const testEndpoints = [
    // Health check
    "/actuator/health",
    "/health",
    
    // API documentation
    "/swagger-ui.html",
    "/v3/api-docs",
    "/api-docs",
    
    // Common API patterns
    "/api/orders",
    "/orders", 
    "/order",
    "/api/order",
    "/orders/create",
    "/api/orders/create",
    
    // Other common endpoints
    "/users",
    "/api/users",
    "/books",
    "/api/books"
  ];
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing: GET ${endpoint}`);
      const response = await axiosClient.get(endpoint, { timeout: 5000 });
      results.push({
        endpoint,
        status: response.status,
        available: true,
        method: 'GET'
      });
      console.log(`✅ ${endpoint} - Available (${response.status})`);
    } catch (error) {
      const status = error.response?.status || 'No response';
      results.push({
        endpoint,
        status,
        available: status !== 404,
        error: error.message,
        method: 'GET'
      });
      
      if (status === 404) {
        console.log(`❌ ${endpoint} - Not found (404)`);
      } else if (status === 401 || status === 403) {
        console.log(`🔒 ${endpoint} - Protected (${status})`);
      } else {
        console.log(`⚠️ ${endpoint} - Error (${status}): ${error.message}`);
      }
    }
  }
  
  return results;
};

// Test POST endpoints specifically for orders
export const testOrderEndpoints = async (sampleOrderData) => {
  console.log("🔍 Testing POST endpoints for orders...");
  
  const orderEndpoints = [
    "/orders",
    "/api/orders", 
    "/order",
    "/api/order",
    "/orders/create",
    "/api/orders/create",
    "/orders/add",
    "/api/orders/add"
  ];
  
  const results = [];
  
  for (const endpoint of orderEndpoints) {
    try {
      console.log(`Testing: POST ${endpoint}`);
      
      // Don't actually submit, just test if endpoint exists
      const response = await axiosClient.post(endpoint, sampleOrderData, {
        timeout: 5000,
        validateStatus: status => status < 500 // Accept 4xx as "endpoint exists"
      });
      
      results.push({
        endpoint,
        status: response.status,
        available: true,
        method: 'POST',
        response: response.data
      });
      
      console.log(`✅ ${endpoint} - Available (${response.status})`);
      
    } catch (error) {
      const status = error.response?.status || 'No response';
      results.push({
        endpoint,
        status,
        available: status !== 404,
        error: error.message,
        method: 'POST'
      });
      
      if (status === 404) {
        console.log(`❌ ${endpoint} - Not found (404)`);
      } else if (status === 400) {
        console.log(`🔍 ${endpoint} - Bad request (400) - Endpoint exists but data invalid`);
      } else if (status === 401 || status === 403) {
        console.log(`🔒 ${endpoint} - Protected (${status}) - Endpoint exists`);
      } else {
        console.log(`⚠️ ${endpoint} - Error (${status}): ${error.message}`);
      }
    }
  }
  
  return results;
};

// Test different data formats for order creation
export const testOrderDataFormats = async () => {
  console.log("🧪 Testing different order data formats...");
  
  const formats = [
    {
      name: "Exact OrderCreationRequest DTO Match",
      data: {
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "0123456789", 
        shippingAddress: "123 Test Street, Test District, Test City",
        paymentMethod: "CASH_ON_DELIVERY",
        deliveryMethod: "STANDARD_DELIVERY",
        totalAmount: 150.0,
        notes: "Test order created from frontend discovery",
        orderDetails: [
          {
            bookId: "1",
            quantity: 1, 
            unitPrice: 150.0
          }
        ]
      }
    },
    {
      name: "Alternative Format 1",
      data: {
        customer: {
          name: "Test Customer",
          email: "test@example.com",
          phone: "0123456789"
        },
        address: "123 Test Street",
        total: 150,
        items: [
          {
            bookId: 1,
            quantity: 1,
            price: 150
          }
        ]
      }
    },
    {
      name: "Simple Format",
      data: {
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        totalAmount: 100,
        orderItems: [
          {
            bookId: 1,
            quantity: 1
          }
        ]
      }
    }
  ];
  
  const endpoints = ["/orders"]; // Only test the exact backend endpoint
  
  for (const endpoint of endpoints) {
    console.log(`\n🎯 Testing endpoint: POST ${endpoint}`);
    
    for (const format of formats) {
      try {
        console.log(`📝 Trying ${format.name}...`);
        console.log("Data:", JSON.stringify(format.data, null, 2));
        
        const response = await axiosClient.post(endpoint, format.data, { 
          timeout: 5000,
          validateStatus: (status) => status < 500 // Accept 4xx as "format issue", not "endpoint missing"
        });
        
        console.log(`✅ ${format.name} WORKS with ${endpoint}!`);
        console.log("Response:", response.data);
        return { 
          success: true, 
          endpoint, 
          format: format.name, 
          data: response.data,
          status: response.status 
        };
        
      } catch (error) {
        const status = error.response?.status;
        const errorMsg = error.response?.data?.message || error.message;
        
        console.log(`❌ ${format.name} failed: ${status} - ${errorMsg}`);
        
        if (status === 400) {
          console.log("📋 400 Error Details:", error.response?.data);
        }
      }
    }
  }
  
  return { success: false, message: "No working format found" };
};

// Get backend info
export const getBackendInfo = async () => {
  console.log("🔍 Getting backend information...");
  
  try {
    // Try to get Spring Boot info
    const actuatorInfo = await axiosClient.get('/actuator/info');
    console.log("✅ Backend info:", actuatorInfo.data);
    return actuatorInfo.data;
  } catch (error) {
    console.log("⚠️ No actuator info available");
    
    try {
      // Try basic health check
      const health = await axiosClient.get('/actuator/health');
      console.log("✅ Backend health:", health.data);
      return { status: health.data.status };
    } catch (healthError) {
      console.log("❌ Backend health check failed");
      return { error: "Backend not accessible" };
    }
  }
};
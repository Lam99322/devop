// Debug utility for testing order creation and retrieval
import axiosClient from "../api/axiosClient";
import { orderAPI } from "../api/apiHelpers";

// Test order creation with sample data
export const testCreateOrder = async (user) => {
  console.log("🔍 Testing order creation...");
  
  const testOrderData = {
    userId: user?.id || "test-user-id",
    receiverName: "Test Customer",
    receiverPhone: "0123456789",
    address: "123 Test Street, Test District, Test City",
    paymentMethod: "CASH_ON_DELIVERY",
    total: 150000,
    orderDetails: [
      {
        bookId: "1",
        quantity: 1,
        price: 150000
      }
    ]
  };
  
  const endpoints = [
    { method: "orderAPI.create", fn: () => orderAPI.create(testOrderData) },
    { method: "orderAPI.createWithAdd", fn: () => orderAPI.createWithAdd(testOrderData) },
    { method: "POST /orders", fn: () => axiosClient.post("/orders", testOrderData) },
    { method: "POST /orders/add", fn: () => axiosClient.post("/orders/add", testOrderData) },
    { method: "POST /api/orders", fn: () => axiosClient.post("/api/orders", testOrderData) }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📤 Testing ${endpoint.method}...`);
      const response = await endpoint.fn();
      
      results.push({
        method: endpoint.method,
        success: true,
        status: response.status,
        data: response.data,
        orderId: response.data?.data?.id || response.data?.id
      });
      
      console.log(`✅ ${endpoint.method} - Success:`, response.data);
      break; // Stop at first success
      
    } catch (error) {
      results.push({
        method: endpoint.method,
        success: false,
        status: error.response?.status,
        error: error.response?.data?.message || error.message
      });
      
      console.log(`❌ ${endpoint.method} - Failed:`, error.response?.status, error.response?.data?.message);
    }
  }
  
  return results;
};

// Test order retrieval for different user types
export const testOrderRetrieval = async (user) => {
  console.log("🔍 Testing order retrieval...");
  
  const endpoints = [
    // User-specific endpoints
    { url: `/orders/user/${user?.id}`, description: "User orders by ID" },
    { url: `/orders/list/user/${user?.id}`, description: "User orders with list prefix" },
    { url: `/api/orders/user/${user?.id}`, description: "API user orders" },
    { url: `/orders?userId=${user?.id}`, description: "Orders with query param" },
    
    // Admin endpoints (if user is admin)
    { url: "/orders/list", description: "All orders (admin)" },
    { url: "/orders", description: "All orders alternative" },
    { url: "/api/orders", description: "API all orders" }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📥 Testing GET ${endpoint.url}...`);
      const response = await axiosClient.get(endpoint.url);
      
      let ordersCount = 0;
      if (response.data?.data?.content) {
        ordersCount = response.data.data.content.length;
      } else if (Array.isArray(response.data?.data)) {
        ordersCount = response.data.data.length;
      } else if (Array.isArray(response.data)) {
        ordersCount = response.data.length;
      }
      
      results.push({
        url: endpoint.url,
        description: endpoint.description,
        success: true,
        status: response.status,
        ordersCount: ordersCount,
        structure: response.data?.data ? 'nested' : 'direct',
        hasContent: ordersCount > 0
      });
      
      console.log(`✅ ${endpoint.url} - Found ${ordersCount} orders`);
      
    } catch (error) {
      results.push({
        url: endpoint.url,
        description: endpoint.description,
        success: false,
        status: error.response?.status,
        error: error.response?.data?.message || error.message
      });
      
      console.log(`❌ ${endpoint.url} - ${error.response?.status}: ${error.response?.data?.message}`);
    }
  }
  
  return results;
};

// Create a test order and then try to retrieve it
export const fullOrderTest = async (user) => {
  console.log("🔍 Running full order test (create + retrieve)...");
  
  try {
    // Step 1: Create test order
    console.log("Step 1: Creating test order...");
    const createResults = await testCreateOrder(user);
    const successfulCreate = createResults.find(r => r.success);
    
    if (!successfulCreate) {
      return {
        success: false,
        error: "Failed to create test order",
        createResults: createResults
      };
    }
    
    console.log("✅ Test order created successfully:", successfulCreate.orderId);
    
    // Step 2: Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Try to retrieve orders
    console.log("Step 2: Retrieving orders...");
    const retrieveResults = await testOrderRetrieval(user);
    const successfulRetrieves = retrieveResults.filter(r => r.success && r.hasContent);
    
    return {
      success: true,
      createResult: successfulCreate,
      retrieveResults: retrieveResults,
      workingEndpoints: successfulRetrieves,
      summary: {
        orderCreated: !!successfulCreate,
        orderId: successfulCreate.orderId,
        retrieveEndpointsWorking: successfulRetrieves.length,
        bestRetrieveEndpoint: successfulRetrieves[0]?.url
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};
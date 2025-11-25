// Simple backend connectivity test
import axiosClient from "../api/axiosClient";

export const testBackendConnection = async () => {
  console.log("🔍 Testing backend connection...");
  
  const tests = [
    { name: "Books endpoint", endpoint: "/books" },
    { name: "Categories endpoint", endpoint: "/categories" },
    { name: "Orders endpoint", endpoint: "/orders" },
    { name: "Health check", endpoint: "/actuator/health" },
    { name: "API Info", endpoint: "/api-docs" }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`📤 Testing ${test.name}: GET ${test.endpoint}`);
      const response = await axiosClient.get(test.endpoint, { timeout: 5000 });
      
      results.push({
        ...test,
        status: "SUCCESS",
        httpStatus: response.status,
        dataType: Array.isArray(response.data) ? "Array" : typeof response.data,
        dataSize: Array.isArray(response.data) ? response.data.length : Object.keys(response.data || {}).length
      });
      
      console.log(`✅ ${test.name}: ${response.status} - ${Array.isArray(response.data) ? response.data.length + " items" : "Object"}`);
      
    } catch (error) {
      results.push({
        ...test,
        status: "FAILED",
        httpStatus: error.response?.status || "NO_RESPONSE",
        error: error.message
      });
      
      console.log(`❌ ${test.name}: ${error.response?.status || "Connection failed"} - ${error.message}`);
    }
  }
  
  return results;
};

export const testOrderCreation = async () => {
  console.log("🔍 Testing order creation with minimal data...");
  
  const minimalOrder = {
    customerName: "Test Customer",
    customerEmail: "test@example.com", 
    customerPhone: "0123456789",
    shippingAddress: "Test Address, Test District, Test City",
    paymentMethod: "CASH_ON_DELIVERY",
    deliveryMethod: "STANDARD_DELIVERY",
    totalAmount: 100.0,
    orderDetails: [
      {
        bookId: "1",
        quantity: 1,
        unitPrice: 100.0
      }
    ]
  };
  
  try {
    console.log("📤 Creating test order:", JSON.stringify(minimalOrder, null, 2));
    
    const response = await axiosClient.post("/orders", minimalOrder, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log("✅ Order created successfully:", response.data);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error("❌ Order creation failed:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      sentData: minimalOrder
    });
    
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

export const testOrderRetrieval = async () => {
  console.log("🔍 Testing order retrieval...");
  
  const endpoints = [
    "/orders",
    "/orders/list", 
    "/api/orders",
    "/admin/orders"
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📤 Testing: GET ${endpoint}`);
      const response = await axiosClient.get(endpoint, { timeout: 5000 });
      
      console.log(`✅ ${endpoint}: ${response.status}`, response.data);
      
      if (response.data && (Array.isArray(response.data) || response.data.content)) {
        return { success: true, endpoint, data: response.data };
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.message}`);
    }
  }
  
  return { success: false, message: "No working endpoints found" };
};

// Run all tests
export const runFullBackendTest = async () => {
  console.log("🚀 Starting full backend test...");
  
  const results = {
    connectivity: await testBackendConnection(),
    orderCreation: await testOrderCreation(),
    orderRetrieval: await testOrderRetrieval()
  };
  
  console.log("📋 Full test results:", results);
  return results;
};
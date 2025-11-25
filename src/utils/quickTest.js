// Simple order testing utility
import axiosClient from "../api/axiosClient";

export const quickOrderTest = async () => {
  console.log("🚀 Starting quick order test...");
  
  // Test 1: Check if we can retrieve books first
  try {
    console.log("📚 Testing books endpoint...");
    const booksRes = await axiosClient.get("/books");
    console.log(`✅ Books: ${booksRes.status} - ${Array.isArray(booksRes.data) ? booksRes.data.length : 'Object'} items`);
  } catch (e) {
    console.log("❌ Books endpoint failed:", e.response?.status);
  }

  // Test 2: Try to create a minimal order
  const testOrder = {
    customerName: "Test User",
    customerEmail: "test@example.com",
    customerPhone: "0123456789",
    shippingAddress: "123 Test St, Test District, Test City",
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

  console.log("📦 Testing order creation...");
  console.log("Order data:", JSON.stringify(testOrder, null, 2));

  try {
    const orderRes = await axiosClient.post("/orders", testOrder);
    console.log("✅ Order created successfully!");
    console.log("Response:", orderRes.data);
    
    // Test 3: Try to retrieve orders
    console.log("📋 Testing order retrieval...");
    try {
      const ordersRes = await axiosClient.get("/orders");
      console.log(`✅ Orders retrieved: ${Array.isArray(ordersRes.data) ? ordersRes.data.length : 'Object'} items`);
      console.log("Orders data:", ordersRes.data);
    } catch (e) {
      console.log("❌ Order retrieval failed:", e.response?.status, e.response?.data);
    }
    
  } catch (error) {
    console.log("❌ Order creation failed!");
    console.log("Status:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.log("Full error:", error.message);
  }
};

// Test individual endpoints
export const testOrderEndpoints = async () => {
  const endpoints = [
    { method: "GET", url: "/orders" },
    { method: "GET", url: "/orders/list" },
    { method: "GET", url: "/api/orders" },
    { method: "GET", url: "/admin/orders" }
  ];

  console.log("🔍 Testing all order endpoints...");

  for (const endpoint of endpoints) {
    try {
      console.log(`📤 Testing: ${endpoint.method} ${endpoint.url}`);
      const response = await axiosClient[endpoint.method.toLowerCase()](endpoint.url);
      console.log(`✅ ${endpoint.url}: ${response.status} - Data:`, response.data);
    } catch (error) {
      console.log(`❌ ${endpoint.url}: ${error.response?.status} - ${error.message}`);
    }
  }
};

export default { quickOrderTest, testOrderEndpoints };
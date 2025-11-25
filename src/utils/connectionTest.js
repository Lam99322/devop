// Simple backend connection tester
import axiosClient from "../api/axiosClient";

export const testConnection = async () => {
  console.log("🔍 Testing backend connection...");
  
  // Test 1: Basic connectivity
  try {
    console.log("📡 Testing basic connectivity...");
    const response = await fetch("http://localhost:8080/bookstore/books/list");
    const data = await response.json();
    console.log("✅ Direct fetch works:", data);
  } catch (error) {
    console.log("❌ Direct fetch failed:", error);
  }

  // Test 2: AxiosClient
  try {
    console.log("📡 Testing with axiosClient...");
    const response = await axiosClient.get("/books/list");
    console.log("✅ AxiosClient works:", response.data);
  } catch (error) {
    console.log("❌ AxiosClient failed:", error);
    console.log("📋 Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
  }

  // Test 3: Orders endpoint
  try {
    console.log("📡 Testing orders endpoint...");
    const response = await axiosClient.get("/orders/list");
    console.log("✅ Orders endpoint works:", response.data);
  } catch (error) {
    console.log("❌ Orders endpoint failed:", error);
    console.log("📋 Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }

  // Test 4: Check auth token
  const token = document.cookie.split(';').find(c => c.trim().startsWith('authToken='));
  console.log("🔑 Auth token present:", !!token);
  if (token) {
    console.log("🔑 Token preview:", token.substring(0, 50) + "...");
  }
};

export const quickDebug = async () => {
  console.group("🚀 Quick Debug Session");
  
  // Check axios client configuration
  console.log("📋 AxiosClient baseURL:", axiosClient.defaults.baseURL);
  console.log("📋 AxiosClient headers:", axiosClient.defaults.headers);
  
  // Test orders specifically
  try {
    const endpoints = [
      "/orders/list",
      "/orders/list?pageNo=0&pageSize=10",
      "/orders"
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`📤 Testing: ${endpoint}`);
        const response = await axiosClient.get(endpoint, { timeout: 5000 });
        console.log(`✅ ${endpoint} works:`, {
          status: response.status,
          dataType: typeof response.data,
          structure: Object.keys(response.data || {}),
          hasData: !!response.data?.data,
          hasContent: !!response.data?.data?.content
        });
        break; // Stop on first success
      } catch (error) {
        console.log(`❌ ${endpoint} failed:`, error.response?.status);
      }
    }
  } catch (error) {
    console.log("❌ All endpoints failed");
  }
  
  console.groupEnd();
};

export default { testConnection, quickDebug };
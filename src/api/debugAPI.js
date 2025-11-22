// Simple API test for debugging /users/me endpoint
import { userAPI, authAPI } from "./apiHelpers.js";
import cookieUtils from "../utils/cookieUtils.js";

// Debug function để test API trực tiếp
export async function debugUserMeAPI() {
  console.log("=== DEBUG /users/me API ===");
  
  // 1. Kiểm tra token
  const token = cookieUtils.getAuthToken();
  console.log("Token from cookies:", token ? token.substring(0, 30) + "..." : "NO TOKEN");
  
  if (!token) {
    console.log("❌ No token found, need to login first");
    return;
  }
  
  // 2. Test token introspect trước
  try {
    console.log("🔍 Testing token introspect...");
    const introspectRes = await authAPI.introspect(token);
    console.log("✅ Token introspect success:", introspectRes.data);
  } catch (err) {
    console.log("❌ Token introspect failed:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
  }
  
  // 3. Test /users/me
  try {
    console.log("🔍 Testing /users/me...");
    const userRes = await userAPI.getMyInfo();
    console.log("✅ /users/me success:", userRes.data);
  } catch (err) {
    console.log("❌ /users/me failed:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      message: err.message
    });
    
    // Chi tiết lỗi 400
    if (err.response?.status === 400) {
      console.log("🔍 400 Error details:", {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers,
        baseURL: err.config?.baseURL
      });
    }
  }
}

// Test login function
export async function debugLogin(username = "admin123", password = "admin123") {
  console.log("=== DEBUG LOGIN ===");
  
  try {
    const loginRes = await authAPI.login({ username, password });
    console.log("✅ Login success:", loginRes.data);
    
    if (loginRes.data?.data?.accessToken) {
      cookieUtils.setAuthToken(loginRes.data.data.accessToken);
      console.log("✅ Token saved to cookies");
      
      // Test /users/me ngay sau khi login
      setTimeout(() => {
        debugUserMeAPI();
      }, 1000);
    }
  } catch (err) {
    console.log("❌ Login failed:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
  }
}

// Expose to window for browser console
if (typeof window !== 'undefined') {
  window.debugUserMeAPI = debugUserMeAPI;
  window.debugLogin = debugLogin;
}
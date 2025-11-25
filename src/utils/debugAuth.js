// Debug utility for authentication and user issues
import axiosClient from "../api/axiosClient";

export const debugUserAuth = async () => {
  console.log("🔍 DEBUG: Starting user authentication check...");
  
  try {
    // Test if we can get user info from backend
    const response = await axiosClient.get('/users/me');
    console.log("✅ Backend user info:", response.data);
    return {
      success: true,
      user: response.data?.data || response.data,
      message: "User authentication successful"
    };
  } catch (error) {
    console.error("❌ User authentication failed:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "User not found in backend database",
        suggestion: "Check if user ID exists in your Spring Boot database"
      };
    } else if (error.response?.status === 401) {
      return {
        success: false,
        error: "Token invalid or expired",
        suggestion: "Please login again"
      };
    } else if (error.response?.status === 400) {
      return {
        success: false,
        error: "Bad request - check API endpoint",
        suggestion: "Backend /users/me endpoint might not be properly configured"
      };
    }
    
    return {
      success: false,
      error: error.message,
      suggestion: "Check backend connectivity"
    };
  }
};

export const debugBackendUsers = async () => {
  console.log("🔍 DEBUG: Checking backend users...");
  
  try {
    // Try to get all users (admin endpoint)
    const response = await axiosClient.get('/users');
    console.log("✅ Backend users list:", response.data);
    
    return {
      success: true,
      users: response.data?.data || response.data,
      message: "Successfully retrieved users from backend"
    };
  } catch (error) {
    console.error("❌ Failed to get users:", error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      suggestion: "Admin might not have access to users endpoint or endpoint doesn't exist"
    };
  }
};

export const testCreateUser = async () => {
  console.log("🔍 DEBUG: Testing user creation...");
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: "test123",
    email: `test${Date.now()}@example.com`,
    name: "Test User"
  };
  
  try {
    const response = await axiosClient.post('/users/register', testUser);
    console.log("✅ Test user created:", response.data);
    
    return {
      success: true,
      user: response.data?.data || response.data,
      message: "Test user created successfully"
    };
  } catch (error) {
    console.error("❌ Failed to create test user:", error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      suggestion: "Check user registration endpoint"
    };
  }
};

// Check if current logged-in user exists in backend
export const verifyCurrentUser = async (userId) => {
  console.log(`🔍 DEBUG: Verifying user ID ${userId} exists in backend...`);
  
  try {
    // Try to get specific user info
    const response = await axiosClient.get(`/users/${userId}`);
    console.log("✅ User exists in backend:", response.data);
    
    return {
      success: true,
      user: response.data?.data || response.data,
      message: "User exists in backend database"
    };
  } catch (error) {
    console.error(`❌ User ${userId} verification failed:`, error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return {
        success: false,
        error: `User ID ${userId} does not exist in backend database`,
        suggestion: "The frontend user ID doesn't match any user in the backend. You may need to register this user or use correct login credentials."
      };
    } else if (error.response?.status === 403) {
      console.log("⚠️ 403 Forbidden - User doesn't have permission to access user endpoints");
      return {
        success: true, // Don't block checkout for permission issues
        warning: true,
        message: "User verification skipped due to permission restrictions",
        suggestion: "This is normal for non-admin users. Backend security prevents access to user management endpoints."
      };
    }
    
    return {
      success: false,
      error: error.message,
      suggestion: "Check backend user management endpoints"
    };
  }
};

import { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { userAPI, authAPI } from "../api/apiHelpers";
import cookieUtils from "../utils/cookieUtils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => cookieUtils.getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  // Note: Axios interceptor is already set up in axiosClient.js
  // No need to duplicate here

  // =============================
  // Fetch thông tin user từ /users/me
  // =============================
   const fetchUserProfile = async (jwtToken) => {
    if (!jwtToken) return setIsLoading(false);

    console.log("🔍 AuthContext: Fetching user profile with token:", jwtToken ? jwtToken.substring(0, 20) + "..." : "missing");
    
    // Debug: kiểm tra token trong cookie
    const cookieToken = cookieUtils.getAuthToken();
    console.log("🍪 AuthContext: Token from cookie:", cookieToken ? cookieToken.substring(0, 20) + "..." : "missing");

    try {
      const res = await userAPI.getMyInfo();
      console.log("✅ AuthContext: User profile response:", res.data);
      
      // Merge với thông tin user hiện tại để giữ role
      const profileData = res.data.data;
      setUser(prevUser => ({
        ...prevUser,
        ...profileData,
        // Giữ role nếu profile không có
        role: profileData.role || prevUser?.role || 'ADMIN',
        roles: profileData.roles || prevUser?.roles || [{ name: 'ADMIN' }]
      }));
    } catch (err) {
      console.error("❌ AuthContext: Failed to fetch user info:", err.response?.data || err);
      console.error("❌ AuthContext: Error status:", err.response?.status);
      
      // Debug thêm cho lỗi 400
      if (err.response?.status === 400) {
        console.error("❌ AuthContext: 400 Bad Request details:", {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers,
          baseURL: err.config?.baseURL,
          data: err.response?.data
        });
      }
      
      // Chỉ logout nếu là lỗi 401 (Unauthorized), với 400 thì giữ user hiện tại
      if (err.response?.status === 401) {
        console.log("🔄 AuthContext: Token expired, logging out...");
        logout(); // token sai → logout
      } else {
        console.log("📋 AuthContext: Keeping current user due to API error");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    // Disable profile fetching due to backend 400 error
    // Just set loading to false if we have a token
    console.log("🔍 AuthContext: Token state changed:", token ? "exists" : "missing");
    setIsLoading(false);
    
    // Note: Profile fetching disabled due to backend /users/me returning 400
    // User info will come from login response only
  }, [token]);

  // =============================
  // Login
  // =============================
  const login = (userData, jwt) => {
    console.log("🔐 AuthContext: Login called with:", { userData, hasToken: !!jwt });
    
    cookieUtils.setAuthToken(jwt);
    setToken(jwt);
    
    // Use provided userData directly, with minimal fallbacks
    const userInfo = {
      ...userData, // Use whatever was provided from login
      // Only add fallbacks for missing critical fields
      avatar: userData.avatar || `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&name=${encodeURIComponent(userData.name || userData.username || 'User')}`,
      status: userData.status || 'ACTIVE',
      // Preserve role information exactly as provided from login
      role: userData.role,
      roles: userData.roles
    };
    
    console.log("✅ AuthContext: Setting user with roles:", {
      id: userInfo.id,
      username: userInfo.username, 
      role: userInfo.role,
      roles: userInfo.roles
    });
    setUser(userInfo);
  };

  // =============================
  // Logout
  // =============================
  const logout = async (clearAllData = false) => {
    try {
      const token = cookieUtils.getAuthToken();
      if (token) {
        // Backend yêu cầu token trong body cho logout
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn logout dù API lỗi
    } finally {
      console.log("🧹 Logging out user...");
      
      // Always clear authentication
      cookieUtils.removeAuthToken();
      setUser(null);
      setToken(null);
      
      if (clearAllData) {
        console.log("🗑️ Clearing all user data...");
        
        // Clear all cookies
        cookieUtils.clearAll();
        
        // Clear localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('user_preferences');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        console.log("✅ All user data cleared");
      } else {
        console.log("💾 Keeping user data for next login");
      }
    }
  };

  // =============================
  // Provider value
  // =============================
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

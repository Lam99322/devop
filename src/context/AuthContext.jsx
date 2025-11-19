import { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import cookieUtils from "../utils/cookieUtils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const savedToken = cookieUtils.getAuthToken();
    console.log("Initial token from cookie:", savedToken);
    return savedToken;
  });
  const [isLoading, setIsLoading] = useState(true);

  

  const login = (userData, jwt) => {
    console.log("Logging in user:", userData, jwt);
    // Set auth token using utility function with secure options
    cookieUtils.setAuthToken(jwt);
    setToken(jwt);
    setUser(userData);
    
    // Debug: verify cookie was set
    setTimeout(() => {
      const verifyToken = cookieUtils.getAuthToken();
      console.log("Cookie verification after login:", verifyToken);
      cookieUtils.debugCookies();
    }, 100);
  };

  const logout = () => {
    console.log("Logging out user");
    
    // Clear auth token cookie
    cookieUtils.removeAuthToken();
    
    // Clear state
    setToken(null);
    setUser(null);
    setIsLoading(false);
    
    // Debug: verify cookie was removed
    setTimeout(() => {
      const remainingToken = cookieUtils.getAuthToken();
      console.log("Cookie verification after logout:", remainingToken);
      if (!remainingToken) {
        console.log("✅ Auth token successfully removed from cookies");
      } else {
        console.error("❌ Auth token still exists in cookies:", remainingToken);
      }
    }, 100);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

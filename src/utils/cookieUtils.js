import Cookies from "js-cookie";

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // More permissive in development
  path: "/" // Available across the entire site
};

// Cookie names
export const COOKIE_NAMES = {
  AUTH_TOKEN: "auth_token",
  USER_PREFERENCES: "user_preferences",
  CART_ID: "cart_id"
};

// Cookie utility functions
export const cookieUtils = {
  // Set a cookie with default security options
  set: (name, value, options = {}) => {
    const config = { ...COOKIE_CONFIG, ...options };
    Cookies.set(name, value, config);
  },

  // Get a cookie value
  get: (name) => {
    return Cookies.get(name);
  },

  // Remove a cookie
  remove: (name, options = {}) => {
    const config = { path: COOKIE_CONFIG.path, ...options };
    Cookies.remove(name, config);
  },

  // Check if a cookie exists
  exists: (name) => {
    return Cookies.get(name) !== undefined;
  },

  // Set auth token with security options
  setAuthToken: (token) => {
    cookieUtils.set(COOKIE_NAMES.AUTH_TOKEN, token);
  },

  // Get auth token
  getAuthToken: () => {
    return cookieUtils.get(COOKIE_NAMES.AUTH_TOKEN);
  },

  // Remove auth token
  removeAuthToken: () => {
    cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
  },

  // Clear all cookies (for logout)
  clearAll: () => {
    Object.values(COOKIE_NAMES).forEach(cookieName => {
      cookieUtils.remove(cookieName);
    });
  },

  // Debug function to log all cookies (development only)
  debugCookies: () => {
    if (process.env.NODE_ENV === "development") {
      console.log("Current cookies:", {
        authToken: cookieUtils.getAuthToken(),
        allCookies: Cookies.get()
      });
    }
  }
};

export default cookieUtils;
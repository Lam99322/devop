import axios from "axios";
import cookieUtils from "../utils/cookieUtils";

const BASE_URL = "https://bookstorebackend.duckdns.org/bookstore"; 

// 🔹 Client cho các request cần token
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Thêm token vào header Authorization nếu có
axiosClient.interceptors.request.use((config) => {
  console.log("📤 AxiosClient REQUEST:", {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL}${config.url}`,
    headers: config.headers,
    data: config.data
  });
  
  const token = cookieUtils.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔑 AxiosClient: Adding token to request:", config.url, "Token:", token.substring(0, 20) + "...");
  } else {
    console.log("❌ AxiosClient: No token found for request:", config.url);
  }
  return config;
});

// Xử lý response, tự động logout nếu 401
axiosClient.interceptors.response.use(
  (res) => {
    console.log("📥 AxiosClient SUCCESS RESPONSE:", {
      method: res.config?.method?.toUpperCase(),
      url: `${res.config?.baseURL}${res.config?.url}`,
      status: res.status,
      statusText: res.statusText,
      dataType: typeof res.data,
      dataStructure: res.data ? Object.keys(res.data) : null,
      data: res.data
    });
    return res;
  },
  async (error) => {
    console.log("❌ AxiosClient ERROR RESPONSE:", {
      method: error.config?.method?.toUpperCase(),
      url: `${error.config?.baseURL}${error.config?.url}`,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    
    // Use error analysis utility for detailed logging
    try {
      const { analyzeError } = await import("../utils/errorAnalysis");
      const analysis = analyzeError(error, `${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.log("💡 Suggestion:", analysis.suggestion);
    } catch (importError) {
      console.log("⚠️ Could not import error analysis utility");
    }
    
    if (error.response?.status === 401) {
      cookieUtils.removeAuthToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

// 🔹 Client public cho login/register, không cần token
export const axiosClientPublic = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
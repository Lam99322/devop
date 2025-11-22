import axios from "axios";
import cookieUtils from "../utils/cookieUtils";

// 🔹 Client cho các request cần token
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/bookstore",
  headers: { "Content-Type": "application/json" },
});

// Thêm token vào header Authorization nếu có
axiosClient.interceptors.request.use((config) => {
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
  (res) => res,
  (error) => {
    console.log("❌ AxiosClient Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
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
  baseURL: "http://localhost:8080/bookstore",
  headers: { "Content-Type": "application/json" },
});

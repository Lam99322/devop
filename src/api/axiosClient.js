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
  }
  return config;
});

// Xử lý response, tự động logout nếu 401
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
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

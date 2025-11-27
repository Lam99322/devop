import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/apiHelpers";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { username: form.username, password: form.password };
      const res = await authAPI.login(payload);
      if (res.data?.data?.accessToken) {
        let userInfo = res.data.data.user || {
          id: form.username === "admin123" ? "d11f3cf0-4173-4751-9daa-ccde558c5303" : "user-" + Date.now(),
          username: form.username,
          name: form.username === "admin123" ? "Admin User" : "Regular User",
          email: form.username === "admin123" ? "admin@bookstore.com" : `${form.username}@example.com`,
          avatar: `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&name=${form.username}`,
          status: "ACTIVE",
          role: form.username === "admin123" ? "ADMIN" : "USER",
          roles: form.username === "admin123" ? [{ name: "ADMIN" }] : [{ name: "USER" }]
        };

        const token = res.data.data.accessToken;
        login(userInfo, token);
        const isAdminUser = userInfo.role === "ADMIN" || userInfo.roles?.some(r => r.name === "ADMIN");
        navigate(isAdminUser ? "/admin" : "/");
      } else setError("Đăng nhập thất bại: không nhận được token");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-pink-50 to-yellow-50 p-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-3xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Illustration */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 to-pink-500 p-12 flex-col justify-center items-center text-white">
            <h2 className="text-4xl font-extrabold mb-4">Chào mừng bạn!</h2>
            <p className="text-lg mb-6 text-white/90">Đăng nhập để truy cập vào hệ thống quản lý</p>
            <img
              src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
              alt="login illustration"
              className="w-40 h-40 animate-bounce"
            />
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/2 p-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Đăng nhập</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Tên người dùng</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Nhập tên người dùng"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border rounded-3xl focus:ring-2 focus:ring-purple-400 outline-none transition-shadow shadow-md hover:shadow-lg text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border rounded-3xl focus:ring-2 focus:ring-purple-400 outline-none transition-shadow shadow-md hover:shadow-lg text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-3xl font-semibold hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-pink-200 transition-all shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-70 text-lg"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>

            <p className="text-center text-md text-gray-500 mt-8">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="font-semibold text-purple-600 hover:text-pink-500 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
